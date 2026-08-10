# DocClustor AI Assistant Context (AGENTS.md)

Welcome! This file acts as the primary developer context for AI agents working on the **DocClustor (org-rag)** project. Before you start making edits, please read through this document to understand the codebase architecture, visual guidelines, and current development state.

---

## 1. Project Overview & Identity
- **Product Name**: DocClustor
- **Domain**: `docclustor.me`
- **Purpose**: A high-fidelity, secure document management, organization, and RAG (Retrieval-Augmented Generation) search platform designed for organizations and individuals.
- **Tech Stack**:
  - **Framework**: Next.js (App Router, React 19)
  - **Styling**: Tailwind CSS & Vanilla CSS (high contrast, premium dark & blue tones)
  - **Animations**: `framer-motion` for fluid state transitions
  - **Database**: Prisma ORM

---

## 2. Core Visual Guidelines & Brand System
- **Theme/Colors**: Navy blue (`#003259` and `#0b1a30`), corporate active blue (`#3B82F6` and `#1E9BFF`), and crisp high-contrast white.
- **Typography**: `Poppins` font family is standard across all branding headers, uppercase metadata labels, and primary elements.
- **Non-AI Aesthetic**: Avoid standard AI elements like generic dot-loaders, brackets, or code-block terminals in user-facing components. Keep layouts clean, professional, and enterprise-grade.

---

## 3. Implemented Features & Milestones

### A. Cinematic Site Loader (`src/components/SiteLoader.tsx` & `src/app/page.tsx`)
- **Physics-Based Folder Loop**: Features a custom 3D document-dropping animation where folders expand and bounce as documents float into them.
- **Transition States**: Multi-stage state machine (`loading` -> `transitioning` -> `done`).
  - **Phase 1 (loading)**: Bouncing loop runs for 20s.
  - **Phase 2 (transitioning)**: Active loops are frozen/faded out. The main folder stage scales down (`scale: 0`, `opacity: 0`) while the background turns to solid blue (`#3B82F6`) in `0.6s`.
  - **Phase 3 (done)**: The loader fades out (`exit={{ opacity: 0 }}` over `0.8s`), revealing the homepage underneath with a scaling entrance.

### B. Legal Compliance & Trust Routes
- **Privacy Policy (`src/app/privacy/page.tsx`)**: Premium layout outlining the zero-knowledge security guarantees, data hosting, and sovereignty controls.
- **Terms of Service (`src/app/terms/page.tsx`)**: High-fidelity agreement covering workspace setups, locker access, and limitation of liabilities.
- **Header/Footer**: Includes sticky glassmorphic navigation bars with "Back to Home" links and cross-referenced buttons.

### C. Search Engine Optimization (SEO) & Favicons
- **Google Search Console integration**: Setup `robots.ts`, `sitemap.ts`, and root `layout.tsx` metadata.
- **robots.ts**: Allows `/`, `/privacy`, `/terms`. Disallows non-public routes (`/api/`, `/oauth/`, `/dashboard/`, `/company/`, `/individual/`, `/onboarding/`, `/dummydash/`, `/login`, `/signup`, etc.) to prevent redirect crawling errors in Google Search Console.
- **sitemap.ts**: Exposes public indexable URLs.
- **Google Site Verification**: Configured in root metadata using `process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.
- **Favicon Ecosystem**: Mapped fully in layout `icons` object:
  - `/favicon.ico` (multi-size standard)
  - `/favicon-96x96.png` (Google search standard)
  - `/favicon.svg` (modern vector browsers)
  - `/apple-touch-icon.png` (iOS Safari homescreen)
  - `/site.webmanifest` (PWA links correctly mapped to manifest png assets)

---

## 4. Immediate Development Roadmap

1. **Prisma Schema Update**:
   - Transition the `LockerAccess` security structure to the per-user unique constraints: `@@unique([userId, orgId])`.
2. **Hook Up Auth Loading State**:
   - Replace the hardcoded `20000ms` timer in `src/app/page.tsx` with real-world promises (such as auth session check, server health check, or organization workspace initialization).
3. **Verify Google Search Console**:
   - Add the search console meta-tag verification string to `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` in the server env variables.
