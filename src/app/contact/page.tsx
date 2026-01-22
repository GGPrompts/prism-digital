import { Metadata } from "next";
import { ContactHero } from "@/components/sections/ContactHero";
import { Footer } from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Prism Digital. Let's discuss your next 3D visualization, interactive experience, or WebGL development project.",
  openGraph: {
    title: "Contact | Prism Digital",
    description:
      "Get in touch with Prism Digital. Let's discuss your next 3D visualization, interactive experience, or WebGL development project.",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <ContactHero />
      <Footer />
    </div>
  );
}
