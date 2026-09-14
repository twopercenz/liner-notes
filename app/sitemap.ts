import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabaseClient";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "hourly", priority: 1 },
    { url: `${siteUrl}/explore`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/write`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const [{ data: works }, { data: posts }] = await Promise.all([
    supabase.from("works").select("id, created_at").order("created_at", { ascending: false }),
    supabase.from("posts").select("id, created_at").order("created_at", { ascending: false }),
  ]);

  const workRoutes: MetadataRoute.Sitemap = (works ?? []).map((w) => ({
    url: `${siteUrl}/entry/${w.id}`,
    lastModified: w.created_at,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const postRoutes: MetadataRoute.Sitemap = (posts ?? []).map((p) => ({
    url: `${siteUrl}/post/${p.id}`,
    lastModified: p.created_at,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...workRoutes, ...postRoutes];
}
