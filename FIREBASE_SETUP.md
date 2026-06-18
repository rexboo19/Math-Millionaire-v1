# Firebase Setup Instructions

This guide will help you set up Firebase Realtime Database to enable cross-device functionality for your Math Millionaire game.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Enter a project name (e.g., "math-millionaire")
4. Follow the setup wizard (you can disable Google Analytics if you want)
5. Click "Create project"

## Step 2: Enable Realtime Database

1. In your Firebase project, click on "Realtime Database" in the left sidebar
2. Click "Create Database"
3. Choose a location (select the closest to your users)
4. Choose "Start in test mode" (we'll secure it later)
5. Click "Enable"

## Step 3: Get Your Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the `</>` (Web) icon to add a web app
5. Register your app with a nickname (e.g., "Math Millionaire Web")
6. Click "Register app"
7. **Copy the `firebaseConfig` object** - it looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Step 4: Configure Your App

1. Open `firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",  // Replace with your apiKey
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",  // Replace with your authDomain
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com/",  // Replace with your databaseURL
    projectId: "YOUR_PROJECT_ID",  // Replace with your projectId
    storageBucket: "YOUR_PROJECT_ID.appspot.com",  // Replace with your storageBucket
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",  // Replace with your messagingSenderId
    appId: "YOUR_APP_ID"  // Replace with your appId
};
```

## Step 5: Set Up Database Security Rules

1. In Firebase Console, go to "Realtime Database"
2. Click on the "Rules" tab
3. Replace the rules with the following (allows read/write for testing):

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**⚠️ Important:** These rules allow anyone to read/write. For production, you should implement proper security rules. For now, this is fine for testing.

## Step 6: Test Your Setup

1. Upload all files to GitHub (including `firebase-config.js` and `firebase-helper.js`)
2. Open your game in a browser
3. Open the browser console (F12)
4. Start a game - you should see "Firebase initialized successfully" in the console
5. Open the audience page on a different device
6. The session should now be accessible across devices!

## Troubleshooting

### Firebase not initializing
- Check that `firebase-config.js` has the correct configuration
- Verify that Firebase SDK scripts are loaded before `firebase-config.js`
- Check browser console for errors

### Session not found on other devices
- Verify both devices have internet connection
- Check that Firebase Realtime Database is enabled
- Verify database rules allow read/write
- Check browser console for Firebase errors

### Still using localStorage
- If you see "Firebase not configured, using localStorage" in console, check your `firebase-config.js` file
- Make sure all Firebase scripts are loaded in the correct order

## Security Note

The current setup uses open read/write rules for simplicity. For production use, you should:

1. Implement proper authentication
2. Set up security rules based on session IDs
3. Add rate limiting
4. Consider using Firebase Authentication

Example production rules (more secure):
```json
{
  "rules": {
    "gameSession_$sessionId": {
      ".read": true,
      ".write": true,
      ".validate": "newData.hasChildren(['active', 'question'])"
    }
  }
}
```

## Files Modified

- `firebase-config.js` - Firebase configuration (you need to fill in your values)
- `firebase-helper.js` - Helper utility for Firebase/localStorage
- `index.html` - Added Firebase SDK scripts
- `audience.html` - Added Firebase SDK scripts
- `script.js` - Updated to use Firebase for session data
- `audience.html` (script section) - Updated to read from Firebase

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify Firebase configuration is correct
3. Ensure Realtime Database is enabled
4. Check that database rules allow access

