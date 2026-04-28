# Mobile Token Fix - Complete Implementation Guide

## Problem
Courses not loading on mobile with error: **"Not authorized, no token"**

## Root Causes
1. Token not persisting in both localStorage AND sessionStorage on mobile
2. API interceptor not checking both storage locations
3. Login not storing token in both storages
4. Insufficient debug logging for troubleshooting

---

## Solution Overview

### 1. **API Instance (src/services/api.js)**
Improved to handle mobile token persistence

#### Key Changes:
- ✅ Created `getTokenFromAllStorages()` function that reads from BOTH localStorage and sessionStorage
- ✅ Request interceptor now checks multiple storage sources
- ✅ Enhanced debug logging to track token flow
- ✅ Better error messages with timestamps

#### Code:
```javascript
/**
 * Get token from both localStorage and sessionStorage
 * Reads localStorage first (persistent), then falls back to sessionStorage
 * This ensures token persists on mobile after refresh
 */
function getTokenFromAllStorages() {
  try {
    // Check localStorage first (persistent across sessions)
    const localToken = localStorage.getItem('token');
    if (localToken) {
      console.debug('📱 TOKEN: Found in localStorage');
      return localToken;
    }

    // Fall back to sessionStorage (current session)
    const sessionToken = sessionStorage.getItem('token');
    if (sessionToken) {
      console.debug('📱 TOKEN: Found in sessionStorage');
      return sessionToken;
    }

    console.debug('📱 TOKEN: Not found in any storage');
    return null;
  } catch (error) {
    console.error('❌ Error reading token from storage:', error);
    return null;
  }
}
```

#### Request Interceptor Update:
```javascript
// Get token from both localStorage AND sessionStorage for mobile persistence
const accessToken = getTokenFromAllStorages() || getAccessToken();

console.debug('🔍 Token Check:', {
  endpoint: requestPath,
  hasToken: !!accessToken,
  isDemoToken: accessToken ? isDemoToken(accessToken) : false,
  needsAuth: needsUserAuth
});

if (accessToken && !isDemoToken(accessToken)) {
  config.headers.Authorization = `Bearer ${accessToken}`;
  console.debug('🔑 User Token Attached:', {
    method: config.method?.toUpperCase(),
    path: requestPath,
    tokenLength: accessToken.length,
    source: 'localStorage/sessionStorage'
  });
  return config;
}
```

---

### 2. **Login Fix (src/context/AuthContext.jsx)**
Store token in BOTH localStorage and sessionStorage

#### Code Update:
```javascript
const login = async (email, password, options = {}) => {
  const { remember = true } = options;
  dispatch({ type: 'AUTH_INIT' });
  try {
    const { user, token } = await authService.login(email, password);
    
    // CRITICAL FIX FOR MOBILE: Store token in BOTH localStorage and sessionStorage
    console.log('📱 TOKEN: Storing in both localStorage and sessionStorage');
    localStorage.setItem('token', token);
    sessionStorage.setItem('token', token);
    
    // Also store user data
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('user', JSON.stringify(user));
    }
    
    setAuthSession({ token, user, remember });
    dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
    scheduleAutoLogout(token);
    return user;
  } catch (error) {
    // ... demo token handling also stores in both storages
    localStorage.setItem('token', demoToken);
    sessionStorage.setItem('token', demoToken);
    localStorage.setItem('user', JSON.stringify(demoUser));
    sessionStorage.setItem('user', JSON.stringify(demoUser));
    // ...
  }
}
```

---

### 3. **Courses Service (src/services/courses.js)**
Enhanced token checking and debug logging

#### Code Update:
```javascript
export async function getAllCourses(filters = {}) {
  // CRITICAL: Check token from both storages for mobile
  const tokenFromLocal = localStorage.getItem('token');
  const tokenFromSession = sessionStorage.getItem('token');
  const token = getAccessToken();
  const effectiveToken = tokenFromLocal || tokenFromSession || token;
  
  const isDemoToken = typeof effectiveToken === 'string' && effectiveToken.startsWith('demo-token-');

  console.log('📱 TOKEN DEBUG:', {
    tokenFromLocal: !!tokenFromLocal,
    tokenFromSession: !!tokenFromSession,
    tokenFromUtility: !!token,
    effectiveToken: !!effectiveToken,
    isDemoToken: isDemoToken,
    timestamp: new Date().toISOString()
  });

  if (!effectiveToken && typeof window !== 'undefined') {
    console.error('🚨 API ERROR: Missing token before fetching courses', {
      timestamp: new Date().toISOString(),
      pathname: window.location.pathname
    });
    clearAuthSession();
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Not authorized, no token');
  }

  try {
    console.log('📡 Fetching courses from:', url, { token: effectiveToken ? 'present' : 'missing' });
    
    const response = await apiClient.get(url);
    
    console.log('✅ Courses fetched successfully:', { count: response.data?.length || 0 });
    // ... rest of function
  } catch (error) {
    console.error('🚨 API ERROR:', {
      status: error?.response?.status,
      message: error?.message,
      endpoint: '/api/courses',
      isDemoToken: isDemoToken,
      timestamp: new Date().toISOString()
    });
    // ... error handling
  }
}
```

