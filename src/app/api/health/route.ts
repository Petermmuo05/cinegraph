import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/cognodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await checkDatabaseHealth();
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json(
      {
        connected: false,
        isMock: true,
        latencyMs: 0,
        nodeCount: 0,
        edgeCount: 0,
        errorMessage: error.message,
      },
      { status: 500 }
    );
  }
}
