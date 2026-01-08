import { Hero } from '@/components/sections/Hero'
import { Process } from '@/components/sections/Process'
import Testimonials from '@/components/sections/Testimonials'
import { CTA } from '@/components/sections/CTA'
import { Footer } from '@/components/sections/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Hero />

      {/* Features Section - placeholder */}
      <section id="features" className="scroll-section">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center">What We Do</h2>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "3D Visualization",
                description: "Transform complex data and products into stunning interactive 3D visuals."
              },
              {
                title: "Interactive Experiences",
                description: "Create engaging web experiences that captivate and convert visitors."
              },
              {
                title: "WebGL Development",
                description: "Build high-performance 3D applications using cutting-edge web technologies."
              }
            ].map((feature) => (
              <div key={feature.title} className="glass-card p-6">
                <h3 className="mb-3 text-xl font-semibold text-primary">
                  {feature.title}
                </h3>
                <p className="text-foreground-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
