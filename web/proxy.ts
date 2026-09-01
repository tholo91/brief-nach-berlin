import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isInternalStatsAuthorized } from "@/lib/internalStats/access";

export function proxy(request: NextRequest) {
  if (
    !isInternalStatsAuthorized(
      request.headers.get("authorization"),
      process.env.INTERNAL_STATS_USER,
      process.env.INTERNAL_STATS_PASSWORD,
    )
  ) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Brief-nach-Berlin Stats"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/stats/:path*",
};
