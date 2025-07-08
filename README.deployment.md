# Vercel Deployment Guide

## Configuration Files Created

1. **vercel.json** - Main deployment configuration
2. **.vercelignore** - Files to exclude from deployment
3. **README.deployment.md** - This deployment guide

## Deployment Steps

### Option 1: Deploy via Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

### Option 2: Deploy via GitHub Integration
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the configuration
3. Push your changes to trigger deployment

## Configuration Details

- **Build Command**: `vite build` (frontend-only build)
- **Output Directory**: `dist/public` 
- **Framework**: Static site (SPA)
- **Routing**: SPA routing configured with rewrites

## Environment Variables

Make sure to set these in your Vercel dashboard:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Notes

- This is a pure frontend deployment using Supabase as the backend
- No server-side code is deployed to Vercel
- All database operations happen through Supabase client
- Admin authentication persists in browser storage

## Troubleshooting

If deployment fails:
1. Check environment variables are set correctly
2. Ensure Supabase URL and key are valid
3. Verify build completes locally with `vite build`