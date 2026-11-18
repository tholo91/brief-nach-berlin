"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createInternalStatsCookieValue,
  INTERNAL_STATS_COOKIE_MAX_AGE,
  INTERNAL_STATS_OWNER_COOKIE,
  isInternalStatsOwnerPasswordValid,
} from "./access";

export async function unlockInternalStatsOwner(formData: FormData) {
  const password = formData.get("password");
  const configuredPassword = process.env.INTERNAL_STATS_OWNER_PASSWORD;
  if (
    typeof password !== "string" ||
    !isInternalStatsOwnerPasswordValid(
      password,
      configuredPassword,
      process.env.INTERNAL_STATS_PASSWORD,
    )
  ) {
    redirect("/stats/intern?error=1");
  }

  (await cookies()).set(
    INTERNAL_STATS_OWNER_COOKIE,
    createInternalStatsCookieValue(password),
    {
      httpOnly: true,
      maxAge: INTERNAL_STATS_COOKIE_MAX_AGE,
      path: "/stats/intern",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  );
  redirect("/stats/intern");
}

export async function lockInternalStatsOwner() {
  (await cookies()).delete({ name: INTERNAL_STATS_OWNER_COOKIE, path: "/stats/intern" });
  redirect("/stats/intern");
}
