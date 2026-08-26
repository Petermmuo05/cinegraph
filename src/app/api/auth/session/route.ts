import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME, SEED_USERS } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const cookie = request.cookies.get(SESSION_COOKIE_NAME);
    if (!cookie?.value) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    const session = await verifySessionToken(cookie.value);
    if (!session) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    const fullUser = SEED_USERS.find((u) => u.id === session.userId) || {
      id: session.userId,
      username: session.username,
      loginUsername: session.loginUsername,
      email: `${session.loginUsername}@cinegraph.io`,
      avatarUrl: session.avatarUrl,
      bio: "CineGraph explorer",
      favoriteGenre: session.favoriteGenre,
      tasteArchetype: session.tasteArchetype,
    };

    return NextResponse.json({
      authenticated: true,
      user: fullUser,
    });
  } catch (error: any) {
    console.error("Session verification error:", error);
    return NextResponse.json({ authenticated: false, user: null });
  }
}
