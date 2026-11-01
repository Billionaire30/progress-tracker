# Firebase Authentication with Cloudflare Tunnel - QUICK FIX

## Current Status

Your Cloudflare tunnel URL is: **dealt-immune-kerry-cincinnati.trycloudflare.com**

## Problem

Firebase Authentication requires domain whitelisting. The Cloudflare tunnel domain is not in Firebase's authorized domains list, so sign in/sign out buttons don't work.

## Quick Fix (5 minutes)

### Step 1: Open Firebase Console
Visit: https://console.firebase.google.com/

### Step 2: Select Your Project
Click on: **project-tracker-d6d57**

### Step 3: Go to Authentication Settings
1. Click **Authentication** in the left sidebar
2. Click the **Settings** (gear icon) at the top
3. Select **Sign-in method**

### Step 4: Add Your Tunnel Domain
1. Scroll down to **Authorized domains**
2. Click **Add domain**
3. Enter: `dealt-immune-kerry-cincinnati.trycloudflare.com`
4. Click **Add**

### Step 5: Wait and Test
1. Wait 2-3 minutes for changes to propagate
2. Refresh your Cloudflare tunnel page
3. Try signing in/sign out - it should work now!

## Why This Happens

Firebase requires domain whitelisting for security. Cloudflare tunnel URLs change every time you restart the tunnel, so you'll need to add the new URL to Firebase each time.

## Long-term Solution

For a permanent fix, deploy to a hosting platform with a fixed domain:
1. Push your code to GitHub
2. Connect to Vercel or Netlify
3. Get a permanent URL (e.g., `your-app.vercel.app`)
4. Add that URL to Firebase once - it will never change

## Development

For development, use `http://localhost:3000` - it's already whitelisted in Firebase and works perfectly.
