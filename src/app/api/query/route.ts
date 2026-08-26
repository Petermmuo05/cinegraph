import { NextRequest, NextResponse } from "next/server";
import { runCypher } from "@/lib/cognodb";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { query, params } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Missing or invalid 'query' string" }, { status: 400 });
    }

    // Safety guard: prevent destructive queries in the interactive workbench
    const upper = query.trim().toUpperCase();
    if (upper.includes("DROP ") || upper.includes("DELETE ") || upper.includes("REMOVE ")) {
      return NextResponse.json(
        { error: "Destructive queries (DROP, DELETE, REMOVE) are restricted in the evaluator console." },
        { status: 403 }
      );
    }

    const result = await runCypher(query, params || {});
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
