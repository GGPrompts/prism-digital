export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="scroll-section px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
            <span className="text-purple-400">Prism</span> Digital
          </h1>
          <p className="mt-6 text-xl text-gray-400">
            Building the Future of Web3D
          </p>
          <button className="mt-8 rounded-full bg-purple-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-purple-500">
            See Our Work
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="scroll-section px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold sm:text-4xl">
            What We Do
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-purple-400">
                3D Visualization
              </h3>
              <p className="mt-2 text-gray-400">
                Stunning visual experiences that bring your ideas to life.
              </p>
            </div>
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-purple-400">
                Interactive Experiences
              </h3>
              <p className="mt-2 text-gray-400">
                Engaging interactions that captivate your audience.
              </p>
            </div>
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-purple-400">
                WebGL Development
              </h3>
              <p className="mt-2 text-gray-400">
                High-performance graphics powered by the latest web tech.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="scroll-section px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to transform your vision?
          </h2>
          <p className="mt-4 text-xl text-gray-400">
            Let&apos;s create something extraordinary together.
          </p>
          <button className="mt-8 rounded-full border border-purple-500 px-8 py-3 font-semibold text-purple-400 transition-colors hover:bg-purple-500/10">
            Get in Touch
          </button>
        </div>
      </section>
    </>
  );
}
