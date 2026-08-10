# DocClustor WorkSpace Context

This directory and file store configuration and workspace context for Gemini and other developer agents.

## Project Details
- **Name**: DocClustor (org-rag)
- **Primary Domain**: `docclustor.me`

## Core Codebase Structure
- `/src/app`: Contains main App Router pages, layouts, and API routes.
  - `/src/app/page.tsx`: Landing page containing the 20-second site loader transition to the home content.
  - `/src/app/privacy/page.tsx`: Privacy policy document.
  - `/src/app/terms/page.tsx`: Terms of service document.
  - `/src/app/robots.ts` & `/src/app/sitemap.ts`: Crawler rules and index.
- `/src/components`: UI components.
  - `/src/components/SiteLoader.tsx`: Cinematic SVG folder-drop animation loader.
- `/public`: Static media, favicons, logos, and web manifests.

## Key Configurations
- **Google Site Verification**: Enabled via `process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` in the layout metadata verification object.
- **Excluded Routes**: Private areas (`/dashboard`, `/company`, `/individual`, `/onboarding`, auth endpoints) are blocked in `robots.ts` to avoid Search Console error listings.
