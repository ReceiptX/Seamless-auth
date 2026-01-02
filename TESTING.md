# Testing Guide for Seamless Auth

This guide provides step-by-step instructions for testing the Seamless Auth application locally.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- npm or yarn package manager

## Setup Instructions

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd Seamless-auth
```

### 2. Setup PostgreSQL Database

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL if not already installed
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql
sudo systemctl start postgresql

# Create database
psql postgres
CREATE DATABASE seamless_auth;
\q
```

#### Option B: Docker PostgreSQL

```bash
docker run --name seamless-auth-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=seamless_auth \
  -p 5432:5432 \
  -d postgres:15
```

### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your database credentials
# DATABASE_URL="postgresql://user:password@localhost:5432/seamless_auth?schema=public"

# Generate Prisma client
npm run prisma:generate

# Push database schema
npm run prisma:push

# Start backend server
npm run dev
```

Backend should now be running on http://localhost:3001

### 4. Setup Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start frontend server
npm run dev
```

Frontend should now be running on http://localhost:3000

## Testing the Application

### Test 1: Business Signup

1. **Open browser**: Navigate to http://localhost:3000/signup
2. **Fill form**:
   - Email: `test@example.com`
   - Password: `Test123456`
3. **Click "Sign Up"**
4. **Expected**: Redirect to dashboard with public key displayed

### Test 2: Business Login

1. **Open browser**: Navigate to http://localhost:3000/login
2. **Fill form**:
   - Email: `test@example.com`
   - Password: `Test123456`
3. **Click "Log In"**
4. **Expected**: Redirect to dashboard

### Test 3: Dashboard Configuration

1. **In Dashboard**, you should see:
   - Your public key (e.g., `pk_xxxxx`)
   - Configuration form
   - Embed code snippet

2. **Update Configuration**:
   - Allowed Origins: Add `http://localhost:8000` (one per line)
   - Callback URL: (optional) `http://localhost:8000/callback`
   - Click "Save Configuration"

3. **Expected**: Success message displayed

### Test 4: Copy Embed Code

1. **In Dashboard**, scroll to "Embed Code" section
2. **Click "Copy"** button
3. **Expected**: Embed code copied to clipboard

### Test 5: Test Embeddable Button

#### Option A: Using demo-embed.html

1. **Open `demo-embed.html`** in the root directory
2. **Update the public key**:
   ```javascript
   // Change YOUR_PUBLIC_KEY to your actual key
   <script src="http://localhost:3001/embed/button.js?key=YOUR_PUBLIC_KEY"></script>
   ```
3. **Serve the file** using a simple HTTP server:
   ```bash
   # From repository root
   python3 -m http.server 8000
   # OR
   npx http-server -p 8000
   ```
4. **Open browser**: Navigate to http://localhost:8000/demo-embed.html

#### Option B: Create test HTML file

1. **Create `test.html`**:
   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <title>Test Seamless Auth</title>
   </head>
   <body>
     <h1>Test Auth Button</h1>
     <div id="seamless-auth-container"></div>
     
     <script src="http://localhost:3001/embed/button.js?key=YOUR_PUBLIC_KEY"></script>
     <script>
       window.addEventListener('seamlessAuthSuccess', function(event) {
         console.log('Success!', event.detail);
         alert('Authenticated! Check console for details.');
       });
     </script>
   </body>
   </html>
   ```

2. **Serve and test** as above

### Test 6: Email OTP Flow

1. **In the embedded auth button**:
   - Enter email: `user@test.com`
   - Click "Continue with Email"

2. **Check backend console** for OTP code:
   ```
   Sending OTP 123456 to user@test.com
   ```

3. **Enter the 6-digit OTP** from console
4. **Click "Verify Code"**

5. **Expected**:
   - Success message sent via postMessage
   - Browser console shows authentication details
   - JWT token generated

### Test 7: Verify JWT Token

After successful authentication:

1. **Open browser console** (F12)
2. **You should see**:
   ```javascript
   {
     type: 'SEAMLESS_AUTH_SUCCESS',
     token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
     user: {
       id: 'user-uuid',
       email: 'user@test.com'
     }
   }
   ```

### Test 8: API Endpoints

Test the API directly using curl or Postman:

#### Signup
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"api@test.com","password":"Test123456"}'
```

#### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"api@test.com","password":"Test123456"}'
```

#### Get Business Config (requires token from signup/login)
```bash
curl -X GET http://localhost:3001/api/business/config \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Update Config
```bash
curl -X PUT http://localhost:3001/api/business/config \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"allowedOrigins":["http://localhost:8000"],"callbackUrl":"http://localhost:8000/callback"}'
```

