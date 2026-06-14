import { prisma } from '../db/prisma';
import { sendOtpEmail } from './email.service';

function generateNumericOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createAndSendOtp(email: string, purpose: string): Promise<boolean> {
  const otp = generateNumericOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otpVerification.upsert({
    where: {
      email_purpose: {
        email,
        purpose,
      },
    },
    update: {
      otp,
      expiresAt,
      createdAt: new Date(),
    },
    create: {
      email,
      otp,
      purpose,
      expiresAt,
    },
  });

  await sendOtpEmail(email, otp, purpose);
  return true;
}

export async function verifyOtpInDb(email: string, otp: string, purpose: string): Promise<boolean> {
  const record = await prisma.otpVerification.findUnique({
    where: {
      email_purpose: {
        email,
        purpose,
      },
    },
  });

  if (!record) {
    return false;
  }

  const isMatch = record.otp === otp;
  const isNotExpired = new Date() < record.expiresAt;

  if (isMatch && isNotExpired) {
    await prisma.otpVerification.delete({
      where: {
        email_purpose: {
          email,
          purpose,
        },
      },
    });
    return true;
  }

  return false;
}
