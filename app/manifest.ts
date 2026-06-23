import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Eco-sociaal Dashboard",
    short_name: "Eco-sociaal",
    description:
      "Log eco-sociale activiteiten en volg de CO₂-impact. Zie hoe jullie Earth Overshoot Day verschuift.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "nl",
    dir: "ltr",
    background_color: "#fff8f3",
    theme_color: "#fff8f3",
    categories: ["productivity", "business"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
