import { NextRequest, NextResponse } from "next/server";
import { findShortestPath } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const personA = searchParams.get("from") || "Timothée Chalamet";
  const personB = searchParams.get("to") || "Cillian Murphy";

  try {
    const pathResult = await findShortestPath(personA, personB);
    return NextResponse.json(pathResult);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
