import { NextRequest, NextResponse } from "next/server";
import { listPublishedDeadlines } from "@/lib/queries/public-deadlines";

/**
 * Backs the client-side filter/pagination on /deadlines. The page itself
 * reads no searchParams so it stays statically revalidated (see page.tsx);
 * changing a filter or page fetches here instead of a full navigation.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const filters = {
    country: params.get("country") ?? undefined,
    degreeLevel: params.get("degreeLevel") ?? undefined,
    type: params.get("type") ?? undefined,
  };
  const page = Math.max(1, Number(params.get("page")) || 1);

  const result = await listPublishedDeadlines(filters, page);
  return NextResponse.json(result);
}
