import type { Metadata } from "next";
import { ProfessionalPermit } from "@/components/ProfessionalPermit";
import { ENROLL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Permiso D · Carnet de guagua en Las Palmas",
  description:
    "Carnet de guagua (permiso D) y CAP de viajeros en Las Palmas de Gran Canaria. Matrícula desde 100 €, CAP inicial acelerado 1500 €.",
  alternates: { canonical: "/permiso-d" },
};

export default function PermisoD() {
  return (
    <ProfessionalPermit
      letter="D"
      vehicle="Guagua"
      scope="Vehículos de transporte de viajeros de más de 9 plazas, incluido el conductor."
      sector="viajeros"
      otherSector="mercancías"
      image="/img/guagua-d.jpg"
      imageAlt="Guagua de prácticas de Autoescuela Reyes"
      enrollHref={ENROLL.d}
    />
  );
}