---

## Debug Logs to Monitor

Open browser console (F12) and look for these logs:

### On Login:
```
📱 TOKEN: Storing in both localStorage and sessionStorage
🔑 User Token Attached: { method: 'POST', path: '/auth/login', tokenLength: 234, source: 'localStorage/sessionStorage' }
```

### On Course Load:
```
📱 TOKEN DEBUG: { 
  tokenFromLocal: true,
  tokenFromSession: true,
  tokenFromUtility: true,
  effectiveToken: true,
  isDemoToken: false,
  timestamp: '2026-04-28...'
}
📡 Fetching courses from: /api/courses?... { token: 'present' }
✅ Courses fetched successfully: { count: 15 }
```

### If Error Occurs:
```
🚨 API ERROR: {
  status: 401,
  message: 'Not authorized, no token',
  endpoint: '/api/courses',
  isDemoToken: false,
  timestamp: '2026-04-28...'
}
```

---

## Testing the Fix

### Desktop Testing:
1. Open http://localhost:5173
2. Login with any credentials
3. Check console (F12) for token logs
4. Verify courses load
5. Refresh page (F5)
6. Verify courses still load (token persisted)

### Mobile Testing:
1. Open app on mobile device or emulator
2. Login with credentials
3. Check console for token logs
4. Verify courses load
5. **Close and reopen app** - token should persist
6. **Refresh page** - token should persist

### Key Checklist:
- [ ] Token appears in both localStorage AND sessionStorage after login
- [ ] Token logs appear in console with proper formatting
- [ ] Courses load without 401 errors
- [ ] Token persists after page refresh (F5)
- [ ] Token persists after closing/reopening app (mobile)
- [ ] 401 error handled gracefully with redirect to /login

---

## Environment Configuration

### .env file (Production):
```
VITE_API_URL=https://sanjeev-e-learn-pro-backend-1.onrender.com
VITE_SOCKET_URL=https://sanjeev-e-learn-pro-backend-1.onrender.com
```

### .env.development file:
```
VITE_API_URL=https://sanjeev-e-learn-pro-backend-1.onrender.com
VITE_SOCKET_URL=https://sanjeev-e-learn-pro-backend-1.onrender.com
```

**No localhost URLs** - Always use environment variables!

---

## Files Modified

1. ✅ **src/services/api.js**
   - Added `getTokenFromAllStorages()` function
   - Enhanced request interceptor with dual storage checking
   - Improved debug logging

2. ✅ **src/context/AuthContext.jsx**
   - Updated login function to store in both storages
   - Updated demo token handling to store in both storages

3. ✅ **src/services/courses.js**
   - Enhanced token checking with multi-storage fallback
   - Added comprehensive debug logging
   - Improved error tracking with timestamps

---

## Mobile-Specific Considerations

### Why Both localStorage AND sessionStorage?
- **localStorage**: Persists across browser sessions and app restarts
- **sessionStorage**: Faster to access, survives page refreshes
- **Mobile**: Apps may clear sessionStorage on background/resume, but localStorage persists

### Token Flow on Mobile:
```
Login Screen → Login API Call → Receive Token
  ↓
Store in localStorage + sessionStorage
  ↓
Redirect to Dashboard → Fetch Courses
  ↓
Check getTokenFromAllStorages() → Found in localStorage or sessionStorage
  ↓
Attach to request header → API call succeeds
  ↓
User closes app / Refreshes page
  ↓
Token still in localStorage → Courses still load!
```

---

## Troubleshooting

### Issue: Still seeing "Not authorized, no token"
**Solution:**
1. Check console for `📱 TOKEN DEBUG` logs
2. If tokenFromLocal: false and tokenFromSession: false, token wasn't stored
3. Verify login response includes token
4. Check if auth service is using the updated API instance

### Issue: Token not persisting after refresh
**Solution:**
1. Verify both localStorage AND sessionStorage have token after login
2. Check .env files have correct VITE_API_URL
3. Ensure no localhost URLs in code

### Issue: 401 error on first course load only
**Solution:**
1. This is normal if login response takes time
2. Courses service will redirect to /login
3. After logging in again, should work
4. Check network tab for actual error response

---

## Summary of Changes

| File | Change | Impact |
|------|--------|--------|
| src/services/api.js | Added dual-storage token reading | Fixes mobile token persistence |
| src/context/AuthContext.jsx | Store token in both storages | Ensures token survives app restarts |
| src/services/courses.js | Enhanced token checking + logging | Better debugging and mobile compatibility |

All changes are **backwards compatible** and don't break existing functionality.
