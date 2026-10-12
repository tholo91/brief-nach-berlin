import { NextRequest, NextResponse } from "next/server";
import {
  createInternalStatsCookieValue,
  INTERNAL_STATS_COOKIE,
  INTERNAL_STATS_COOKIE_MAX_AGE,
  isInternalStatsPasswordValid,
} from "@/lib/internalStats/access";

export function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const password = requestUrl.searchParams.get("pw");
  const configuredPassword = process.env.INTERNAL_STATS_PASSWORD;
  const valid = isInternalStatsPasswordValid(password, configuredPassword);

  const destination = new URL("/stats", requestUrl);
  if (!valid) destination.searchParams.set("error", "1");
  const response = NextResponse.redirect(destination, 303);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");

  if (valid && password) {
    response.cookies.set(INTERNAL_STATS_COOKIE, createInternalStatsCookieValue(password), {
      httpOnly: true,
      maxAge: INTERNAL_STATS_COOKIE_MAX_AGE,
      path: "/stats",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}
