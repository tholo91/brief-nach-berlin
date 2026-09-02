"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createInternalStatsCookieValue,
  INTERNAL_STATS_COOKIE,
  INTERNAL_STATS_COOKIE_MAX_AGE,
  isInternalStatsPasswordValid,
} from "./access";

export async function unlockInternalStats(formData: FormData) {
  const password = formData.get("password");
  const configuredPassword = process.env.INTERNAL_STATS_PASSWORD;

  if (
    typeof password !== "string" ||
    !isInternalStatsPasswordValid(password, configuredPassword)
  ) {
    redirect("/stats?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set(INTERNAL_STATS_COOKIE, createInternalStatsCookieValue(password), {
    httpOnly: true,
    maxAge: INTERNAL_STATS_COOKIE_MAX_AGE,
    path: "/stats",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/stats");
}

export async function lockInternalStats() {
  const cookieStore = await cookies();
  cookieStore.delete(INTERNAL_STATS_COOKIE);
  redirect("/stats");
}
