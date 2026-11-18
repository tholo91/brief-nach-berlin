import { NextRequest, NextResponse } from "next/server";
import {
  createInternalStatsCookieValue,
  INTERNAL_STATS_COOKIE,
  INTERNAL_STATS_COOKIE_MAX_AGE,
  isInternalStatsPasswordValid,
} from "@/lib/internalStats/access";

function unlock(password: string | null) {
  const configuredPassword = process.env.INTERNAL_STATS_PASSWORD;
  const valid = isInternalStatsPasswordValid(password, configuredPassword);

  const response = new NextResponse(null, {
    status: 303,
    headers: {
      Location: valid ? "/stats" : "/stats?error=1",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
    },
  });

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

export function GET() {
  return new NextResponse(null, {
    status: 405,
    headers: {
      Allow: "POST",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const password = formData?.get("password");
  return unlock(typeof password === "string" ? password : null);
}
