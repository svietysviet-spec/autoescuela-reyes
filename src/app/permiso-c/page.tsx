import type { Metadata } from "next";
import { ProfessionalPermit } from "@/components/ProfessionalPermit";
import { ENROLL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Permiso C · Carnet de camión en Las Palmas",
  description:
    "Carnet de camión (permiso C) y CAP de mercancías en Las Palmas de Gran Canaria. Matrícula desde 100 €, CAP inicial acelerado 1500 €.",
  alternates: { canonical: "/permiso-c" },
};

export default function PermisoC() {
  return (
    <ProfessionalPermit
      letter="C"
      vehicle="Camión"
      scope="Vehículos de transporte de mercancías con una MMA superior a 3.500 kg."
      sector="mercancías"
      otherSector="viajeros"
      image="/img/camion-c-2.jpg"
      imageAlt="Camión de prácticas de Autoescuela Reyes en carretera"
      enrollHref={ENROLL.c}
    />
  );
}
