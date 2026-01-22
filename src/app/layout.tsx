import type { Metadata } from "next";
import { Geist, Geist_Mono, Bebas_Neue, Inter, JetBrains_Mono, Orbitron } from "next/font/google";
import { Canvas3D } from "@/components/canvas/Canvas3D";
import { Header } from "@/components/sections/Header";
import { JsonLd } from "@/components/JsonLd";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ContentFade } from "@/components/ui/ContentFade";
import { ScrollConfig } from "@/components/ScrollConfig";
import { CustomCursor } from "@/components/CustomCursor";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas-neue",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://prismdigital.com"),
  title: {
    default: "Prism Digital | Building the Future of Web3D",
    template: "%s | Prism Digital",
  },
  description:
    "3D visualization studio specializing in interactive experiences and WebGL development. We create cutting-edge 3D web applications that push the boundaries of what's possible in the browser.",
  keywords: [
    "3D visualization",
    "WebGL development",
    "React Three Fiber",
    "interactive experiences",
    "3D web applications",
    "Three.js",
    "Web3D",
    "3D studio",
    "WebGL studio",
  ],
  authors: [{ name: "Prism Digital" }],
  creator: "Prism Digital",
  publisher: "Prism Digital",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://prismdigital.com",
    siteName: "Prism Digital",
    title: "Prism Digital | Building the Future of Web3D",
    description:
      "3D visualization studio specializing in interactive experiences and WebGL development. We create cutting-edge 3D web applications that push the boundaries of what's possible in the browser.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Prism Digital - 3D Visualization Studio",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prism Digital | Building the Future of Web3D",
    description:
      "3D visualization studio specializing in interactive experiences and WebGL development.",
    images: ["/og-image.png"],
    creator: "@prismdigital",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLd />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} ${inter.variable} ${jetbrainsMono.variable} ${orbitron.variable} text-foreground antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {/* Custom cursor with trail effect - hidden on mobile */}
          <CustomCursor />

          {/* GSAP ScrollTrigger configuration */}
          <ScrollConfig enableSnap={false} />

          <main>
            {/* Fixed 3D Canvas - persists across routes */}
            <Canvas3D />

            {/* Content with smooth fade-in after loading */}
            <ContentFade>
              {/* Floating glass navigation header */}
              <Header />

              {/* Scrollable DOM content overlaid on canvas */}
              <div className="relative z-10">{children}</div>
            </ContentFade>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
