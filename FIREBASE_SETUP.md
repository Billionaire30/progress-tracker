# Firebase Setup Guide

## Current Configuration
- Project ID: `project-tracker-d6d57`
- Auth Domain: `project-tracker-d6d57.firebaseapp.com`
- App ID: `1:655567962248:web:0069e8111919d73f49df3d`

## Troubleshooting Firebase Authentication Errors

If you're seeing errors with `https://project-tracker-d6d57.firebaseapp.com`, follow these steps:

### 1. Enable Google Authentication in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `project-tracker-d6d57`
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Google**
5. Enable the Google sign-in provider
6. Click **Save**

### 2. Configure Authorized Domains

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Authorized domains** (or Settings → General → Authorized domains)
3. Add the following domains if not already present:
   - `localhost`
   - `127.0.0.1`
   - `project-tracker-d6d57.firebaseapp.com`
   - Your production domain (if deployed)

### 3. Check API Key Restrictions

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `project-tracker-d6d57`
3. Navigate to **APIs & Services** → **Credentials**
4. Find the API key: `AIzaSyAEz0bsz4sT8LJQezfJTeZjP58a6gMG1fg`
5. Click on it and check **Application restrictions**:
   - If set to "IP addresses", change to "None" or add your IP
   - If set to "HTTP referrers", add your domains
6. Check **API restrictions**:
   - Ensure the following APIs are enabled:
     - Identity Toolkit API
     - Firebase Authentication API
     - Cloud Firestore API

### 4. Enable Cloud Firestore

1. In Firebase Console, go to **Firestore Database**
2. If not created, click **Create database**
3. Choose **Start in production mode** or **Test mode**
4. Select a location (closest to your users)
5. Create the database

### 5. Check Firestore Security Rules

1. In Firebase Console, go to **Firestore Database** → **Rules**
2. Ensure rules allow authenticated users to read/write:
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

### 6. Test Authentication

After making changes:
1. Clear your browser cache and localStorage
2. Refresh the app
3. Try signing in with Google
4. Check browser console for any errors

## Common Error Messages

### "auth/operation-not-allowed"
- **Cause**: Google sign-in provider not enabled
- **Fix**: Enable Google authentication in Firebase Console

### "auth/unauthorized-domain"
- **Cause**: Domain not in authorized list
- **Fix**: Add domain to authorized domains in Firebase Console

### "auth/api-key-not-authorized"
- **Cause**: API key restrictions or missing API
- **Fix**: Check API key settings in Google Cloud Console

### "auth/configuration-not-found"
- **Cause**: Firebase project not properly configured
- **Fix**: Verify project ID and configuration in Firebase Console

## Alternative: Local-Only Mode

If you don't need cloud sync, you can use the app in local-only mode:
1. Click "Continue without Account (Local Only)" on the sign-in screen
2. Your data will be stored in localStorage only
3. No Firebase configuration needed

## Need Help?

If these steps don't resolve the issue:
1. Check the browser console (F12) for detailed error messages
2. Share the exact error message for further assistance
3. Verify you have access to the Firebase project `project-tracker-d6d57`
