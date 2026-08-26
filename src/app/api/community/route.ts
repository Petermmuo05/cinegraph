import { NextRequest, NextResponse } from "next/server";
import { runCypher, getDriver } from "@/lib/cognodb";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId") || "u-scifilover";

  const driver = getDriver();
  if (!driver) {
    return NextResponse.json({ cohorts: [] });
  }

  try {
    // 1. Try to find cohort users who share liked movies with this user
    let query = `
      MATCH (me:User {id: $userId})-[r1:RATED]->(m:Movie)<-[r2:RATED]-(peer:User)
      WHERE peer.id <> me.id AND r1.rating >= 7.5 AND r2.rating >= 7.5
      WITH peer, count(DISTINCT m) AS overlap, collect(DISTINCT m.title)[0..2] AS sharedTitles
      WHERE overlap >= 1
      MATCH (peer)-[r3:RATED|SAVED_TO_WATCHLIST]->(recent:Movie)
      WITH peer, overlap, sharedTitles, collect(recent)[0] AS recentMovie
      RETURN peer.id AS userId,
             peer.username AS username,
             peer.avatarUrl AS avatarUrl,
             peer.tasteArchetype AS tasteArchetype,
             overlap AS sharedCount,
             sharedTitles,
             recentMovie.id AS movieId,
             recentMovie.title AS watchingMovie,
             recentMovie.posterUrl AS moviePoster
      ORDER BY overlap DESC, recentMovie.imdbRating DESC
      LIMIT 4
    `;

    let result = await runCypher(query, { userId });

    // 2. Fallback: If user has not rated movies yet or no overlap, find most active community peers
    if (result.records.length === 0) {
      query = `
        MATCH (peer:User)-[r:RATED]->(recent:Movie)
        WHERE peer.id <> $userId AND r.rating >= 8.5
        WITH peer, count(r) AS totalRatings, collect(recent)[0] AS recentMovie
        RETURN peer.id AS userId,
               peer.username AS username,
               peer.avatarUrl AS avatarUrl,
               peer.tasteArchetype AS tasteArchetype,
               1 AS sharedCount,
               [recentMovie.title] AS sharedTitles,
               recentMovie.id AS movieId,
               recentMovie.title AS watchingMovie,
               recentMovie.posterUrl AS moviePoster
        ORDER BY totalRatings DESC
        LIMIT 4
      `;
      result = await runCypher(query, { userId });
    }

    const cohorts = result.records.map((r: any, idx: number) => ({
      userId: r.userId,
      username: r.username,
      avatarUrl: r.avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop`,
      tasteArchetype: r.tasteArchetype || "Cinephile Circle",
      sharedCount: Number(r.sharedCount || 1),
      sharedTitles: r.sharedTitles || [],
      movieId: r.movieId,
      watchingMovie: r.watchingMovie,
      moviePoster: r.moviePoster,
      viewersCount: 18 + (idx * 9),
    }));

    return NextResponse.json({ cohorts });
  } catch (error) {
    console.error("Failed to query community cohorts from CognoDB:", error);
    return NextResponse.json({ error: "Failed to fetch community cohorts" }, { status: 500 });
  }
}
