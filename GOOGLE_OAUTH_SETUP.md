# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the BookSwaps application.

## Prerequisites

1. A Google Cloud Console account
2. Access to your BookSwaps project environment variables

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google Identity Services

## Step 2: Configure OAuth Consent Screen

1. In Google Cloud Console, go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace account)
3. Fill in the required information:
   - App name: BookSwaps
   - User support email: your email
   - Developer contact information: your email
4. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`
5. Add test users (for development)

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Configure:
   - Name: BookSwaps Web Client
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for local development)
     - `https://bookswaps.quantiq.co.ke` (for production)
   - Authorized redirect URIs:
     - `http://localhost:5173` (for local development)
     - `https://bookswaps.quantiq.co.ke` (for production)

## Step 4: Configure Environment Variables

### Backend (.env)
```env
GOOGLE_OAUTH_CLIENT_ID=your_google_client_id_here
GOOGLE_OAUTH_CLIENT_SECRET=your_google_client_secret_here
```

### Frontend (.env)
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Production Environment
Make sure to set these environment variables on your production server:
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`

## Step 5: Test the Integration

1. Start your development servers:
   ```bash
   # Backend
   python manage.py runserver
   
   # Frontend
   cd frontend && npm run dev
   ```

2. Navigate to the login/register page
3. Click the "Continue with Google" button
4. Complete the OAuth flow

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**
   - Ensure your redirect URIs in Google Cloud Console match your application URLs exactly

2. **"invalid_client" error**
   - Check that your client ID is correctly set in environment variables
   - Verify the client ID matches the one from Google Cloud Console

3. **"access_denied" error**
   - Make sure your app is not in testing mode with restricted users
   - Add your test email to the OAuth consent screen test users

4. **Token verification fails**
   - Ensure your backend has the correct Google client ID
   - Check that the google-auth library is installed: `pip install google-auth`

### Development vs Production

- **Development**: Use `http://localhost:5173` for origins and redirects
- **Production**: Use `https://bookswaps.quantiq.co.ke` for origins and redirects

## Security Notes

1. Never commit your actual client secrets to version control
2. Use different OAuth clients for development and production
3. Regularly rotate your client secrets
4. Monitor OAuth usage in Google Cloud Console

## API Flow

1. User clicks "Continue with Google"
2. Google Identity Services loads and shows OAuth popup
3. User completes OAuth flow with Google
4. Google returns an ID token to the frontend
5. Frontend sends the ID token to backend `/api/users/auth/google/`
6. Backend verifies the token with Google
7. Backend creates/logs in user and returns JWT tokens
8. Frontend stores JWT tokens and redirects to profile page

## Files Modified

- `backend/users/serializers.py` - Added GoogleAuthSerializer
- `backend/users/views.py` - Implemented GoogleAuthView
- `frontend/src/components/Auth/GoogleAuthButton.jsx` - Google OAuth button
- `frontend/src/contexts/AuthContext.jsx` - Added googleAuth function
- `frontend/index.html` - Added Google Identity Services script

## Next Steps

After setting up Google OAuth:

1. Test the complete flow in development
2. Deploy to production with production OAuth credentials
3. Monitor authentication logs
4. Consider adding additional OAuth providers (Facebook, GitHub, etc.)
