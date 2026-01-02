# Deployment Guide for Seamless Auth

This guide provides detailed instructions for deploying Seamless Auth to various platforms.

## Table of Contents
1. [Render.com Deployment](#rendercom-deployment)
2. [Vercel + Render Deployment](#vercel--render-deployment)
3. [Environment Variables Setup](#environment-variables-setup)

---

## Render.com Deployment

Render.com provides an easy way to deploy both backend and frontend with integrated PostgreSQL.

### Option 1: Using render.yaml (Recommended)

The repository includes a `render.yaml` file for automated deployment.

1. **Fork or clone this repository to your GitHub account**

2. **Create a Render account** at https://render.com

3. **Create New Blueprint Instance**:
   - Go to https://dashboard.render.com/blueprints
   - Click "New Blueprint Instance"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

4. **Configure Environment Variables**:
   After the services are created, update these environment variables:

   **For Backend Service** (`seamless-auth-backend`):
   - `BACKEND_URL`: Set to your backend URL (e.g., `https://seamless-auth-backend.onrender.com`)
   - `FRONTEND_URL`: Set to your frontend URL (e.g., `https://seamless-auth-frontend.onrender.com`)
   - `JWT_SECRET`: Auto-generated (already set)
   - `DATABASE_URL`: Auto-connected (already set)

   **For Frontend Service** (`seamless-auth-frontend`):
   - `NEXT_PUBLIC_API_URL`: Set to your backend URL (e.g., `https://seamless-auth-backend.onrender.com`)

5. **Redeploy Services** after updating environment variables

### Option 2: Manual Deployment on Render

#### Step 1: Create PostgreSQL Database

1. Go to Render Dashboard → New → PostgreSQL
2. Name: `seamless-auth-db`
3. Database: `seamless_auth`
4. Plan: Free (or as needed)
5. Click "Create Database"
6. Copy the "Internal Database URL" for later use

#### Step 2: Deploy Backend

1. Go to Render Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configure:
   - **Name**: `seamless-auth-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your deployment branch)
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: 
     ```
     npm install && npm run prisma:generate && npm run build
     ```
   - **Start Command**: 
     ```
     npm start
     ```
   - **Plan**: Free (or as needed)

4. Add Environment Variables:
   ```
   PORT=3001
   NODE_ENV=production
   DATABASE_URL=<your_postgres_internal_url>
   JWT_SECRET=<generate_a_secure_random_string>
   BACKEND_URL=https://<your-backend-name>.onrender.com
   FRONTEND_URL=https://<your-frontend-name>.onrender.com
   ```

5. Click "Create Web Service"

#### Step 3: Deploy Frontend

1. Go to Render Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configure:
   - **Name**: `seamless-auth-frontend`
   - **Region**: Same as backend
   - **Branch**: `main` (or your deployment branch)
   - **Root Directory**: `frontend`
   - **Runtime**: Node
   - **Build Command**: 
     ```
     npm install && npm run build
     ```
   - **Start Command**: 
     ```
     npm start
     ```
   - **Plan**: Free (or as needed)

4. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://<your-backend-name>.onrender.com
   ```

5. Click "Create Web Service"

#### Step 4: Update Environment Variables

After both services are deployed, update the cross-references:
- Backend's `FRONTEND_URL` → Frontend's actual URL
- Backend's `BACKEND_URL` → Backend's actual URL
- Frontend's `NEXT_PUBLIC_API_URL` → Backend's actual URL

Then manually redeploy both services.

---

## Vercel + Render Deployment

Deploy the frontend on Vercel (optimized for Next.js) and backend on Render.

### Step 1: Deploy Backend on Render

Follow the "Manual Deployment on Render" → "Step 1 & Step 2" above.

### Step 2: Deploy Frontend on Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. **Create Vercel Account** at https://vercel.com

2. **Import Project**:
   - Go to Vercel Dashboard
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Project**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

4. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://<your-backend-name>.onrender.com
   ```

5. **Deploy**: Click "Deploy"

#### Option B: Using Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

3. **Login to Vercel**:
   ```bash
   vercel login
   ```

4. **Deploy**:
   ```bash
   vercel
   ```
   Follow the prompts:
   - Set up and deploy: Yes
   - Which scope: Your account
   - Link to existing project: No
   - Project name: seamless-auth-frontend
   - Directory: ./
   - Override settings: No

5. **Set Environment Variables**:
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   ```
   Enter: `https://<your-backend-name>.onrender.com`

6. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### Step 3: Update Backend FRONTEND_URL

1. Go to Render Dashboard
2. Select your backend service
3. Go to "Environment"
4. Update `FRONTEND_URL` to your Vercel URL (e.g., `https://seamless-auth-frontend.vercel.app`)
5. Save and redeploy

---

## Environment Variables Setup

### Backend Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `3001` | Yes |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` | Yes |
| `JWT_SECRET` | Secret key for JWT signing | `your-super-secret-key-min-32-chars` | Yes |
| `BACKEND_URL` | Backend service URL | `https://api.yourdomain.com` | Yes |
| `FRONTEND_URL` | Frontend service URL | `https://yourdomain.com` | Yes |
| `NODE_ENV` | Environment mode | `production` | Recommended |

**Generating JWT_SECRET**:
```bash
# Linux/Mac
openssl rand -base64 32

# Or Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Frontend Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.yourdomain.com` | Yes |

**Important**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

---

## Post-Deployment Steps

### 1. Test Backend Health

```bash
curl https://your-backend.onrender.com/health
```

Should return: `{"status":"ok"}`

### 2. Test Business Signup

```bash
curl -X POST https://your-backend.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword123"}'
```

Should return a JWT token and business details.

### 3. Access Frontend

Visit your frontend URL and test:
1. Sign up flow
2. Login flow
3. Dashboard access
4. Configuration updates

### 4. Test Embed Button

Create a test HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Seamless Auth</title>
</head>
<body>
  <h1>Test Seamless Auth Button</h1>
  <div id="seamless-auth-container"></div>
  
  <script src="https://your-backend.onrender.com/embed/button.js?key=YOUR_PUBLIC_KEY"></script>
  <script>
    window.addEventListener('seamlessAuthSuccess', function(event) {
      console.log('Success!', event.detail);
      alert('Authenticated! Token: ' + event.detail.token);
    });
  </script>
</body>
</html>
```

---

## Troubleshooting

### Backend Issues

**Service won't start**:
- Check logs in Render dashboard
- Verify DATABASE_URL is correct
- Ensure all environment variables are set

**Database connection errors**:
- Use "Internal Database URL" from Render PostgreSQL
- Check if database is running
- Verify connection string format

**CORS errors**:
- Add allowed origins in dashboard
- Check FRONTEND_URL matches actual frontend URL

### Frontend Issues

**API calls failing**:
- Verify NEXT_PUBLIC_API_URL is correct
- Check browser console for CORS errors
- Test backend health endpoint

**Build failures**:
- Check build logs
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

### Database Migration Issues

If you need to run migrations manually:

```bash
# SSH into your Render backend service
# Then run:
npx prisma migrate deploy
```

Or use Prisma Studio to inspect your database:

```bash
npx prisma studio
```

---

## Monitoring and Maintenance

### Render Monitoring

- Check service metrics in Render Dashboard
- Set up alerts for downtime
- Monitor database usage

### Logs

Access logs:
- **Render**: Dashboard → Service → Logs tab
- **Vercel**: Dashboard → Project → Deployments → View Function Logs

### Database Backups

Render Free tier includes:
- Automatic daily backups (7 days retention)
- Manual backups via dashboard

For production, consider:
- Upgrading to paid plan for longer retention
- Setting up external backup solutions

---

## Scaling Considerations

### When to Upgrade

Free tier limitations:
- Render Free: Services sleep after inactivity, 750 hours/month
- Database storage limits

Consider upgrading when:
- Traffic increases significantly
- Need 24/7 uptime
- Require faster response times
- Need more database storage

### Performance Optimization

1. **Database Indexing**: Already included in schema
2. **Caching**: Consider Redis for OTP storage
3. **CDN**: Use Vercel's CDN for frontend
4. **Rate Limiting**: Implement on backend
5. **Connection Pooling**: Configure Prisma connection pool

---

## Security Checklist

- [ ] Change JWT_SECRET to strong random value
- [ ] Enable HTTPS (automatic on Render/Vercel)
- [ ] Configure allowedOrigins properly
- [ ] Implement rate limiting
- [ ] Set up email service for production
- [ ] Regular dependency updates
- [ ] Monitor security advisories
- [ ] Set up database backups
- [ ] Implement logging and monitoring

---

## Support

For deployment issues:
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- GitHub Issues: [Your Repository Issues]

For application issues:
- Check application logs
- Review README.md
- Open a GitHub issue
