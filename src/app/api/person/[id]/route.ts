import { NextRequest, NextResponse } from "next/server";
import { runCypher, getDriver } from "@/lib/cognodb";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const driver = getDriver();
  if (!driver) {
    return NextResponse.json({ error: "No database driver" }, { status: 503 });
  }

  try {
    const query = `
      MATCH (p:Person {id: $id})
      OPTIONAL MATCH (p)-[:DIRECTED]->(dm:Movie)
      OPTIONAL MATCH (p)-[act:ACTED_IN]->(am:Movie)
      RETURN p,
             collect(DISTINCT dm) AS directedMovies,
             collect(DISTINCT { movie: am, role: act.characterName }) AS actedMovies
    `;

    const result = await runCypher(query, { id });
    if (result.records.length === 0) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    const record = result.records[0];
    const person = record.p.properties;
    const directedMovies = (record.directedMovies || []).map((m: any) => m.properties);
    const actedMovies = (record.actedMovies || [])
      .filter((a: any) => a.movie)
      .map((a: any) => ({
        movie: a.movie.properties,
        role: a.role || "Actor",
      }));

    return NextResponse.json({
      person,
      directedMovies,
      actedMovies,
    });
  } catch (error) {
    console.error("Failed to fetch person profile from CognoDB:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
