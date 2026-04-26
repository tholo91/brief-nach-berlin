import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/config";

const BASE_URL = APP_URL;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
