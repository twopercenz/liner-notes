import type { MetadataRoute } from "next";
import { siteDescription, siteName } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteName} — 나만의 음악 해석 노트`,
    short_name: siteName,
    description: siteDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#fff6ec",
    theme_color: "#ff7a59",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
