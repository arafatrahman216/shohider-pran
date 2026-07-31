import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shohider Pran (শহীদের প্রাণ)",
    short_name: "Shohider Pran",
    description:
      "Registry and support platform for the martyrs and injured of the July Mass Uprising.",
    start_url: "/bn",
    scope: "/",
    display: "standalone",
    background_color: "#F2EFE6",
    theme_color: "#5C1A1A",
    lang: "bn",
    dir: "ltr",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
