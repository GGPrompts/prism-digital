export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="scroll-section relative">
        <div className="bg-gradient-glow absolute inset-0" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h1 className="text-gradient mb-6">
            Building the Future of Web3D
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-foreground-muted">
            Prism Digital creates immersive 3D experiences that push the boundaries
            of what&apos;s possible on the web.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button className="btn btn-primary">
              See Our Work
            </button>
            <button className="btn btn-glass">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="scroll-section">
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

      {/* CTA Section */}
      <section className="scroll-section">
        <div className="glass mx-auto max-w-2xl p-12 text-center">
          <h2 className="glow-text mb-4">Ready to Start?</h2>
          <p className="mb-8 text-foreground-muted">
            Let&apos;s create something extraordinary together.
          </p>
          <button className="btn btn-primary glow-pulse">
            Get in Touch
          </button>
        </div>
      </section>
    </div>
  );
}
