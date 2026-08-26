import { NextResponse } from "next/server";
import { getCollaboratorCliques } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cliques = await getCollaboratorCliques();
    return NextResponse.json(cliques);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
