import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Work",
  description:
    "Explore Prism Digital's portfolio of immersive 3D experiences, interactive visualizations, and cutting-edge WebGL applications. See our work in action.",
  openGraph: {
    title: "Our Work | Prism Digital",
    description:
      "Explore our portfolio of immersive 3D experiences, interactive visualizations, and cutting-edge WebGL applications.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Prism Digital Portfolio - 3D Visualization Studio",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Work | Prism Digital",
    description:
      "Explore our portfolio of immersive 3D experiences and WebGL applications.",
    images: ["/og-image.png"],
  },
};

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
