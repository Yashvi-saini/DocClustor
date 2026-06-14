# 📚 API Reference — org-rag

All API routes are prefixed with `/api/`.

---

## 🔐 Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/logout` | Logout and clear session |
| POST | `/api/auth/send-otp` | Send OTP to email |
| POST | `/api/auth/verify-otp` | Verify OTP code |

---

## 📄 Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documents` | Fetch all documents for user |
| POST | `/api/documents` | Upload a new document |
| DELETE | `/api/documents/:id` | Delete a document |

---

## 🤖 RAG / AI Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rag/query` | Send a message and get AI response |

---

## 👤 Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user's profile |
| PATCH | `/api/users/me` | Update profile |
