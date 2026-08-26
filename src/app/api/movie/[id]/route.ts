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
      MATCH (m:Movie {id: $id})
      OPTIONAL MATCH (d:Person)-[:DIRECTED]->(m)
      OPTIONAL MATCH (a:Person)-[act:ACTED_IN]->(m)
      OPTIONAL MATCH (m)-[:IN_GENRE]->(g:Genre)
      OPTIONAL MATCH (m)-[:HAS_TROPE]->(t:Trope)
      OPTIONAL MATCH (m)-[:PRODUCED_BY]->(s:Studio)
      RETURN m,
             collect(DISTINCT d) AS directors,
             collect(DISTINCT { person: a, role: act.characterName }) AS cast,
             collect(DISTINCT g) AS genres,
             collect(DISTINCT t) AS tropes,
             collect(DISTINCT s)[0] AS studio
    `;

    const result = await runCypher(query, { id });
    if (result.records.length === 0) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    const record = result.records[0];
    const movie = record.m.properties;
    const directors = (record.directors || []).map((d: any) => d.properties);
    const cast = (record.cast || [])
      .filter((c: any) => c.person)
      .map((c: any) => ({
        person: c.person.properties,
        role: c.role || "Featured Cast",
      }));
    const genres = (record.genres || []).map((g: any) => g.properties);
    const tropes = (record.tropes || []).map((t: any) => t.properties);
    const studio = record.studio?.properties;

    return NextResponse.json({
      movie,
      directors,
      cast,
      genres,
      tropes,
      studio,
    });
  } catch (error) {
    console.error("Failed to fetch movie details from CognoDB:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
