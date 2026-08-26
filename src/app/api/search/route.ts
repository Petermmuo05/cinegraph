import { NextRequest, NextResponse } from "next/server";
import { mockGraphData } from "@/lib/mock-data";
import { runCypher, getDriver } from "@/lib/cognodb";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q")?.toLowerCase().trim() || "";

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const driver = getDriver();
  if (!driver) {
    const results = mockGraphData.nodes
      .filter((n) => (n.name || n.title || "").toLowerCase().includes(q))
      .slice(0, 10)
      .map((n) => ({
        id: n.id,
        label: n.label,
        name: n.name || n.title,
        color: n.color,
        properties: n.properties,
      }));
    return NextResponse.json({ results });
  }

  try {
    const query = `
      MATCH (n)
      WHERE (n:Movie AND toLower(n.title) CONTAINS $q)
         OR (n:Person AND toLower(n.name) CONTAINS $q)
         OR (n:Genre AND toLower(n.name) CONTAINS $q)
         OR (n:Trope AND toLower(n.name) CONTAINS $q)
      RETURN n, labels(n)[0] AS label
      LIMIT 10
    `;
    const result = await runCypher(query, { q });
    const results = result.records.map((r: any) => ({
      id: r.n.properties.id,
      label: r.label,
      name: r.n.properties.name || r.n.properties.title,
      properties: r.n.properties,
    }));
    return NextResponse.json({ results });
  } catch (err) {
    const results = mockGraphData.nodes
      .filter((n) => (n.name || n.title || "").toLowerCase().includes(q))
      .slice(0, 10);
    return NextResponse.json({ results });
  }
}
