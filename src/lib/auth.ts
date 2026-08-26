import { UserNode } from "@/types";

export interface AuthUser extends UserNode {
  loginUsername: string;
  email: string;
}

export interface AuthSession {
  userId: string;
  username: string;
  loginUsername: string;
  avatarUrl: string;
  favoriteGenre: string;
  tasteArchetype: string;
  expiresAt: number;
}

// 2 Pre-Seeded Users Specification
export const SEED_USERS: Array<AuthUser & { passwordHash: string }> = [
  {
    id: "u-scifilover",
    username: "Alex Smith",
    loginUsername: "alexsmith",
    email: "alex.smith@cinegraph.io",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop",
    bio: "Sci-Fi & Mind-Bending devotee. Non-linear timelines & astrophysics.",
    favoriteGenre: "Science Fiction",
    tasteArchetype: "Mind-Bending",
    passwordHash: "cinegraph2026!",
  },
  {
    id: "u-freshuser",
    username: "Claire Novak",
    loginUsername: "claire",
    email: "claire.novak@cinegraph.io",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&fit=crop",
    bio: "Passionate cinema explorer exploring new storytelling frontiers.",
    favoriteGenre: "Drama",
    tasteArchetype: "Indie Surrealism",
    passwordHash: "fresh2026!",
  },
];

const AUTH_SECRET = process.env.AUTH_SECRET || "cinegraph-secure-jwt-secret-key-2026-graph-network";
export const SESSION_COOKIE_NAME = "cinegraph_session";

// Lightweight HMAC-SHA256 Token Signature using Web Crypto API
async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(AUTH_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(user: AuthUser): Promise<string> {
  const sessionData: AuthSession = {
    userId: user.id,
    username: user.username,
    loginUsername: user.loginUsername,
    avatarUrl: user.avatarUrl,
    favoriteGenre: user.favoriteGenre || "Science Fiction",
    tasteArchetype: user.tasteArchetype || "Mind-Bending",
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const payloadStr = JSON.stringify(sessionData);
  const payloadB64 = Buffer.from(payloadStr).toString("base64url");
  const key = await getCryptoKey();
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
  const signatureB64 = Buffer.from(signature).toString("base64url");

  return `${payloadB64}.${signatureB64}`;
}

export async function verifySessionToken(token: string): Promise<AuthSession | null> {
  try {
    const [payloadB64, signatureB64] = token.split(".");
    if (!payloadB64 || !signatureB64) return null;

    const key = await getCryptoKey();
    const signature = Buffer.from(signatureB64, "base64url");
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      new TextEncoder().encode(payloadB64)
    );

    if (!isValid) return null;

    const payloadStr = Buffer.from(payloadB64, "base64url").toString("utf8");
    const session: AuthSession = JSON.parse(payloadStr);

    if (Date.now() > session.expiresAt) {
      return null;
    }

    return session;
  } catch (err) {
    return null;
  }
}

export function validateCredentials(usernameInput: string, passwordInput: string): AuthUser | null {
  const normalizedUsername = usernameInput.trim().toLowerCase();
  const foundUser = SEED_USERS.find(
    (u) =>
      u.loginUsername.toLowerCase() === normalizedUsername ||
      u.email.toLowerCase() === normalizedUsername
  );

  if (!foundUser) return null;
  if (foundUser.passwordHash !== passwordInput) return null;

  const { passwordHash, ...userWithoutPassword } = foundUser;
  return userWithoutPassword as AuthUser;
}
