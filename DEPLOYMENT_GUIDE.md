# Deployment Guide - Get a Permanent URL

## Overview
This guide will help you deploy your Progress Tracker to Vercel with a permanent URL that never changes. This will solve the Firebase authentication issue permanently.

## Step 1: Create a GitHub Repository

### Option A: Through GitHub Website (Recommended)

1. **Go to GitHub**: https://github.com/new
2. **Repository name**: Enter `progress-tracker` (or your preferred name)
3. **Description**: "12-month development programme tracker"
4. **Make it Public** (recommended) or Private
5. **Click "Create repository"**

### Option B: Through GitHub CLI (if installed)

```bash
gh repo create progress-tracker --public --source=. --remote=origin
```

## Step 2: Connect Your Local Repository to GitHub

After creating the repository on GitHub, follow these steps:

1. **Copy the repository URL** from GitHub (e.g., `https://github.com/YOUR_USERNAME/progress-tracker.git`)

2. **Add the remote** (replace with your actual URL):
```bash
cd "C:\Users\Anomaly\Desktop\Personal Projects\Progress Tracker"
git remote add origin https://github.com/YOUR_USERNAME/progress-tracker.git
```

3. **Push to GitHub**:
```bash
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Through Vercel Website (Recommended - No CLI issues)

1. **Go to Vercel**: https://vercel.com/new
2. **Sign in** with your GitHub account
3. **Import your repository**:
   - Find `progress-tracker` in the list
   - Click "Import"
4. **Configure the project**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave as is)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
5. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add these from your `.env.local` file:
     - `NEXT_PUBLIC_FIREBASE_API_KEY` = `AIzaSyAEz0bsz4sT8LJQezfJTeZjP58a6gMG1fg`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = `project-tracker-d6d57.firebaseapp.com`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = `project-tracker-d6d57`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = `project-tracker-d6d57.firebasestorage.app`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = `655567962248`
     - `NEXT_PUBLIC_FIREBASE_APP_ID` = `1:655567962248:web:0069e8111919d73f49df3d`
     - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` = `G-JEJF0YKDTK`
6. **Click "Deploy"**
7. **Wait for deployment** (usually 1-2 minutes)
8. **Copy your URL** (e.g., `https://progress-tracker-xyz.vercel.app`)

## Step 4: Add Vercel URL to Firebase

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select project**: `project-tracker-d6d57`
3. **Authentication → Settings → Sign-in method**
4. **Authorized domains → Add domain**
5. **Enter your Vercel URL** (e.g., `progress-tracker-xyz.vercel.app`)
6. **Click Add**
7. **Wait 2-3 minutes**

## Step 5: Test Your Deployment

1. **Open your Vercel URL** in the browser
2. **Try signing in** with Google
3. **Try sign out** button
4. **Test all features** - everything should work!

## Benefits of This Approach

✅ **Permanent URL** - Never changes, unlike Cloudflare tunnels
✅ **Firebase Auth works** - Domain is whitelisted once
✅ **Automatic HTTPS** - SSL certificate included
✅ **Fast CDN** - Global edge network
✅ **Auto-deploys** - Push to GitHub = auto-deploy to Vercel
✅ **Free tier** - Generous free tier for personal projects

## Making Updates

After initial deployment:

1. **Make changes** to your code
2. **Commit changes**:
```bash
git add .
git commit -m "Your commit message"
git push
```
3. **Vercel auto-deploys** automatically within seconds!

## Troubleshooting

### Git Authentication Issues
If git asks for credentials:
- Use GitHub Personal Access Token instead of password
- Or use SSH: `git remote set-url origin git@github.com:YOUR_USERNAME/progress-tracker.git`

### Vercel Build Fails
- Check the build logs in Vercel dashboard
- Ensure all environment variables are set
- Try redeploying from Vercel dashboard

### Firebase Auth Still Not Working
- Double-check the domain was added to Firebase
- Wait 5-10 minutes for Firebase to propagate
- Check Firebase Console for any errors

## Current Status

✅ Code committed to Git
✅ TypeScript errors fixed
✅ Ready for GitHub upload
✅ Ready for Vercel deployment

## Next Steps

1. Create GitHub repository
2. Push code to GitHub
3. Deploy to Vercel (web interface)
4. Add Vercel URL to Firebase
5. Enjoy your permanent, working deployment!
