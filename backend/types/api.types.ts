// ─── Server-Side TypeScript Types ─────────────────────────────────────────────
//
// WHY THIS FILE EXISTS:
// These types are used ONLY by our backend (API routes + services).
// They describe the shape of request bodies, responses, and internal data.
// Keeping them here separate from frontend types prevents accidentally
// importing server-only code into browser bundles.
// ──────────────────────────────────────────────────────────────────────────────

// ── Standard API Response wrapper ───────────────────────────────────────────
export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  role: 'COMPANY' | 'INDIVIDUAL';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface OtpPayload {
  email: string;
  otp: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// ── User ─────────────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
}

// ── Documents ────────────────────────────────────────────────────────────────
export interface DocumentUploadPayload {
  title: string;
  content: string; // base64 or text content
  type: 'PDF' | 'TEXT' | 'DOCX';
}
