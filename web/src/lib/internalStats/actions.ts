"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { INTERNAL_STATS_COOKIE } from "./access";

export async function lockInternalStats() {
  const cookieStore = await cookies();
  cookieStore.set(INTERNAL_STATS_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/stats",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/stats");
}
