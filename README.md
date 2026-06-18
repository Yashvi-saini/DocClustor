<p align="center">
  <img src="public/favicon.svg" width="80" alt="DocClustor Logo" />
</p>

<h1 align="center">DocClustor</h1>

<p align="center">
  <strong>Secure, Workspace-Aware RAG & Zero-Knowledge Document Locker</strong>
</p>

<p align="center">
  A production-grade, multi-tenant document intelligence platform with workspace-isolated AI retrieval,<br/>
  zero-knowledge encryption vaults, granular RBAC, and a modern enterprise-ready UI.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/AES--256--GCM-Encrypted-green" alt="AES-256-GCM" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Security Model](#security-model)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)

---

## Overview

**DocClustor** is a full-stack SaaS platform that combines secure document management with AI-powered knowledge retrieval. It is architected around a **workspace-aware** paradigm where every operation — from file uploads to AI queries — is scoped and isolated to the user's active workspace context (Personal or Organization).

Unlike generic document storage tools, DocClustor enforces **zero-knowledge encryption** for its Locker system, meaning that encryption keys are derived at runtime from the user's PIN and are **never persisted** to the database. Combined with a **workspace-isolated RAG pipeline** powered by Gemini, it ensures that AI responses never leak data across tenant boundaries.

### Who is this for?

