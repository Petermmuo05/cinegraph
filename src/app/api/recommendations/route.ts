import { NextRequest, NextResponse } from "next/server";
import { getExplainableRecommendations } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId") || "u-scifilover";
  const movieId = searchParams.get("movieId") || undefined;
  const strategy = (searchParams.get("strategy") || "collaborative") as any;
  const genre = searchParams.get("genre") || undefined;
  const director = searchParams.get("director") || undefined;
  const trope = searchParams.get("trope") || undefined;
  const category = searchParams.get("category") || undefined;
  const limit = parseInt(searchParams.get("limit") || "12");
  const excludeParam = searchParams.get("excludeIds");
  const excludeIds = excludeParam ? excludeParam.split(",") : [];

  try {
    const recommendations = await getExplainableRecommendations({
      userId,
      movieId,
      strategy,
      genre,
      director,
      trope,
      category,
      excludeIds,
      limit,
    });
    return NextResponse.json(recommendations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
