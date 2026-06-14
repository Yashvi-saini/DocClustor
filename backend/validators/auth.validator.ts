// ─── Auth Input Validators ─────────────────────────────────────────────────────
//
// WHY THIS FILE EXISTS:
// NEVER trust data coming from the client. Users can send literally anything.
// Before processing a login/register request, we validate that the data
// matches what we expect (valid email format, password length, etc.)
//
// We use Zod — a TypeScript-first validation library already in your project.
// It's like a bouncer at a club: checks IDs before letting anyone in.
// ──────────────────────────────────────────────────────────────────────────────

import { z } from 'zod';

// ── Register Validation ────────────────────────────────────────────────────────
export const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['COMPANY', 'INDIVIDUAL']).optional().default('INDIVIDUAL'),
});

// ── Login Validation ───────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ── OTP Validation ─────────────────────────────────────────────────────────────
export const otpSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});

// ── Helper: Run validation and return clean errors ─────────────────────────────
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { data: T; errors: null } | { data: null; errors: Record<string, string[]> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { data: result.data, errors: null };
  }
  // Format Zod errors into a clean { fieldName: ["error1", "error2"] } object
  const errors: Record<string, string[]> = {};
  result.error.issues.forEach((issue) => {
    const field = issue.path.join('.');
    if (!errors[field]) errors[field] = [];
    errors[field].push(issue.message);
  });
  return { data: null, errors };
}
