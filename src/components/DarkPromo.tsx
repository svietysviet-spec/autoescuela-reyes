import Image from "next/image";
import { Button } from "@/components/ui";

/** Tarjeta oscura con imagen para los exploradores 3D («Bajo el capó», «Conoce tu coche»). */
export function DarkPromo({
  id,
  image,
  alt,
  eyebrow,
  title,
  body,
  href,
  cta,
  contain,
}: {
  id: string;
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  /** la imagen se ve entera (un coche recortado) en lugar de llenar el hueco */
  contain?: boolean;
}) {
  return (
    <div className="reveal grid overflow-hidden rounded-[22px] bg-[#0b0d12] text-white md:grid-cols-[1.1fr_1fr]">
      <div className="relative aspect-[4/3] bg-[radial-gradient(120%_90%_at_50%_45%,#2b313d_0%,#12151b_60%,#0b0d12_100%)] md:aspect-auto md:min-h-[360px]">
        <Image src={image} alt={alt} fill sizes="(min-width: 768px) 560px, 100vw" className={contain ? "object-contain p-6" : "object-cover"} />
      </div>
      <div className="flex flex-col justify-center p-6 md:p-10">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className="h2 mt-2">
          {title}
        </h2>
        <p className="mt-3 text-white/70">{body}</p>
        <div className="mt-6">
          <Button href={href} arrow>
            {cta}
          </Button>
        </div>
      </div>
    </div>
  );
}
