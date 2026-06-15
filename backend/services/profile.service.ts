import { prisma } from '../db/prisma';
import { UserProfile, ProfileUpdatePayload, OnboardingCompletePayload } from '../types/api.types';
import { generateSalt, derivePinHash } from '../utils/encryption';

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

export async function getProfile(userId: string): Promise<UserProfile> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new Error('User not found');
  }
  return toUserProfile(user);
}

export async function updateProfile(userId: string, data: ProfileUpdatePayload): Promise<UserProfile> {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      avatar: data.avatar,
      phone: data.phone,
      dob: data.dob ? new Date(data.dob) : undefined,
    },
  });
  return toUserProfile(updatedUser);
}

export async function completeOnboarding(userId: string, data: OnboardingCompletePayload): Promise<UserProfile> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new Error('User not found');
  }

  const salt = generateSalt(32);
  const masterPinHash = await derivePinHash(data.masterPin, salt);

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      avatar: data.avatar,
      phone: data.phone,
      dob: data.dob ? new Date(data.dob) : undefined,
      masterPinHash,
      masterPinSalt: salt,
      profileComplete: true,
      tokenVersion: { increment: 1 },
    },
  });

  return toUserProfile(updatedUser);
}
