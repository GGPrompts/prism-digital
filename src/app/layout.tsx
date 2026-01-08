import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Canvas3D } from "@/components/canvas/Canvas3D";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
      >
        <main>
          {/* Fixed 3D Canvas - persists across routes */}
          <Canvas3D />

          {/* Scrollable DOM content overlaid on canvas */}
          <div className="relative z-10">{children}</div>
        </main>
      </body>
    </html>
  );
}
