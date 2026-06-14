// ─── Prisma Config (for CLI tools) ─────────────────────────────────────────────
//
// WHY THIS FILE EXISTS:
// Prisma 7 requires this file to tell CLI tools (db push, studio, migrate)
// where the database URL is and where the schema file lives.
// ──────────────────────────────────────────────────────────────────────────────

import path from 'node:path';
import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

// Load .env file so DATABASE_URL is available
dotenv.config();

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
