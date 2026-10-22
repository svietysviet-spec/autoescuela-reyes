import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Política de cookies",
  alternates: { canonical: "/cookies" },
  robots: { index: false },
};

export default function Page() {
  return <LegalPage doc="cookies" />;
}
