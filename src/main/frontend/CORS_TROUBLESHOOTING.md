# CORS Troubleshooting Guide

## Issue Description
You're seeing CORS errors when trying to validate emails in development mode. This is a common issue when the frontend (localhost:3000) tries to access the backend API (serve-v1.evean.net).

## Error Message
```
Access to XMLHttpRequest at 'https://serve-v1.evean.net/api/v1/serve-volunteering/user/email?email=...' 
from origin 'http://localhost:3000' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solutions Implemented

### 1. ✅ Graceful Error Handling
The application now handles CORS errors gracefully:
- Detects CORS/network errors
- Assumes email is available in development
- Shows appropriate user message
- Allows registration flow to continue

### 2. ✅ Development Mode Configuration
You can disable email validation entirely in development:

**Option A: Quick Fix (Recommended)**
Edit `src/main/frontend/src/utils/emailValidation.js`:
```javascript
const DISABLE_EMAIL_VALIDATION_IN_DEV = true; // Change to true
```

**Option B: Environment Variable**
Add to your `.env` file:
```
REACT_APP_DISABLE_EMAIL_VALIDATION=true
```

### 3. ✅ Alternative Solutions

#### Option 1: Use a CORS Proxy (Development Only)
Add this to your package.json scripts:
```json
"start": "REACT_APP_API_PROXY=https://cors-anywhere.herokuapp.com/ react-scripts start"
```

#### Option 2: Browser Extension (Chrome)
Install "CORS Unblock" or "Allow CORS" extension for development.

#### Option 3: Backend CORS Configuration
Ask the backend team to add CORS headers for development:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Current Behavior

### In Development (with CORS errors):
- ✅ Email format validation works
- ✅ Shows "Email format is valid (availability check unavailable in development)"
- ✅ Allows registration to proceed
- ✅ No blocking errors

### In Production:
- ✅ Full email validation works
- ✅ Real-time availability checking
- ✅ Proper error handling

## Testing the Fix

1. **Try registering with any email** - it should work now
2. **Check console** - you'll see a warning about CORS, but no errors
3. **Form submission** - should work without blocking

## Recommended Approach

For development, use **Option A** (disable validation) to avoid CORS issues entirely:

1. Open `src/main/frontend/src/utils/emailValidation.js`
2. Change line 7: `const DISABLE_EMAIL_VALIDATION_IN_DEV = true;`
3. Restart your development server
4. Email validation will be skipped in development

This approach:
- ✅ Eliminates CORS errors
- ✅ Speeds up development
- ✅ Maintains production functionality
- ✅ Provides clear user feedback

## Production Deployment

The CORS issue only affects development. In production:
- Frontend and backend are on the same domain
- CORS headers are properly configured
- Full email validation works as expected

## Need Help?

If you still have issues:
1. Check the browser console for specific error messages
2. Verify the backend API is accessible
3. Try the development mode disable option
4. Contact the backend team for CORS configuration 