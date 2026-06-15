import { prisma } from '../db/prisma';
import { RegisterPayload, LoginPayload, UserProfile } from '../types/api.types';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function createToken(payload: {
  userId: string;
  email: string;
  profileComplete: boolean;
  tokenVersion: number;
}) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secret);
}

function toUserProfile(user: {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  phone: string | null;
  dob: Date | null;
  profileComplete: boolean;
  digilockerLinked: boolean;
  createdAt: Date;
}): UserProfile {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    phone: user.phone,
    dob: user.dob,
    profileComplete: user.profileComplete,
    digilockerLinked: user.digilockerLinked,
    createdAt: user.createdAt,
  };
}

export async function registerUser(data: RegisterPayload): Promise<{ user: UserProfile; token: string }> {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    if (existing.emailVerified) {
      throw new Error('A user with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.update({
      where: { email: data.email },
      data: {
        name: data.name,
        password: hashedPassword,
      },
    });

    const token = await createToken({
      userId: user.id,
      email: user.email,
      profileComplete: user.profileComplete,
      tokenVersion: user.tokenVersion,
    });
    return { user: toUserProfile(user), token };
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword,
      emailVerified: false,
      profileComplete: false,
    },
  });

  const token = await createToken({
    userId: user.id,
    email: user.email,
    profileComplete: user.profileComplete,
    tokenVersion: user.tokenVersion,
  });

  return { user: toUserProfile(user), token };
}

export async function loginUser(data: LoginPayload): Promise<{ user: UserProfile; token: string }> {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !user.password) {
    throw new Error('Invalid email or password');
  }

  const passwordMatch = await bcrypt.compare(data.password, user.password);
  if (!passwordMatch) {
    throw new Error('Invalid email or password');
  }

  if (!user.emailVerified) {
    throw new Error('Email not verified. Please verify your email first.');
  }

  const token = await createToken({
    userId: user.id,
    email: user.email,
    profileComplete: user.profileComplete,
    tokenVersion: user.tokenVersion,
  });

  return { user: toUserProfile(user), token };
}

export async function markEmailAsVerified(email: string): Promise<{ user: UserProfile; token: string }> {
  const user = await prisma.user.update({
    where: { email },
    data: { emailVerified: true },
  });

  const token = await createToken({
    userId: user.id,
    email: user.email,
    profileComplete: user.profileComplete,
    tokenVersion: user.tokenVersion,
  });

  return { user: toUserProfile(user), token };
}

export async function resetUserPassword(email: string, password: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('User not found');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
      tokenVersion: { increment: 1 }, // Invalidates existing sessions
    },
  });

  return true;
}

export async function verifyTokenVersion(userId: string, tokenVersion: number): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tokenVersion: true },
  });
  if (!user) return false;
  return user.tokenVersion === tokenVersion;
}
