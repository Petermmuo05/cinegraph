import { NextRequest, NextResponse } from "next/server";
import { runCypher, getDriver } from "@/lib/cognodb";
import { MovieNode } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "20");
  const category = searchParams.get("category") || "";
  const genre = searchParams.get("genre") || "";
  const director = searchParams.get("director") || "";
  const search = searchParams.get("search")?.toLowerCase().trim() || "";

  const driver = getDriver();
  if (!driver) {
    return NextResponse.json({ movies: [] });
  }

  try {
    let query = "";
    let params: Record<string, any> = { limit };

    if (search) {
      query = `
        MATCH (m:Movie)
        WHERE toLower(m.title) CONTAINS $search
        RETURN m
        ORDER BY m.imdbRating DESC
        LIMIT $limit
      `;
      params.search = search;
    } else if (category === "featured") {
      query = `
        MATCH (m:Movie)
        WHERE m.featured = true OR m.imdbRating >= 8.6
        RETURN m
        ORDER BY m.imdbRating DESC
        LIMIT $limit
      `;
    } else if (category === "top_rated") {
      query = `
        MATCH (m:Movie)
        RETURN m
        ORDER BY m.imdbRating DESC
        LIMIT $limit
      `;
    } else if (genre) {
      query = `
        MATCH (m:Movie)-[:IN_GENRE]->(g:Genre)
        WHERE toLower(g.name) = toLower($genre)
        RETURN m
        ORDER BY m.imdbRating DESC
        LIMIT $limit
      `;
      params.genre = genre;
    } else if (director) {
      query = `
        MATCH (d:Person)-[:DIRECTED]->(m:Movie)
        WHERE toLower(d.name) CONTAINS toLower($director)
        RETURN m
        ORDER BY m.releaseYear DESC
        LIMIT $limit
      `;
      params.director = director;
    } else {
      // Default: Top-connected landmark movies for onboarding
      query = `
        MATCH (m:Movie)
        OPTIONAL MATCH (m)<-[r:RATED]-()
        WITH m, count(r) AS ratingCount
        RETURN m
        ORDER BY ratingCount DESC, m.imdbRating DESC
        LIMIT $limit
      `;
    }

    const result = await runCypher(query, params);
    const movies: MovieNode[] = result.records.map((r: any) => r.m.properties);

    return NextResponse.json({ movies });
  } catch (error) {
    console.error("Failed to query movies from CognoDB:", error);
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 });
  }
}
