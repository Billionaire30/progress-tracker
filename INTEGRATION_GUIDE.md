# Complete Integration Guide
## Cloudflare Tunnel + Localhost + Firebase

This guide explains how the three components work together for seamless development and deployment.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     External Access Layer                    │
│  ┌──────────────────┐    ┌──────────────────────────────┐  │
│  │ Cloudflare Tunnel │    │   Local Network Access      │  │
│  │ (Public HTTPS URL)│    │  (http://YOUR_IP:3000)      │  │
│  └────────┬───────────┘    └──────────────┬───────────────┘  │
│           │                              │                   │
│           └──────────────┬───────────────┘                   │
│                          │                                   │
│                    ┌─────▼─────┐                             │
│                    │ Next.js   │                             │
│                    │ Dev Server│                             │
│                    │ :3000     │                             │
│                    └─────┬─────┘                             │
│                          │                                   │
│           ┌──────────────┼──────────────┐                   │
│           │              │              │                   │
│    ┌──────▼──────┐ ┌─────▼──────┐ ┌────▼─────┐            │
│    │  Firebase   │ │ localStorage│ │  Context  │            │
│    │  Cloud Sync │ │  (Offline) │ │  (State) │            │
│    └─────────────┘ └────────────┘ └───────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

## Component 1: Localhost (Next.js Dev Server)

### What it does
- Runs your Next.js application locally
- Provides hot-reloading during development
- Serves the app on port 3000

### Access URLs
- **Local**: http://localhost:3000
- **Network**: http://100.112.31.210:3000 (your local IP)
- **Cloudflare Tunnel**: https://blue-metals-processing-photographic.trycloudflare.com (current - may change on restart)

### Start the dev server
```bash
cd "C:\Users\Anomaly\Desktop\Personal Projects\Progress Tracker"
npm run dev
```

### Configuration
- **File**: `next.config.js`
- **Allowed Origins**: Configured to accept requests from localhost, local network, and Cloudflare tunnel
- **Port**: 3000 (default)

---

## Component 2: Cloudflare Tunnel

### What it does
- Provides a public HTTPS URL for your local dev server
- Enables external access from anywhere
- Bypasses firewall and NAT issues
- Secure tunnel without port forwarding

### Installation
```bash
npm install -g cloudflared
```

### Start the tunnel
```bash
cloudflared tunnel --url http://localhost:3000
```

This will output a public URL like:
```
https://blue-metals-processing-photographic.trycloudflare.com
```
Note: The URL changes each time you start a new tunnel.

### Using the batch script (Recommended)
```bash
start-with-tunnel.bat
```

This script:
1. Starts the Next.js dev server
2. Waits for it to initialize
3. Starts the Cloudflare tunnel

### Configuration
- **File**: `next.config.js`
- **Allowed Origins**: Includes the Cloudflare tunnel URL
- **SSL**: Automatic HTTPS provided by Cloudflare

---

## Component 3: Firebase Cloud Sync

### What it does
- Provides real-time data synchronization
- Enables authentication (Google sign-in)
- Stores user data in the cloud
- Offline support with localStorage fallback

### Firebase Configuration
- **Project ID**: `project-tracker-d6d57`
- **Auth Domain**: `project-tracker-d6d57.firebaseapp.com`
- **API Key**: `AIzaSyAEz0bsz4sT8LJQezfJTeZjP58a6gMG1fg`

### How it works
1. **Authentication**: User signs in with Google (or anonymous)
2. **Data Sync**: App data automatically syncs to Firestore
3. **Real-time Updates**: Changes sync across devices
4. **Offline Support**: localStorage used when offline

### Firestore Structure
```
userData/
  └── {userId}/
      ├── months: [...]
      ├── weeklyLog: [...]
      ├── competencyChecklist: [...]
      ├── portfolio: [...]
      ├── gamification: {...}
      └── lastUpdated: "ISO timestamp"
```

### Authentication Flow
1. User clicks "Sign In" button in header
2. Firebase Auth popup appears
3. User authenticates with Google
4. App subscribes to user's Firestore document
5. Data loads from Firebase (or initializes new user)
6. All changes sync to Firebase automatically

### Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /userData/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## How They Work Together

### Scenario 1: Local Development (No Auth)
1. User starts dev server: `npm run dev`
2. User accesses: http://localhost:3000
3. App uses localStorage for data persistence
4. No Firebase sync
5. Works offline

### Scenario 2: Local Development (With Auth)
1. User starts dev server: `npm run dev`
2. User accesses: http://localhost:3000
3. User signs in with Google
4. App syncs data to Firebase
5. Changes persist in cloud
6. Works offline with localStorage fallback

### Scenario 3: External Access (Cloudflare Tunnel)
1. User runs: `start-with-tunnel.bat`
2. Dev server starts on localhost:3000
3. Cloudflare tunnel provides public HTTPS URL
4. User accesses: https://surgeons-intellectual-transparent-roy.trycloudflare.com
5. User signs in with Google
6. Data syncs to Firebase
7. Can access from any device with the URL

### Scenario 4: Multi-Device Sync
1. User on Device A: Signs in, makes changes
2. Changes sync to Firebase immediately
3. User on Device B: Signs in (same Google account)
4. Data loads from Firebase
5. Real-time sync keeps both devices in sync

---

## Setup Instructions

### Step 1: Install Dependencies
```bash
# Install Cloudflare Tunnel
npm install -g cloudflared

# Install project dependencies (if not already done)
npm install
```

### Step 2: Configure Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `project-tracker-d6d57`
3. Enable Google Authentication:
   - Authentication → Sign-in method → Google → Enable
4. Add authorized domains:
   - Authentication → Settings → Authorized domains
   - Add: `localhost`, `127.0.0.1`, `surgeons-intellectual-transparent-roy.trycloudflare.com`
5. Enable Firestore:
   - Firestore Database → Create database
   - Choose location (nearest to you)
   - Start in Test mode (for development)

### Step 3: Start the Application

#### Option A: Dev Server Only (Local)
```bash
npm run dev
```
Access: http://localhost:3000

#### Option B: Dev Server + Cloudflare Tunnel (External Access)
```bash
start-with-tunnel.bat
```
Access: https://blue-metals-processing-photographic.trycloudflare.com (or the URL shown in tunnel output)

#### Option C: Manual Tunnel Start
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Start Cloudflare tunnel
cloudflared tunnel --url http://localhost:3000
```

### Step 4: Test Authentication
1. Open the app in browser
2. Click the "Sign In" button (user icon) in header
3. Choose "Sign in with Google"
4. Authorize the app
5. You should see the sign-in button change to a sign-out button
6. Data will now sync to Firebase

### Step 5: Test Data Sync
1. Sign in on Device A
2. Add a task or log some hours
3. Sign in on Device B (or incognito window)
4. Verify data appears on Device B
5. Make changes on Device B
6. Verify changes appear on Device A

---

## Troubleshooting

### Cloudflare Tunnel Issues

**Problem**: "Bad Gateway" error
- **Solution**: Ensure dev server is running on port 3000
- **Check**: Run `netstat -ano | findstr :3000` to verify server is running

**Problem**: Tunnel URL doesn't work
- **Solution**: Restart the tunnel after starting dev server
- **Check**: Ensure cloudflared is installed: `cloudflared --version`

**Problem**: CORS errors
- **Solution**: Add tunnel URL to `allowedDevOrigins` in `next.config.js`

### Firebase Issues

**Problem**: "auth/unauthorized-domain"
- **Solution**: Add your domain to Firebase authorized domains
- **Location**: Firebase Console → Authentication → Settings → Authorized domains

**Problem**: "auth/operation-not-allowed"
- **Solution**: Enable Google sign-in in Firebase Console
- **Location**: Firebase Console → Authentication → Sign-in method → Google

**Problem**: Data not syncing
- **Solution**: Check Firestore security rules
- **Check**: Ensure Firestore database is created
- **Check**: Browser console for specific errors

### Localhost Issues

**Problem**: Port 3000 already in use
- **Solution**: Kill the process using the port
- **Command**: `taskkill //PID <PID> //F`
- **Find PID**: `netstat -ano | findstr :3000`

**Problem**: Changes not persisting
- **Solution**: Check browser localStorage
- **Check**: Ensure Firebase auth is working if using cloud sync

---

## Security Considerations

### Development Mode
- Cloudflare tunnel provides HTTPS automatically
- Firebase requires authentication for data access
- Firestore security rules ensure users can only access their own data
- No sensitive data should be committed to git

### Production Deployment
For production, consider:
1. **Vercel** (recommended for Next.js)
2. **Netlify**
3. **Cloudflare Pages**
4. **Self-hosted with proper SSL and authentication**

**Never** use Cloudflare tunnel for production - it's for development only.

---

## Verification Checklist

- [ ] Dev server starts successfully (`npm run dev`)
- [ ] Can access app at http://localhost:3000
- [ ] Cloudflare tunnel starts successfully
- [ ] Can access app at tunnel URL
- [ ] Firebase authentication works (Google sign-in)
- [ ] Data persists in localStorage (without auth)
- [ ] Data syncs to Firebase (with auth)
- [ ] Real-time sync works across devices
- [ ] Offline support works (disconnect network)
- [ ] All pages load without errors

---

## Quick Reference

### Start Commands
```bash
# Local dev only
npm run dev

# With Cloudflare tunnel
start-with-tunnel.bat

# Manual tunnel
cloudflared tunnel --url http://localhost:3000
```

### Access URLs
- Local: http://localhost:3000
- Network: http://100.112.31.210:3000
- Tunnel: https://surgeons-intellectual-transparent-roy.trycloudflare.com

### Firebase Console
- Project: `project-tracker-d6d57`
- Console: https://console.firebase.google.com/project/project-tracker-d6d57

### Useful Commands
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process on port 3000
taskkill //PID <PID> //F

# Check cloudflared version
cloudflared --version

# Build for production
npm run build

# Start production server
npm start
```

---

## Support

If you encounter issues:
1. Check browser console (F12) for errors
2. Check terminal output for server/tunnel errors
3. Verify Firebase Console configuration
4. Review this guide's troubleshooting section
5. Check existing documentation files:
   - `FIREBASE_SETUP.md`
   - `CLOUDFLARE_TUNNEL_TROUBLESHOOTING.md`
   - `NETWORK_SETUP.md`
