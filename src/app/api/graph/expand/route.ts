import { NextRequest, NextResponse } from "next/server";
import { expandNodeNeighborhood } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const nodeId = searchParams.get("nodeId");

  if (!nodeId) {
    return NextResponse.json({ error: "Missing required parameter 'nodeId'" }, { status: 400 });
  }

  try {
    const data = await expandNodeNeighborhood(nodeId);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
