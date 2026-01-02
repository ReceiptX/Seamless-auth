# API Documentation

## Base URL

```
Development: http://localhost:3001
Production: https://your-backend-url.com
```

## Authentication

Most endpoints require a JWT token obtained from business signup/login. Include it in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### Health Check

Check if the API is running.

**Endpoint**: `GET /health`

**Authentication**: Not required

**Response**:
```json
{
  "status": "ok"
}
```

---

## Business Authentication

### Business Signup

Create a new business account and receive API keys.

**Endpoint**: `POST /api/auth/signup`

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "business@example.com",
  "password": "SecurePassword123"
}
```

**Success Response** (201):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "business": {
    "id": "uuid-here",
    "email": "business@example.com",
    "publicKey": "pk_xxxxxxxxxxxxxxxxxxxx"
  }
}
```

**Error Responses**:
- `400` - Email and password are required
- `400` - Business already exists
- `500` - Internal server error

---

### Business Login

Login to existing business account.

**Endpoint**: `POST /api/auth/login`

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "business@example.com",
  "password": "SecurePassword123"
}
```

**Success Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "business": {
    "id": "uuid-here",
    "email": "business@example.com",
    "publicKey": "pk_xxxxxxxxxxxxxxxxxxxx"
  }
}
```

**Error Responses**:
- `400` - Email and password are required
- `401` - Invalid credentials
- `500` - Internal server error

---

## Business Configuration

### Get Configuration

Retrieve business configuration including allowed origins and callback URL.

**Endpoint**: `GET /api/business/config`

**Authentication**: Required (JWT token)

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200):
```json
{
  "id": "uuid-here",
  "email": "business@example.com",
  "publicKey": "pk_xxxxxxxxxxxxxxxxxxxx",
  "allowedOrigins": [
    "https://yourdomain.com",
    "https://app.yourdomain.com"
  ],
  "callbackUrl": "https://yourdomain.com/auth/callback"
}
```

**Error Responses**:
- `401` - Access token required
- `403` - Invalid or expired token
- `404` - Business not found
- `500` - Internal server error

---

### Update Configuration

Update allowed origins and callback URL.

**Endpoint**: `PUT /api/business/config`

**Authentication**: Required (JWT token)

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "allowedOrigins": [
    "https://yourdomain.com",
    "https://app.yourdomain.com"
  ],
  "callbackUrl": "https://yourdomain.com/auth/callback"
}
```

**Notes**:
- `allowedOrigins`: Array of allowed domains (optional, defaults to empty array)
- `callbackUrl`: Redirect URL after authentication (optional, can be null)

**Success Response** (200):
```json
{
  "id": "uuid-here",
  "email": "business@example.com",
  "publicKey": "pk_xxxxxxxxxxxxxxxxxxxx",
  "allowedOrigins": [
    "https://yourdomain.com",
    "https://app.yourdomain.com"
  ],
  "callbackUrl": "https://yourdomain.com/auth/callback"
}
```

**Error Responses**:
- `401` - Access token required
- `403` - Invalid or expired token
- `500` - Internal server error

---

## OTP Authentication

### Send OTP

Send a 6-digit OTP code to user's email.

**Endpoint**: `POST /api/otp/send`

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "user@example.com",
  "publicKey": "pk_xxxxxxxxxxxxxxxxxxxx"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "OTP sent to email"
}
```

**Notes**:
- OTP is valid for 10 minutes
- In development, OTP is logged to console instead of sent via email
- In production, configure email service (SendGrid, AWS SES, etc.)

**Error Responses**:
- `400` - Email and publicKey are required
- `404` - Invalid public key
- `500` - Internal server error

---

### Verify OTP

Verify OTP code and receive user JWT token.

**Endpoint**: `POST /api/otp/verify`

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "user@example.com",
  "code": "123456",
  "publicKey": "pk_xxxxxxxxxxxxxxxxxxxx"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com"
  }
}
```

**Notes**:
- If user doesn't exist, a new user record is created
- Token expires in 30 days
- User is associated with the business via publicKey

**Error Responses**:
- `400` - Email, code, and publicKey are required
- `400` - Invalid or expired OTP
- `404` - Invalid public key
- `500` - Internal server error

---

## Embed

### Get Embeddable Button Script

Retrieve JavaScript code to embed the auth button on your website.

**Endpoint**: `GET /embed/button.js?key=<publicKey>`

**Authentication**: Not required

**Query Parameters**:
- `key` (required): Your public key

**Success Response** (200):
```javascript
// JavaScript code that creates an iframe with auth button
(function() {
  var seamlessAuthConfig = { ... };
  function createAuthButton() { ... }
  // ... rest of the embed code
})();
```

**Usage Example**:
```html
<div id="seamless-auth-container"></div>
<script src="http://localhost:3001/embed/button.js?key=pk_xxx"></script>
<script>
  window.addEventListener('seamlessAuthSuccess', function(event) {
    console.log('User authenticated:', event.detail);
    // event.detail.token - JWT token
    // event.detail.user - User object
  });
