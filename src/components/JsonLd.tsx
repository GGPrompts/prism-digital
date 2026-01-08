import { type Graph, type Organization, type WebSite } from "schema-dts";

export function JsonLd() {
  const organizationSchema: Organization = {
    "@type": "Organization",
    "@id": "https://prismdigital.com/#organization",
    name: "Prism Digital",
    url: "https://prismdigital.com",
    logo: {
      "@type": "ImageObject",
      url: "https://prismdigital.com/logo.png",
      width: "512",
      height: "512",
    },
    description:
      "3D visualization studio specializing in interactive experiences and WebGL development.",
    foundingDate: "2024",
    sameAs: [
      "https://twitter.com/prismdigital",
      "https://github.com/prismdigital",
      "https://linkedin.com/company/prismdigital",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      availableLanguage: ["English"],
    },
  };

  const websiteSchema: WebSite = {
    "@type": "WebSite",
    "@id": "https://prismdigital.com/#website",
    url: "https://prismdigital.com",
    name: "Prism Digital",
    description:
      "Building the Future of Web3D - 3D visualization studio specializing in interactive experiences and WebGL development.",
    publisher: {
      "@id": "https://prismdigital.com/#organization",
    },
    inLanguage: "en-US",
  };

  const jsonLd: Graph = {
    "@context": "https://schema.org",
    "@graph": [organizationSchema, websiteSchema],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
