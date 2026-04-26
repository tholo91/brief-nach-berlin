import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/config";

const BASE_URL = APP_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: BASE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/impressum`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/datenschutz`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
