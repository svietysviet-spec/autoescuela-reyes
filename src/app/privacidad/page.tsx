import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Política de privacidad",
  alternates: { canonical: "/privacidad" },
  robots: { index: false },
};

export default function Page() {
  return <LegalPage doc="privacidad" />;
}
