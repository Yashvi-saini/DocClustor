# 🚀 Setup Guide — org-rag

## Prerequisites
- Node.js 18+
- A PostgreSQL database (free on [Neon](https://neon.tech) or [Supabase](https://supabase.com))

## 1. Clone & Install
```bash
git clone <your-repo-url>
cd org-rag
npm install
```

## 2. Environment Variables
Copy the example file and fill in your values:
```bash
cp .env.example .env.local
```

## 3. Database Setup
```bash
npx prisma db push       # Creates tables in your database
npx prisma generate      # Generates the Prisma TypeScript client
```

## 4. Run Locally
```bash
npm run dev
```
App is now running at `http://localhost:3000`

---

## Environment Variables Reference

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `JWT_SECRET` | Secret key for signing auth tokens (make it long & random) |
| `NEXT_PUBLIC_BASE_URL` | The live URL of the deployed app |
