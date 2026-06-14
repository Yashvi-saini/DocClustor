// ─── User Service (Server-Side) ────────────────────────────────────────────────
//
// WHY THIS FILE EXISTS:
// Handles all database operations related to the User model.
// Called by API routes like GET /api/users/me and PATCH /api/users/me
// ──────────────────────────────────────────────────────────────────────────────

import { prisma } from '../db/prisma';
import { UserProfile } from '../types/api.types';

// ── Get user by ID ────────────────────────────────────────────────────────────
export async function getUserById(userId: string): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  return user;
}

// ── Update user profile ───────────────────────────────────────────────────────
export async function updateUserProfile(
  userId: string,
  data: { name?: string }
): Promise<UserProfile> {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  return user;
}
