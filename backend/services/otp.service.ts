import crypto from 'crypto';
import { prisma } from '../db/prisma';
import { sendOtpEmail } from './email.service';

export const OTP_PURPOSES = ['register', 'login', 'forgot', 'reset_locker_pin'] as const;
export type OtpPurpose = (typeof OTP_PURPOSES)[number];

export function isOtpPurpose(value: unknown): value is OtpPurpose {
  return typeof value === 'string' && (OTP_PURPOSES as readonly string[]).includes(value);
}

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 45 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

function hashOtp(email: string, purpose: string, otp: string): string {
  const pepper = process.env.CRYPTO_PEPPER || process.env.JWT_SECRET || '';
  return crypto.createHash('sha256').update(`${pepper}:${email}:${purpose}:${otp}`).digest('hex');
}

function generateNumericOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function createAndSendOtp(rawEmail: string, purpose: OtpPurpose): Promise<boolean> {
  const email = normalizeEmail(rawEmail);

  const existing = await prisma.otpVerification.findUnique({
    where: { email_purpose: { email, purpose } },
    select: { createdAt: true },
  });
  if (existing && Date.now() - existing.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    const err = new Error('Please wait a moment before requesting another code.');
    (err as Error & { status?: number }).status = 429;
    throw err;
  }

  const otp = generateNumericOtp();
  const stored = `${hashOtp(email, purpose, otp)}:0`;
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.otpVerification.upsert({
    where: { email_purpose: { email, purpose } },
    update: { otp: stored, expiresAt, createdAt: new Date() },
    create: { email, otp: stored, purpose, expiresAt },
  });

  await sendOtpEmail(email, otp, purpose);
  return true;
}

export async function verifyOtpInDb(rawEmail: string, otp: string, purpose: OtpPurpose): Promise<boolean> {
  const email = normalizeEmail(rawEmail);
  const where = { email_purpose: { email, purpose } };

  const record = await prisma.otpVerification.findUnique({ where });
  if (!record) return false;

  if (new Date() >= record.expiresAt) {
    await prisma.otpVerification.delete({ where }).catch(() => undefined);
    return false;
  }

  const [storedHash, attemptsRaw] = record.otp.split(':');
  const attempts = parseInt(attemptsRaw || '0', 10) || 0;
  if (!storedHash || attempts >= MAX_VERIFY_ATTEMPTS) {
    await prisma.otpVerification.delete({ where }).catch(() => undefined);
    return false;
  }

  const candidate = Buffer.from(hashOtp(email, purpose, String(otp)), 'hex');
  const expected = Buffer.from(storedHash, 'hex');
  const isMatch = candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);

  if (!isMatch) {
    await prisma.otpVerification
      .update({ where, data: { otp: `${storedHash}:${attempts + 1}` } })
      .catch(() => undefined);
    return false;
  }

  const { count } = await prisma.otpVerification.deleteMany({
    where: { email, purpose, otp: record.otp },
  });
  return count === 1;
}
