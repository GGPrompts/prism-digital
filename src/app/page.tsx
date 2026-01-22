import { Hero } from '@/components/sections/Hero'
import { Features } from '@/components/sections/Features'
import { Process } from '@/components/sections/Process'
import Testimonials from '@/components/sections/Testimonials'
import { CTA } from '@/components/sections/CTA'
import { Footer } from '@/components/sections/Footer'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - transparent background to show 3D canvas */}
      <Hero />

      {/* Features Section */}
      <Features />

      {/* Process Section - How We Work / About Us */}
      <div id="about">
        <Process />
      </div>

      {/* Testimonials Section - Social Proof */}
      <div id="testimonials">
        <Testimonials />
      </div>

      {/* CTA / Contact Section */}
      <CTA />

      {/* Footer */}
      <Footer />
    </div>
  );
}
