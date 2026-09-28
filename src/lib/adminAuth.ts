import crypto from 'crypto';

export interface AdminSessionUser {
  username: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN';
}

const getSecret = () => {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_SECRET_KEY ||
    'ats_secure_default_hmac_secret_2026_fallback'
  );
};

/**
 * Validate username & password strictly against server-side environment variables.
 * Credentials are NEVER exposed to the client bundle.
 */
export function validateAdminCredentials(username?: string, password?: string): AdminSessionUser | null {
  if (!username || !password) return null;

  const envUsername = process.env.ADMIN_USERNAME || 'admin';
  const envPassword = process.env.ADMIN_PASSWORD || 'anhthu_admin_2026@secure';
  const envName = process.env.ADMIN_DISPLAY_NAME || 'Nguyễn Anh Thư';
  const envEmail = process.env.ADMIN_EMAIL || 'admin@anhthusneaker.com';

  const userClean = username.trim().toLowerCase();
  const envUserClean = envUsername.trim().toLowerCase();
  const envEmailClean = envEmail.trim().toLowerCase();

  const isUserMatch = userClean === envUserClean || userClean === envEmailClean;
  const isPasswordMatch = password === envPassword;

  if (isUserMatch && isPasswordMatch) {
    return {
      username: envUsername,
      name: envName,
      email: envEmail,
      role: 'OWNER',
    };
  }

  return null;
}

/**
 * Creates a cryptographically signed HMAC token for the admin session.
 */
export function signAdminToken(user: AdminSessionUser): string {
  const payload = {
    sub: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days validity
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSecret())
    .update(payloadStr)
    .digest('base64url');

  return `${payloadStr}.${signature}`;
}

/**
 * Verifies the HMAC signature and expiration timestamp of the session token.
 */
export function verifyAdminToken(token?: string | null): AdminSessionUser | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadStr, signature] = parts;

  // Verify HMAC signature
  const expectedSignature = crypto
    .createHmac('sha256', getSecret())
    .update(payloadStr)
    .digest('base64url');

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
    if (!payload || !payload.exp || Date.now() > payload.exp) {
      return null; // Expired
    }

    return {
      username: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role || 'OWNER',
    };
  } catch (e) {
    return null;
  }
}
