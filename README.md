# Seamless Auth - Multi-tenant Passwordless Authentication SaaS

A complete SaaS solution for embedding passwordless authentication into any website. Built with Next.js, Express.js, TypeScript, Prisma, and PostgreSQL.

## Features

- 🔐 **Passwordless Authentication** - Email-based OTP (6-digit code)
- 🏢 **Multi-tenant Architecture** - Each business gets their own public/secret keys
- 🎨 **Embeddable Auth Button** - Single line of code integration
- 🔑 **JWT Token Generation** - Secure authentication tokens
- 🌐 **CORS Configuration** - Set allowed origins per business
- 📬 **Callback URL Support** - Optional redirect after authentication
- 💬 **PostMessage Integration** - Return JWT via postMessage (default)

## Tech Stack

### Backend
- Express.js with TypeScript
- Prisma ORM
- PostgreSQL Database
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- Next.js 15 with TypeScript
- Tailwind CSS
- Axios for API calls
- Client-side state management

## Project Structure

```
Seamless-auth/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts        # Business signup/login
│   │   │   ├── business.ts    # Business configuration
│   │   │   ├── otp.ts         # OTP send/verify
│   │   │   └── embed.ts       # Embeddable button script
│   │   ├── middleware/
│   │   │   └── auth.ts        # JWT authentication
│   │   ├── services/
│   │   │   └── email.ts       # Email/OTP service
│   │   ├── utils/
│   │   │   ├── auth.ts        # JWT & key generation
│   │   │   └── prisma.ts      # Prisma client
│   │   └── index.ts           # Express server
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── app/
    │   ├── signup/            # Business signup page
    │   ├── login/             # Business login page
    │   ├── dashboard/         # Business dashboard
    │   ├── auth-button/       # Embeddable auth button
    │   └── page.tsx           # Landing page
    ├── lib/
    │   └── api.ts             # API client
    ├── .env.example
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```env
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/seamless_auth?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"
```

5. Generate Prisma client and run migrations:
```bash
npm run prisma:generate
npm run prisma:push
```

6. Start the development server:
```bash
npm run dev
```

Backend will be running on http://localhost:3001

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp .env.example .env.local
```

4. Update `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

5. Start the development server:
```bash
npm run dev
```

Frontend will be running on http://localhost:3000

## Usage Guide

### For Business Owners

1. **Sign Up**: Go to http://localhost:3000/signup
2. **Get Your API Key**: After signup, you'll see your public key in the dashboard
3. **Configure Origins**: Add allowed domains (e.g., https://yourdomain.com)
4. **Optional Callback URL**: Set a URL where users will be redirected after auth
5. **Embed the Button**: Copy the embed code and add it to your website

### Embedding the Auth Button

Add this code to your website:

```html
<div id="seamless-auth-container"></div>
<script src="http://localhost:3001/embed/button.js?key=YOUR_PUBLIC_KEY"></script>
<script>
  window.addEventListener('seamlessAuthSuccess', function(event) {
    console.log('User authenticated:', event.detail);
    // Access token: event.detail.token
    // Access user: event.detail.user
    
    // Store the token
    localStorage.setItem('authToken', event.detail.token);
    
    // Redirect or update UI
    window.location.href = '/dashboard';
  });
</script>
```

### Authentication Flow

1. User clicks the auth button on your website
2. User enters their email address
3. System sends a 6-digit OTP to the email
4. User enters the OTP
5. System verifies the OTP and generates a JWT
6. JWT is sent back via postMessage or redirect to callback URL

## API Endpoints

### Business Authentication
- `POST /api/auth/signup` - Create business account
- `POST /api/auth/login` - Business login

### Business Configuration
- `GET /api/business/config` - Get business configuration (requires auth)
- `PUT /api/business/config` - Update configuration (requires auth)

### OTP Authentication
- `POST /api/otp/send` - Send OTP to email
- `POST /api/otp/verify` - Verify OTP and get JWT

### Embed
- `GET /embed/button.js?key=PUBLIC_KEY` - Get embeddable button script

## Database Schema

```prisma
model Business {
  id             String   @id @default(uuid())
  email          String   @unique
  password       String
  publicKey      String   @unique
  secretKey      String   @unique
  allowedOrigins String[] @default([])
  callbackUrl    String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  users User[]
  otps  OTP[]
}

model User {
  id         String   @id @default(uuid())
  email      String
  businessId String
  business   Business @relation(fields: [businessId], references: [id])
  createdAt  DateTime @default(now())
  
  @@unique([email, businessId])
}

model OTP {
  id         String   @id @default(uuid())
  email      String
  code       String
  businessId String
  business   Business @relation(fields: [businessId], references: [id])
  verified   Boolean  @default(false)
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  
  @@index([email, businessId])
}
```

## Deployment

### Deploy to Render.com

#### Backend Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run prisma:generate && npm run build`
   - **Start Command**: `npm start`
4. Add environment variables:
   ```
   DATABASE_URL=your_postgres_url
   JWT_SECRET=your_secret_key
   BACKEND_URL=https://your-backend.onrender.com
   FRONTEND_URL=https://your-frontend.onrender.com
   PORT=3001
   ```
5. Create a PostgreSQL database on Render and link it

#### Frontend Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```

### Deploy to Vercel (Frontend) + Render (Backend)

#### Backend on Render
Follow the backend deployment steps above.

#### Frontend on Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to frontend directory
3. Run: `vercel`
4. Follow the prompts
5. Set environment variable in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```

## Environment Variables

### Backend (.env)
```env
PORT=3001
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="your-secret-key"
BACKEND_URL="https://your-backend-url.com"
FRONTEND_URL="https://your-frontend-url.com"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## Security Considerations

- Change `JWT_SECRET` to a strong random value in production
- Use HTTPS in production
- Configure `allowedOrigins` properly to prevent unauthorized embedding
- Implement rate limiting on OTP endpoints
- Consider adding email service (SendGrid, AWS SES) for production
- Store passwords with bcrypt (already implemented)
- Validate and sanitize all inputs

## Development

### Backend Commands
```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:push      # Push schema to database
```

### Frontend Commands
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Lint code
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Verify database credentials

### CORS Errors
- Add your domain to allowedOrigins in the dashboard
- Check BACKEND_URL and FRONTEND_URL environment variables

### OTP Not Received
- Check email service configuration
- In development, OTP is logged to console
- Implement proper email service for production

## License

ISC

## Support

For issues and questions, please open an issue on GitHub.