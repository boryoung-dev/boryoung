import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "(주)보령항공여행사 - 해외골프투어 전문",
    short_name: "보령항공여행",
    description: "22년 전통의 해외골프투어 전문 여행사",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0070f3",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