#### Send OTP
```bash
curl -X POST http://localhost:3001/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","publicKey":"YOUR_PUBLIC_KEY"}'
```

#### Verify OTP
```bash
curl -X POST http://localhost:3001/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","code":"123456","publicKey":"YOUR_PUBLIC_KEY"}'
```

## Testing Checklist

### Backend Tests
- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] Business signup creates record
- [ ] Business login returns JWT
- [ ] JWT authentication middleware works
- [ ] Business config can be retrieved
- [ ] Business config can be updated
- [ ] OTP is generated and sent
- [ ] OTP verification works
- [ ] User record created on first auth
- [ ] Embed script endpoint works

### Frontend Tests
- [ ] Landing page loads correctly
- [ ] Signup page works
- [ ] Login page works
- [ ] Dashboard displays after auth
- [ ] Public key is displayed
- [ ] Origins configuration works
- [ ] Callback URL configuration works
- [ ] Embed code is generated
- [ ] Copy to clipboard works
- [ ] Auth button page loads in iframe
- [ ] Email form validation works
- [ ] OTP form validation works
- [ ] postMessage sends data correctly

### Integration Tests
- [ ] Embed button loads in iframe
- [ ] Email submission triggers OTP
- [ ] OTP verification returns JWT
- [ ] JWT is sent via postMessage
- [ ] Parent window receives message
- [ ] End-to-end auth flow works

## Common Issues and Solutions

### Issue: Database Connection Error

**Error**: `Error: P1001: Can't reach database server`

**Solution**:
1. Check PostgreSQL is running: `pg_isready`
2. Verify DATABASE_URL in .env
3. Check database exists: `psql -l`
4. Test connection: `psql $DATABASE_URL`

### Issue: Prisma Client Not Generated

**Error**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
cd backend
npm run prisma:generate
```

### Issue: CORS Error in Browser

**Error**: `Access to fetch at 'http://localhost:3001' from origin 'http://localhost:3000' has been blocked by CORS`

**Solution**:
1. Backend already has CORS enabled
2. Check backend is running
3. Verify frontend API URL in .env.local

### Issue: Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3001`

**Solution**:
```bash
# Find process using port
lsof -i :3001
# Kill process
kill -9 <PID>
# OR use different port in .env
PORT=3002
```

### Issue: Google Fonts Loading Error

**Error**: `Failed to fetch Geist from Google Fonts`

**Solution**: Already fixed in layout.tsx (fonts removed)

### Issue: OTP Not Received

**Note**: In development, OTP is logged to backend console, not sent via email.

**Check**: Backend console for line like:
```
Sending OTP 123456 to user@test.com
```

## Performance Testing

### Load Testing (Optional)

Using `artillery` for load testing:

```bash
# Install artillery
npm install -g artillery

# Create artillery.yml
cat > artillery.yml << EOF
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: 'Auth Flow'
    flow:
      - post:
          url: '/api/otp/send'
          json:
            email: 'test@example.com'
            publicKey: 'YOUR_PUBLIC_KEY'
EOF

# Run test
artillery run artillery.yml
```

## Database Inspection

### Using Prisma Studio

```bash
cd backend
npx prisma studio
```

Opens web interface at http://localhost:5555 to view database records.

### Using psql

```bash
psql seamless_auth

# List tables
\dt

# View businesses
SELECT * FROM "Business";

# View users
SELECT * FROM "User";

# View OTPs
SELECT * FROM "OTP";
```

## Cleanup

### Reset Database

```bash
cd backend

# Drop all tables and recreate
npx prisma db push --force-reset

# OR manually
psql seamless_auth
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
\q
npm run prisma:push
```

### Stop Services

```bash
# Stop backend: Ctrl+C in backend terminal
# Stop frontend: Ctrl+C in frontend terminal

# Stop PostgreSQL
# macOS
brew services stop postgresql

# Ubuntu/Debian
sudo systemctl stop postgresql

# Docker
docker stop seamless-auth-db
```

## Next Steps

After successful local testing:
1. Review DEPLOYMENT.md for production deployment
2. Configure email service for production OTP delivery
3. Set up proper monitoring and logging
4. Implement rate limiting
5. Add additional security measures

## Support

If you encounter issues not covered here:
1. Check application logs
2. Review README.md
3. Check DEPLOYMENT.md
4. Open a GitHub issue with:
   - Error message
   - Steps to reproduce
   - Environment details
