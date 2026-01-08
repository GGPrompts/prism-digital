import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Prism Digital - Building the Future of Web3D";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)",
          padding: "80px",
        }}
      >
        {/* Logo area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          {/* Prism icon */}
          <div
            style={{
              width: "120px",
              height: "120px",
              background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
              marginRight: "40px",
            }}
          />
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.2,
            marginBottom: "20px",
            display: "flex",
          }}
        >
          Prism Digital
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 400,
            color: "#a855f7",
            marginBottom: "30px",
            display: "flex",
          }}
        >
          Building the Future of Web3D
        </div>

        {/* Features */}
        <div
          style={{
            fontSize: 24,
            fontWeight: 300,
            color: "#9ca3af",
            display: "flex",
          }}
        >
          3D Visualization • Interactive Experiences • WebGL Development
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
