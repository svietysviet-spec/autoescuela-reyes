import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileDock } from "@/components/MobileDock";
import { RevealObserver } from "@/components/RevealObserver";
import { CENTERS, LINKS, SITE } from "@/lib/site";
import "./globals.css";

const description =
  "Autoescuela en Las Palmas de Gran Canaria: permiso de coche (B), moto (A1, A2), camión (C, C+E), guagua (D), cursos CAP y recuperación de puntos. Matrícula online.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Autoescuela Reyes · Autoescuela en Las Palmas de Gran Canaria",
    template: "%s · Autoescuela Reyes",
  },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: SITE.name,
    title: "Autoescuela Reyes · Las Palmas de Gran Canaria",
    description,
    images: [{ url: "/img/hero-coche-calle.jpg", width: 1600, height: 1200, alt: "Coche de prácticas de Autoescuela Reyes" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "DrivingSchool",
  "@id": `${SITE.url}/#autoescuela`,
  name: SITE.name,
  legalName: SITE.legalName,
  url: SITE.url,
  logo: `${SITE.url}/img/logo-grande.jpg`,
  image: `${SITE.url}/img/hero-coche-calle.jpg`,
  email: SITE.email,
  telephone: `+34${SITE.phone}`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "C. Fondos de Segura, 11",
    postalCode: "35019",
    addressLocality: "Las Palmas de Gran Canaria",
    addressRegion: "Las Palmas",
    addressCountry: "ES",
  },
  sameAs: [LINKS.facebook, LINKS.instagram, LINKS.tiktok],
  department: CENTERS.filter((c) => c.id !== "7-palmas").map((c) => ({
    "@type": "DrivingSchool",
    name: `${SITE.name} · ${c.name}`,
    telephone: `+${c.whatsapp}`,
    ...(c.email ? { email: c.email } : {}),
    ...(c.postal
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: c.postal.street,
            postalCode: c.postal.postalCode,
            addressLocality: c.postal.locality,
            addressRegion: "Las Palmas",
            addressCountry: "ES",
          },
        }
      : {}),
  })),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        <a
          href="#contenido"
          className="sr-only z-[60] rounded-xl bg-accent px-4 py-3 font-semibold text-on-accent focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
        >
          Saltar al contenido
        </a>
        <Header />
        <main id="contenido" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer />
        <MobileDock />
        <RevealObserver />
      </body>
    </html>
  );
}
