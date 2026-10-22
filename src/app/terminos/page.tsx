import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Aviso legal y términos",
  alternates: { canonical: "/terminos" },
  robots: { index: false },
};

export default function Page() {
  return <LegalPage doc="terminos" />;
}
