import { prisma } from '../db/prisma';
import { UserProfile } from '../types/api.types';

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

export async function getUserById(userId: string): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) return null;
  return toUserProfile(user);
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string }
): Promise<UserProfile> {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });
  return toUserProfile(user);
}