</script>
```

**Error Responses**:
- `400` - Public key is required
- `404` - Invalid public key
- `500` - Internal server error

---

## PostMessage Events

When authentication is successful, the embedded iframe sends a message to the parent window:

### Event: seamlessAuthSuccess

**Event Data**:
```javascript
{
  type: 'SEAMLESS_AUTH_SUCCESS',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  user: {
    id: 'user-uuid',
    email: 'user@example.com'
  }
}
```

**Listening for the Event**:
```javascript
window.addEventListener('seamlessAuthSuccess', function(event) {
  const { token, user } = event.detail;
  
  // Store token
  localStorage.setItem('authToken', token);
  
  // Make authenticated API calls
  fetch('/api/protected', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  // Or redirect to dashboard
  window.location.href = '/dashboard';
});
```

---

## JWT Token Structure

### Business Token (from signup/login)

**Payload**:
```json
{
  "businessId": "business-uuid",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Expiration**: 7 days (default)

### User Token (from OTP verification)

**Payload**:
```json
{
  "userId": "user-uuid",
  "email": "user@example.com",
  "businessId": "business-uuid",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Expiration**: 30 days

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes**:
- `200` - Success
- `201` - Created (signup success)
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing token)
- `403` - Forbidden (invalid token)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Rate Limiting

**Note**: Rate limiting is not currently implemented but recommended for production.

Suggested limits:
- `/api/otp/send`: 5 requests per 10 minutes per IP
- `/api/otp/verify`: 10 requests per 10 minutes per IP
- `/api/auth/signup`: 3 requests per hour per IP
- `/api/auth/login`: 10 requests per 10 minutes per IP

---

## CORS

The API has CORS enabled for all origins in development. In production, configure CORS to only allow your frontend domain.

**Current Configuration**:
```javascript
app.use(cors()); // All origins allowed
```

**Production Recommendation**:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

---

## Security Best Practices

1. **Store JWT Securely**: Use httpOnly cookies or secure storage
2. **Validate Origin**: Check postMessage origin before processing
3. **HTTPS Only**: Use HTTPS in production
4. **Rate Limiting**: Implement rate limiting on OTP endpoints
5. **Strong Passwords**: Enforce password requirements
6. **Token Expiration**: Refresh tokens before expiration
7. **Input Validation**: Validate all user inputs
8. **SQL Injection**: Prisma ORM protects against SQL injection
9. **XSS Protection**: Sanitize outputs in frontend

---

## Example Integration

### Complete Flow Example

```javascript
// 1. Embed the button
// Add to your HTML
<div id="seamless-auth-container"></div>
<script src="https://api.yourdomain.com/embed/button.js?key=pk_xxx"></script>

// 2. Listen for authentication
<script>
  window.addEventListener('seamlessAuthSuccess', async function(event) {
    const { token, user } = event.detail;
    
    // Store token
    localStorage.setItem('authToken', token);
    
    // Make API call to your backend
    const response = await fetch('https://api.yourdomain.com/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('User profile:', data);
    
    // Update UI
    showWelcomeMessage(user.email);
  });
</script>
```

---

## Testing with cURL

### Complete Authentication Flow

```bash
# 1. Business Signup
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"business@test.com","password":"Test123456"}'

# Save the token and publicKey from response

# 2. Send OTP
curl -X POST http://localhost:3001/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","publicKey":"pk_xxx"}'

# Check backend console for OTP code

# 3. Verify OTP
curl -X POST http://localhost:3001/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","code":"123456","publicKey":"pk_xxx"}'

# Save the user token from response

# 4. Update Business Config
curl -X PUT http://localhost:3001/api/business/config \
  -H "Authorization: Bearer <business-token>" \
  -H "Content-Type: application/json" \
  -d '{"allowedOrigins":["https://example.com"],"callbackUrl":"https://example.com/callback"}'
```

---

## Support

For issues or questions:
- Check TESTING.md for testing instructions
- Review README.md for setup guide
- See DEPLOYMENT.md for production deployment
- Open a GitHub issue for bugs or feature requests
