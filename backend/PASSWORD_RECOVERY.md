# Password Recovery Implementation

## Overview

Password recovery has been implemented using Mailjet email service with secure token-based reset flow.

## API Endpoints

### 1. Request Password Reset

**POST** `/auth/forgot-password`

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

### 2. Reset Password

**POST** `/auth/reset-password`

```json
{
  "token": "reset_token_from_email",
  "newPassword": "newSecurePassword123"
}
```

**Response:**

```json
{
  "message": "Password has been reset successfully"
}
```

## Features

- ✅ Secure token generation (32-byte random hex)
- ✅ Token expiration (1 hour)
- ✅ Professional HTML email templates
- ✅ Security best practice: doesn't reveal if email exists
- ✅ Token cleanup after successful reset
- ✅ Swagger API documentation

## Database Changes

Added to `User` entity:

- `resetPasswordToken` (nullable string)
- `resetPasswordExpires` (nullable Date)

## Email Templates

### Password Reset Email

- Professional HTML design
- Clear call-to-action button
- Copy-paste link fallback
- Security notice about ignoring if not requested

### Welcome Email (bonus)

- Sent on registration (non-critical, won't fail signup)

## Testing

### Manual Test

```bash
# Start the server
npm run start:dev

# Run the test script
.\test-password-recovery.ps1
```

### cURL Examples

Request reset:

```bash
curl -X POST http://localhost:4000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

Reset password:

```bash
curl -X POST http://localhost:4000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN_FROM_EMAIL","newPassword":"newPass123"}'
```

## Environment Variables Required

```env
MAILJET_API_KEY=your_api_key
MAILJET_SECRET_KEY=your_secret_key
MAILJET_SENDER_EMAIL=noreply@yourdomain.com
FRONTEND_URL=http://localhost:3000
```

## Security Features

1. **Token Security**: 32-byte cryptographically secure random tokens
2. **Time-based Expiration**: Tokens expire after 1 hour
3. **No Information Disclosure**: Same response whether email exists or not
4. **Single Use**: Tokens are cleared after successful password reset
5. **Database Storage**: Tokens stored securely with expiration timestamps

## Files Created/Modified

**Created:**

- `src/email/email.service.ts` - Email service using Mailjet
- `src/email/email.module.ts` - Email module

**Modified:**

- `src/users/user.entity.ts` - Added reset token fields
- `src/users/users.service.ts` - Added reset token methods
- `src/auth/auth.service.ts` - Added password recovery logic
- `src/auth/auth.controller.ts` - Added password recovery endpoints
- `src/auth/auth.module.ts` - Imported EmailModule
- `src/auth/dto/auth.dto.ts` - Added ForgotPasswordDto and ResetPasswordDto
- `src/app.module.ts` - Registered EmailModule
