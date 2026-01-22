export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  image: string;
  technologies: string[];
  link?: string;
  color: string;
  accentColor: string;
  stats?: {
    label: string;
    value: string;
  }[];
}

export const portfolioProjects: PortfolioProject[] = [
  {
    id: "aurora-viz",
    title: "Aurora Viz",
    shortDescription: "Real-time data visualization platform",
    description:
      "An immersive 3D data visualization platform that transforms complex datasets into interactive visual experiences. Features real-time updates, custom shaders for fluid transitions, and GPU-accelerated rendering for millions of data points.",
    image: "/portfolio/aurora-viz.jpg",
    technologies: ["React Three Fiber", "WebGL", "GLSL", "D3.js", "WebSocket"],
    link: "https://aurora-viz.example.com",
    color: "#7c3aed",
    accentColor: "#a855f7",
    stats: [
      { label: "Data Points", value: "10M+" },
      { label: "Frame Rate", value: "60fps" },
      { label: "Load Time", value: "<2s" },
    ],
  },
  {
    id: "spatial-commerce",
    title: "Spatial Commerce",
    shortDescription: "3D e-commerce product configurator",
    description:
      "Revolutionary e-commerce experience allowing customers to customize products in a photorealistic 3D environment. Real-time material changes, dynamic lighting, and AR preview capability drive a 40% increase in conversion rates.",
    image: "/portfolio/spatial-commerce.jpg",
    technologies: ["Three.js", "React", "GLTF", "PBR Materials", "AR.js"],
    link: "https://spatial-commerce.example.com",
    color: "#06b6d4",
    accentColor: "#22d3ee",
    stats: [
      { label: "Conversion", value: "+40%" },
      { label: "Products", value: "500+" },
      { label: "Users", value: "2M+" },
    ],
  },
  {
    id: "metaverse-gallery",
    title: "Metaverse Gallery",
    shortDescription: "Virtual art exhibition space",
    description:
      "A virtual gallery space for digital art exhibitions featuring spatial audio, dynamic lighting, and seamless multiplayer experiences. Artists can curate immersive shows that transcend physical limitations.",
    image: "/portfolio/metaverse-gallery.jpg",
    technologies: [
      "React Three Fiber",
      "WebRTC",
      "Spatial Audio",
      "Physics",
      "Networking",
    ],
    color: "#ec4899",
    accentColor: "#f472b6",
    stats: [
      { label: "Exhibitions", value: "200+" },
      { label: "Artists", value: "1.5K" },
      { label: "Visitors", value: "500K" },
    ],
  },
  {
    id: "architectural-dreams",
    title: "Architectural Dreams",
    shortDescription: "Interactive architectural visualization",
    description:
      "Photorealistic architectural visualization tool enabling real-time walkthroughs of unbuilt spaces. Features global illumination, material libraries, and time-of-day simulation for complete design exploration.",
    image: "/portfolio/architectural-dreams.jpg",
    technologies: ["Three.js", "Ray Tracing", "HDR", "Physics", "VR Support"],
    link: "https://arch-dreams.example.com",
    color: "#f59e0b",
    accentColor: "#fbbf24",
    stats: [
      { label: "Projects", value: "150+" },
      { label: "Render Quality", value: "4K" },
      { label: "VR Ready", value: "Yes" },
    ],
  },
  {
    id: "particle-symphony",
    title: "Particle Symphony",
    shortDescription: "Music-reactive particle system",
    description:
      "An audio-reactive visual experience where millions of particles dance to music in real-time. WebAudio API analysis drives complex particle behaviors, creating unique visual signatures for every song.",
    image: "/portfolio/particle-symphony.jpg",
    technologies: [
      "WebGL",
      "GPGPU",
      "WebAudio",
      "Custom Shaders",
      "FFT Analysis",
    ],
    color: "#8b5cf6",
    accentColor: "#a78bfa",
    stats: [
      { label: "Particles", value: "5M" },
      { label: "Latency", value: "<16ms" },
      { label: "Tracks", value: "1000+" },
    ],
  },
  {
    id: "earth-observatory",
    title: "Earth Observatory",
    shortDescription: "Global data visualization globe",
    description:
      "Interactive 3D globe showcasing real-time global data including climate, population, and economic indicators. Custom atmosphere shaders and seamless data layer transitions create an engaging educational experience.",
    image: "/portfolio/earth-observatory.jpg",
    technologies: [
      "React Three Fiber",
      "GeoJSON",
      "Custom Shaders",
      "REST APIs",
      "D3-geo",
    ],
    link: "https://earth-obs.example.com",
    color: "#10b981",
    accentColor: "#34d399",
    stats: [
      { label: "Data Layers", value: "50+" },
      { label: "Countries", value: "195" },
      { label: "Updates", value: "Real-time" },
    ],
  },
];
