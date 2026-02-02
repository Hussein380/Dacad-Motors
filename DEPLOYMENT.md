# DriveEase Deployment Guide

## Full-Stack Vercel Deployment (Recommended)

Deploy both frontend and backend to Vercel in one project.

### 1. Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
3. Import your repository
4. **Root Directory**: Leave as `.` (project root)
5. **Framework Preset**: Vite (auto-detected)
6. **Build Command**: `cd frontend && npm run build` (default from vercel.json)
7. **Output Directory**: `frontend/dist` (default from vercel.json)
8. **Install Command**: `npm install --prefix frontend && npm install --prefix backend && npm install --prefix api` (default from vercel.json)

### 2. Environment Variables

Add these in **Vercel Dashboard** → **Settings** → **Environment Variables**:

**Required:**
```
NODE_ENV=production
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-secure-jwt-secret
JWT_EXPIRE=30d
RESEND_API_KEY=your-resend-key
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=your-secure-password
```

**Optional (for full features):**
```
CLOUDINARY_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GEMINI_API_KEY=... (for AI chat)
```

**Frontend (optional):**
- `VITE_API_URL=/api` – Use when both are on same Vercel project (default if unset in production)

### 3. Notes

- **Emails**: On Vercel, emails are sent directly (no BullMQ worker). Works fine for typical usage.
- **Redis**: Not needed on Vercel. Only required if you run the backend separately with the email worker.
- **CORS**: Same-origin deployment avoids CORS issues.

### 4. Quick Deploy

```bash
npx vercel
```

Follow the prompts. Add environment variables in the Vercel project settings.

---

## Alternative: Separate Backend Hosting

If you prefer to host the backend elsewhere (e.g. Railway, Render):

1. Deploy **frontend only** to Vercel:
   - Root Directory: `frontend`
   - Set `VITE_API_URL` to your backend URL (e.g. `https://your-api.railway.app/api`)

2. Deploy **backend** to Railway/Render/Fly.io with:
   - MongoDB, Redis (for BullMQ email worker)
   - All backend env vars from `.env.example`
