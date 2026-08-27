import { NextRequest, NextResponse } from "next/server";
import { runCypher, getDriver } from "@/lib/cognodb";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get("userId");

    if (!userId) {
      const cookie = request.cookies.get(SESSION_COOKIE_NAME);
      if (cookie?.value) {
        const session = await verifySessionToken(cookie.value);
        if (session) userId = session.userId;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "UserId is required" }, { status: 400 });
    }

    const driver = getDriver();
    if (!driver) {
      return NextResponse.json({
        success: true,
        isMock: true,
        watchlist: [],
        likedMovies: [],
        userRatings: {},
      });
    }

    const query = `
      MATCH (u:User {id: $userId})
      OPTIONAL MATCH (u)-[:SAVED_TO_WATCHLIST]->(wm:Movie)
      OPTIONAL MATCH (u)-[rRate:RATED]->(rm:Movie)
      RETURN 
        collect(DISTINCT wm.id) AS watchlist,
        collect(DISTINCT rm.id) AS likedMovies,
        collect(DISTINCT {movieId: rm.id, rating: rRate.rating}) AS ratings
    `;

    const result = await runCypher(query, { userId });
    if (!result.records || result.records.length === 0) {
      return NextResponse.json({
        success: true,
        watchlist: [],
        likedMovies: [],
        userRatings: {},
      });
    }

    const record = result.records[0];
    const watchlist = (record.watchlist || []).filter(Boolean);
    const likedMovies = (record.likedMovies || []).filter(Boolean);
    const rawRatings = record.ratings || [];

    const userRatings: Record<string, number> = {};
    for (const item of rawRatings) {
      if (item && item.movieId) {
        const parsed = Number(item.rating);
        userRatings[item.movieId] = Number.isFinite(parsed) ? parsed : 9.5;
      }
    }

    return NextResponse.json({
      success: true,
      watchlist,
      likedMovies,
      userRatings,
    });
  } catch (error) {
    console.error("Failed to fetch user state from CognoDB:", error);
    return NextResponse.json({ error: "Failed to fetch user graph" }, { status: 500 });
  }
}

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

    // 3. Link liked & rated movies
    const ratingsToSave: Array<{ movieId: string; rating: number }> = [];

    if (userRatings && typeof userRatings === "object") {
      for (const [mId, score] of Object.entries(userRatings)) {
        ratingsToSave.push({ movieId: mId, rating: Number(score) || 9.0 });
      }
    }

    if (likedMovies && likedMovies.length > 0) {
      for (const mId of likedMovies) {
        if (!ratingsToSave.some((r) => r.movieId === mId)) {
          ratingsToSave.push({ movieId: mId, rating: 9.5 });
        }
      }
    }

    if (ratingsToSave.length > 0) {
      await runCypher(
        `
        UNWIND $ratings AS rItem
        MERGE (m:Movie {id: rItem.movieId})
        WITH rItem, m
        MATCH (u:User {id: $userId})
        MERGE (u)-[:RATED {rating: rItem.rating, timestamp: datetime()}]->(m)
        `,
        { userId: userId || "u-scifilover", ratings: ratingsToSave }
      );
    }

    // 4. Link watchlists
    if (watchlist && watchlist.length > 0) {
      await runCypher(
        `
        UNWIND $movieIds AS mId
        MERGE (m:Movie {id: mId})
        WITH m
        MATCH (u:User {id: $userId})
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

