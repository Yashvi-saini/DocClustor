export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// Auth 

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface OtpPayload {
  email: string;
  otp: string;
}

//JWT
export interface JwtPayload {
  userId: string;
  email: string;
  profileComplete: boolean;
  tokenVersion: number;     // S4: for instant session revocation
  iat?: number;
  exp?: number;
}

//User Profile 

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  phone: string | null;
  dob: Date | null;
  profileComplete: boolean;
  digilockerLinked: boolean;
  createdAt: Date;
}

export interface ProfileUpdatePayload {
  name?: string;
  avatar?: string;
  phone?: string;
  dob?: string;     // ISO date string
}

// Data sent when completing the onboarding wizard
export interface OnboardingCompletePayload {
  avatar?: string;
  phone?: string;
  dob?: string;       // ISO date string
  masterPin: string;   // 4-6 digit PIN (will be PBKDF2-hashed server-side)
}

// Workspace 

export type WorkspaceContext =
  | { type: 'personal'; userId: string }
  | { type: 'org'; orgId: string; userId: string; memberRole: string };

// What the workspace list API returns
export interface WorkspaceListItem {
  type: 'personal' | 'org';
  id: string;           // userId for personal, orgId for org
  name: string;         // "Personal Space" or org name
  logo?: string | null;
  role?: string;        // OrgRole for org workspaces
}

// Organisation

export interface OrgCreatePayload {
  name: string;
  cin?: string;
  gstin?: string;
  industry?: string;
  logo?: string;
}

export interface OrgInvitePayload {
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
}

//Documents 

export interface DocumentUploadPayload {
  title: string;
  content: string;       // base64 or text content
  type: 'PDF' | 'TEXT' | 'DOCX' | 'IMAGE';
  visibility?: 'SHARED' | 'PRIVATE' | 'ADMIN_ONLY';
}
