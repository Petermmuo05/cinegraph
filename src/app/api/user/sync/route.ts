import { NextRequest, NextResponse } from "next/server";
import { runCypher, getDriver } from "@/lib/cognodb";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, username, avatarUrl, favoriteGenre, tasteArchetype, likedMovies, watchlist, userRatings } = body;

    const driver = getDriver();
    if (!driver) {
      return NextResponse.json({ success: true, isMock: true });
    }

    // 1. Create or update user node in CognoDB
    const userQuery = `
      MERGE (u:User {id: $userId})
      SET u.username = $username,
          u.avatarUrl = $avatarUrl,
          u.favoriteGenre = $favoriteGenre,
          u.tasteArchetype = $tasteArchetype
      RETURN u
    `;
    await runCypher(userQuery, {
      userId: userId || "u-scifilover",
      username: username || "Alex Smith",
      avatarUrl: avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop",
      favoriteGenre: favoriteGenre || "Science Fiction",
      tasteArchetype: tasteArchetype || "Mind-Bending",
    });

    // 2. Clear old ratings/watchlists for this user and rewrite fresh
    await runCypher(
      `MATCH (u:User {id: $userId})-[r:RATED|SAVED_TO_WATCHLIST]->() DELETE r`,
      { userId: userId || "u-scifilover" }
    );

    // 3. Link liked movies as RATED >= 9.0
    if (likedMovies && likedMovies.length > 0) {
      await runCypher(
        `
        UNWIND $movieIds AS mId
        MATCH (u:User {id: $userId}), (m:Movie {id: mId})
        MERGE (u)-[:RATED {rating: 9.5, review: "Loved during taste onboarding.", timestamp: datetime()}]->(m)
        `,
        { userId: userId || "u-scifilover", movieIds: likedMovies }
      );
    }

    // 4. Link watchlists
    if (watchlist && watchlist.length > 0) {
      await runCypher(
        `
        UNWIND $movieIds AS mId
        MATCH (u:User {id: $userId}), (m:Movie {id: mId})
        MERGE (u)-[:SAVED_TO_WATCHLIST {status: "watchlist", addedAt: datetime()}]->(m)
        `,
        { userId: userId || "u-scifilover", movieIds: watchlist }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to sync user taste graph to CognoDB:", error);
    return NextResponse.json({ error: "Failed to sync user graph" }, { status: 500 });
  }
}
