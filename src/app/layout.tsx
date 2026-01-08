import type { Metadata } from "next";
import { Geist, Geist_Mono, Bebas_Neue, Inter, JetBrains_Mono, Orbitron } from "next/font/google";
import { Canvas3D } from "@/components/canvas/Canvas3D";
import { Header } from "@/components/sections/Header";
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
  title: "Prism Digital | Building the Future of Web3D",
  description:
    "3D visualization studio specializing in interactive experiences and WebGL development.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} ${inter.variable} ${jetbrainsMono.variable} ${orbitron.variable} bg-background text-foreground antialiased`}
      >
        <main>
          {/* Fixed 3D Canvas - persists across routes */}
          <Canvas3D />

          {/* Floating glass navigation header */}
          <Header />

          {/* Scrollable DOM content overlaid on canvas */}
          <div className="relative z-10">{children}</div>
        </main>
      </body>
    </html>
  );
}
