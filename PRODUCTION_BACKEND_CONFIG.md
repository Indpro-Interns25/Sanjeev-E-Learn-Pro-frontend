# Production Backend Configuration Guide

## Overview
This guide documents how the frontend has been configured to use environment-based backend URLs instead of hardcoded development hosts.

## Backend URL
**Production:** `https://sanjeev-e-learn-pro-backend-1.onrender.com`

## Configuration Files Updated

### 1. `.env` (Development Environment Variables)
```
VITE_API_URL=https://sanjeev-e-learn-pro-backend-1.onrender.com
VITE_SOCKET_URL=https://sanjeev-e-learn-pro-backend-1.onrender.com
```

### 2. `.env.example` (Template for Environment Setup)
Shows the correct format for both development and production configurations.

### 3. `src/services/apiClient.js` (Axios Client)
Updated to use environment variable:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});
```

### 4. `src/config/apiConfig.js` (New Utility)
Centralized API configuration with validation:
```javascript
import { API_BASE_URL, SOCKET_URL } from '../config/apiConfig';
```

Features:
- Reads from `VITE_API_URL` environment variable
- Validates that production URLs do not use hardcoded development hosts
- Provides `API_BASE_URL` and `SOCKET_URL` for socket connections
- Logs configuration in development mode

### 5. `src/context/ChatContext.jsx` & `NotificationContext.jsx`
Updated to use centralized config:
```javascript
import { SOCKET_URL } from '../config/apiConfig';
const socket = io(SOCKET_URL, { auth: { token } });
```

### 6. `vite.config.js` (Proxy Configuration)
Updated proxy to use environment variable:
```javascript
proxy: {
  '/api': {
    target: process.env.VITE_API_URL,
    changeOrigin: true,
    secure: true,
    rewrite: (path) => path.replace(/^\/api/, '/api')
  }
}
```

## For Vercel Deployment

### Step 1: Set Environment Variables in Vercel
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add these variables:

```
VITE_API_URL=https://sanjeev-e-learn-pro-backend-1.onrender.com
VITE_SOCKET_URL=https://sanjeev-e-learn-pro-backend-1.onrender.com
```

### Step 2: Build & Deploy
```bash
npm run build
```

The build process will:
- Read `VITE_API_URL` from environment
- Replace `import.meta.env.VITE_API_URL` with the production URL
- Create optimized production bundle

### Step 3: Verify Deployment
- Check that API calls are going to: `https://sanjeev-e-learn-pro-backend-1.onrender.com/api/...`
- Verify WebSocket connections use: `https://sanjeev-e-learn-pro-backend-1.onrender.com`

## All API Service Files
All service files in `src/services/` use the centralized `apiClient`:
- `auth.js` - Authentication
- `courses.js` - Course management
- `admin.js` - Admin operations
- `lectures.js` - Lecture content
- `quiz.js` - Quiz operations
- `certificates.js` - Certificate generation
- And more...

No hardcoded development host URLs exist in any service files.

## Error Messages
Error messages have been updated to be production-ready:
- Removed references to specific development ports
- Use generic messages suitable for production
- Example: "Cannot connect to the server. Please check your network connection and ensure the backend server is running."

## Testing the Configuration

### Development (with configurable backend)
```bash
# set this to your backend endpoint
VITE_API_URL=https://your-backend-domain.com
npm run dev
```

### Production Build Preview
```bash
npm run build
npm run preview
```

## Troubleshooting

### CORS Issues
If you see CORS errors:
1. Verify `withCredentials: true` is set in `apiClient.js` ✓
2. Check that backend allows requests from your Vercel domain
3. Ensure backend has proper CORS headers configured

### Socket Connection Issues
If WebSocket fails:
1. Check `VITE_SOCKET_URL` is set correctly in Vercel env vars
2. Verify backend socket.io server is running
3. Check browser console for connection errors

### Backend Not Found
If you see "Cannot connect to backend" error:
1. Verify `https://sanjeev-e-learn-pro-backend-1.onrender.com` is accessible
2. Check that backend server is running
3. Verify there are no firewall/CORS issues

## No Hardcoded Dev URLs
✓ All hardcoded development backend URL references removed from source code
✓ API and socket endpoints are read from Vite environment variables
✓ Environment variables used throughout for flexibility
✓ Production-ready for Vercel deployment

## Files Modified
1. `.env` - Updated to production URL
2. `.env.example` - Created with configuration template
3. `src/services/apiClient.js` - Uses VITE_API_URL
4. `src/config/apiConfig.js` - Created utility for centralized config
5. `src/context/ChatContext.jsx` - Uses apiConfig
6. `src/context/NotificationContext.jsx` - Uses apiConfig
7. `src/context/auth-context.jsx` - Removed commented code with old URLs
8. `src/services/admin.js` - Updated error messages
9. `vite.config.js` - Updated proxy configuration

## Architecture
```
Frontend (Vercel)
    ↓ (VITE_API_URL env var)
    ↓ https://sanjeev-e-learn-pro-backend-1.onrender.com
    ↓
Backend (Render.com)
```