- **Legal teams** who need to query across contracts without reading 60+ page PDFs
- **Engineering teams** managing sensitive technical specifications and compliance documents
- **Startups** looking for a secure, self-hosted document vault with AI search capabilities
- **Enterprises** requiring SOC-2 aligned audit trails, RBAC, and multi-tenant data isolation

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                             │
│   Next.js App Router · React 19 · Tailwind v4 · Framer Motion       │
├─────────────────────────────────────────────────────────────────────┤
│                     Edge Middleware (jose JWT)                      │
│   Route protection · Profile-gate · Token verification · RBAC       │
├─────────────────────────────────────────────────────────────────────┤
│                     API Layer (Next.js Route Handlers)              │
│   /api/auth/* · /api/documents/* · /api/locker/* · /api/rag/*       │
│   /api/workspaces/* · /api/profile/* · /api/users/*                 │
├─────────────────────────────────────────────────────────────────────┤
│                     Backend Services Layer                          │
│   auth.service · document.service · locker.service · rag.service    │
│   workspace.service · email.service · otp.service · profile.service │
├─────────────────────────────────────────────────────────────────────┤
│                     Security & Middleware Layer                     │
│   JWT Auth Middleware · Workspace Context Middleware                │
│   PBKDF2 Key Derivation · AES-256-GCM Encryption Engine             │
├─────────────────────────────────────────────────────────────────────┤
│                     Data Layer                                      │
│   PostgreSQL (Supabase) · Prisma ORM v7 · Connection Pooling        │
├─────────────────────────────────────────────────────────────────────┤
│                     External Services                               │
│   Google Gemini 2.5 Flash · Google OAuth · GitHub OAuth             │
│   Nodemailer SMTP · DiceBear Avatars                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Key Features

### 1. Workspace-Aware Architecture

The platform supports two workspace types — **Personal** and **Organization** — with a unified dashboard that dynamically adapts its UI, permissions, and data scope based on the active workspace.

| Aspect | Personal Space | Organization Space |
|--------|---------------|-------------------|
| Data Ownership | User-scoped | Org-scoped |
| Access Control | Private (single user) | RBAC (Owner → Admin → Editor → Viewer) |
| Locker | Personal vault | Shared org vault |
| RAG Bot | Queries personal docs | Queries org docs respecting visibility |
| Audit Logs | Not logged | Full compliance trail |

- **Multi-Tenant Isolation:** Every API request passes through `requireWorkspace()` middleware that cross-references the user's JWT against their `OrgMembership` record in the database. Attempting to access an organization you don't belong to returns `403 Forbidden`.
- **Context Header Protocol:** Frontend sends `X-Workspace-Context: personal` or `X-Workspace-Context: org:<orgId>` with every API call, establishing a cryptographically verified workspace scope.

### 2. Zero-Knowledge Document Locker

A PIN-protected, encrypted vault system where the server **never stores or knows** the encryption key.

| Security Layer | Implementation |
|---------------|---------------|
| **Key Derivation** | PBKDF2-SHA512, 600,000 iterations |
| **Key Composition** | `PIN + per-locker 32-byte salt + server-side CRYPTO_PEPPER` |
| **Symmetric Encryption** | AES-256-GCM with random 12-byte IV per file |
| **Brute-Force Protection** | 15-minute lockout after 5 consecutive failed PIN entries |
| **Key Storage** | ❌ Keys are **never** persisted — derived at runtime only |
| **PIN Reset** | OTP-verified flow with new salt generation |

```
User PIN (runtime) ──┐
Per-Locker Salt ─────┼──► PBKDF2(600k iterations, SHA-512) ──► Derived Key
Server Pepper ───────┘                                          │
                                                                ▼
                                                        AES-256-GCM Encrypt
                                                       (random 12-byte IV)
```

### 3. Granular Document Visibility (Organization Space)

Three visibility tiers enforce strict access control at the document level:

| Visibility | Owner/Admin | Editor | Viewer | Uploader |
|-----------|-------------|--------|--------|----------|
| `SHARED` | ✅ Read/Delete | ✅ Read | ✅ Read | ✅ Full |
| `ADMIN_ONLY` | ✅ Read/Delete | ❌ | ❌ | ✅ Full |
| `PRIVATE` | ❌ (unless uploader) | ❌ | ❌ | ✅ Full |

> **Key Design Decision:** `PRIVATE` documents are invisible to everyone — including Organization Owners — unless they are the original uploader. This enforces true data sovereignty within shared workspaces.

### 4. Workspace-Isolated RAG Bot

The AI assistant uses a Retrieval-Augmented Generation (RAG) pipeline that **only retrieves context from documents the user is authorized to view** in their active workspace.

- **Document Chunking:** Text content is split into overlapping 120-word chunks (30-word overlap) for fine-grained retrieval
- **TF-IDF Scoring:** Lightweight in-process TF-IDF ranking with IDF weighting selects the top-4 most relevant chunks
- **LLM Synthesis:** Top chunks are sent to **Google Gemini 2.5 Flash** with a strict system prompt that prohibits hallucination and mandates source citation
- **Cross-Workspace Search:** Optional mode searches across all workspaces the user has access to
- **Locker-Aware Filtering:** Locked documents are excluded from RAG unless the locker is actively unlocked in the current session
- **Graceful Fallback:** If no documents exist, the bot switches to general knowledge mode with a polite suggestion to upload files

### 5. Full Authentication System

| Method | Implementation |
|--------|---------------|
| **Email/Password** | bcrypt (12 rounds) + email OTP verification |
| **Google OAuth** | Authorization code flow via Google APIs |
| **GitHub OAuth** | Authorization code flow via GitHub APIs |
| **JWT Tokens** | HS256 signed via `jose`, stored in HttpOnly cookies |
| **Session Revocation** | `tokenVersion` counter — increment to invalidate all sessions |
| **Password Reset** | OTP-gated flow with `reset_authorized` cookie guard |
| **Profile Onboarding** | Mandatory wizard before dashboard access (name, avatar, phone, DOB, master PIN) |

### 6. Organization Management

- **Create Organizations** with CIN, GSTIN, industry classification, and custom logo
- **Invite Members** by email with role assignment (Admin, Editor, Viewer)
- **Accept/Decline Invitations** — members see pending invitations in their workspace list
- **Role-Based Settings Access** — only Owners can edit org details; only Owners/Admins can invite members
- **Audit Logging** — every significant action (doc upload, locker access, member join) is recorded with timestamp, user ID, action type, and client IP

### 7. Document Management

- **Multi-format Upload:** PDF, TXT, DOCX, and image files
- **Real-time Text Extraction** for RAG indexing
- **File Size Tracking** and MIME type validation
- **Lock/Unlock Individual Documents** into the workspace locker
- **Delete with Authorization Checks** — only uploaders or authorized admins can delete

---

## Security Model

DocClustor follows a **defense-in-depth** approach across every layer of the stack:

### Authentication & Session Layer
- **Edge Middleware** intercepts all non-public routes and verifies JWT integrity using `jose.jwtVerify()` before the request reaches any API handler
- **Token Version Counter** enables instant session revocation — changing your password increments `tokenVersion`, invalidating all existing JWTs
- **HttpOnly Secure Cookies** prevent XSS-based token theft
- **Profile Completion Gate** — authenticated users without completed profiles are redirected to onboarding, preventing access to dashboard routes

### Data Access Layer
- **Workspace Context Middleware** performs a hardened database cross-reference on every request, verifying the user's `OrgMembership` status and role before granting access
- **Document Visibility Engine** applies layered filtering (SHARED → ADMIN_ONLY → PRIVATE) based on the requester's role and uploader identity
- **RAG Query Scoping** ensures AI responses are constructed only from documents the current user is authorized to view

### Cryptographic Layer
- **PBKDF2-SHA512** with 600,000 iterations for PIN key derivation (OWASP recommended minimum)
- **Server-side Pepper** (`CRYPTO_PEPPER`) adds defense against database breaches — even with the salt and hash, an attacker cannot derive the key without the pepper
- **AES-256-GCM** authenticated encryption with random 12-byte IVs prevents ciphertext tampering
- **Per-Locker Salt** (32 bytes, `crypto.randomBytes`) ensures identical PINs produce different hashes across lockers

### Rate Limiting & Abuse Prevention
- **Locker brute-force protection:** 5 max attempts → 15-minute lockout with `lockedUntil` timestamp enforcement
- **OTP expiration windows** prevent replay attacks

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 16 | App Router, SSR, Edge Middleware, API Routes |
| **React** | 19 | UI Components, Client-side hooks |
| **TypeScript** | 5 | End-to-end type safety |
| **Tailwind CSS** | 4 | Utility-first styling with custom theme tokens |
| **Framer Motion** | 12 | Page transitions, micro-animations |
| **Lucide React** | 0.562 | Consistent iconography system |
| **React Hook Form + Zod** | 7 / 4 | Form validation with schema-first approach |
| **React Hot Toast** | 2.6 | Notification system |
| **Redux Toolkit** | 2.11 | Global state management |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js API Routes** | 16 | RESTful API handlers (Route Handlers) |
| **Prisma ORM** | 7.8 | Type-safe database client with migrations |
| **PostgreSQL** | 15+ | Primary data store (hosted on Supabase) |
| **jose** | 6 | JWT signing, verification, and Edge-compatible crypto |
| **bcryptjs** | 3 | Password hashing (12 salt rounds) |
| **Node.js crypto** | Native | PBKDF2 key derivation, AES-256-GCM encryption |
| **Nodemailer** | 9 | SMTP email delivery (OTP, invitations) |
| **Google Gemini** | 2.5 Flash | LLM synthesis for RAG responses |

### Infrastructure
| Service | Purpose |
|---------|---------|
| **Vercel** | Edge deployment, serverless functions |
| **Supabase** | Managed PostgreSQL with connection pooling |
| **Google OAuth** | Social authentication provider |
| **GitHub OAuth** | Social authentication provider |
| **Gmail SMTP** | Transactional email delivery |

---

## Project Structure

```
org-rag/
├── backend/                   # Server-side business logic
│   ├── middleware/             # JWT auth + workspace RBAC middleware
│   ├── services/              # 9 service modules (auth, docs, locker, RAG, etc.)
│   ├── utils/encryption.ts    # PBKDF2, AES-256-GCM, salt generation
│   └── types/                 # Shared TypeScript interfaces
│
├── prisma/schema.prisma       # Database schema (10 models, 5 enums)
│
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login, Signup, Verify, Forgot/Reset Password
│   │   ├── (dashboard)/       # Home, Documents, Locker, RAG Bot, Settings
│   │   ├── api/               # 25+ REST endpoints across 7 resource groups
│   │   └── onboarding/        # First-time profile setup wizard
│   ├── features/              # Feature modules (auth, chat, docs, locker, profile)
│   ├── context/               # Workspace state provider
│   └── middleware.ts          # Edge middleware (route protection, profile gate)
│
└── public/landing/            # Landing page vector illustrations
```

---

## Screenshots

| Landing Page | Login / Signup |
|:---:|:---:|
| ![Landing Page](image-6.png) | ![Auth](image-7.png) |

| Dashboard Home | Document Management |
|:---:|:---:|
| ![Dashboard](image.png) | ![Documents](image-1.png) |

| RAG Chat Bot | Zero-Knowledge Locker |
|:---:|:---:|
| ![RAG Bot](image-3.png) | ![Locker](image-4.png) |

| Organization Settings |
|:---:|
| ![Settings](image-5.png) |

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Yashvi-saini">Yashvi Saini</a>
</p>