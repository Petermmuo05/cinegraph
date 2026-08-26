import { NextRequest, NextResponse } from "next/server";
import { validateCredentials, createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { runCypher, getDriver } from "@/lib/cognodb";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const authUser = validateCredentials(username, password);
    if (!authUser) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Ensure user node exists in CognoDB
    const driver = getDriver();
    if (driver) {
      try {
        await runCypher(
          `
          MERGE (u:User {id: $userId})
          ON CREATE SET u.username = $username,
                        u.avatarUrl = $avatarUrl,
                        u.favoriteGenre = $favoriteGenre,
                        u.tasteArchetype = $tasteArchetype,
                        u.bio = $bio
          ON MATCH SET u.username = $username,
                       u.avatarUrl = $avatarUrl,
                       u.favoriteGenre = $favoriteGenre,
                       u.tasteArchetype = $tasteArchetype
          RETURN u
          `,
          {
            userId: authUser.id,
            username: authUser.username,
            avatarUrl: authUser.avatarUrl,
            favoriteGenre: authUser.favoriteGenre,
            tasteArchetype: authUser.tasteArchetype,
            bio: authUser.bio,
          }
        );
      } catch (dbErr) {
        console.warn("CognoDB user upsert note:", dbErr);
      }
    }

    // Create secure session token
    const token = await createSessionToken(authUser);

    const response = NextResponse.json({
      success: true,
      user: authUser,
    });

    // Set secure cookie (7 days expiry)
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Auth login error:", error);
    return NextResponse.json(
      { error: "Internal server error during authentication" },
      { status: 500 }
    );
  }
}
