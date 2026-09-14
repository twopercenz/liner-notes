import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabaseClient";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/browse`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/write`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const { data } = await supabase
    .from("entries")
    .select("id, created_at")
    .order("created_at", { ascending: false });

  const entryRoutes: MetadataRoute.Sitemap = (data ?? []).map((entry) => ({
    url: `${siteUrl}/entry/${entry.id}`,
    lastModified: entry.created_at,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...entryRoutes];
}
