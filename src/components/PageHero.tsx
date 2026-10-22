import Image from "next/image";
import type { ReactNode } from "react";
import { SITE, wa } from "@/lib/site";
import BlurText from "./reactbits/BlurText";
import { Button } from "./ui";
import { WhatsApp } from "./icons";

export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  imageAlt,
  primary = { href: "#tarifas", label: "Matricúlate" },
  whatsapp = SITE.whatsapp,
  message,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: ReactNode;
  image: string;
  imageAlt: string;
  primary?: { href: string; label: string };
  whatsapp?: string;
  message: string;
  children?: ReactNode;
}) {
  return (
    <section className="bg-bg pb-12 pt-10 md:pb-16 md:pt-16">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
        <div className="max-w-[820px]">
          <p className="eyebrow reveal mb-3" style={{ "--i": 0 } as React.CSSProperties}>
            {eyebrow}
          </p>
          <h1 className="h1">
            <HeroTitle text={title} />
          </h1>
          <p className="lead reveal mt-5 max-w-[640px]" style={{ "--i": 2 } as React.CSSProperties}>
            {lead}
          </p>
          <div className="reveal mt-8 flex flex-wrap gap-3" style={{ "--i": 3 } as React.CSSProperties}>
            <Button href={primary.href} arrow>
              {primary.label}
            </Button>
            <Button href={wa(whatsapp, message)} variant="gray" icon={<WhatsApp width={18} height={18} />}>
              Pide información
            </Button>
          </div>
          {children}
        </div>
        <div
          className="reveal relative mt-10 aspect-[4/3] overflow-hidden rounded-[22px] bg-bg-grouped sm:aspect-[16/9] md:mt-14"
          style={{ "--i": 4 } as React.CSSProperties}
        >
          <Image src={image} alt={imageAlt} fill preload fetchPriority="high" sizes="(min-width: 1120px) 1072px, calc(100vw - 32px)" className="object-cover" />
        </div>
      </div>
    </section>
  );
}

/** Título grande con el efecto BlurText de React Bits: las palabras entran enfocándose una tras otra. */
export function HeroTitle({ text }: { text: string }) {
  return <BlurText text={text} trigger="load" direction="bottom" distance={14} blur={8} delay={70} stepDuration={0.32} />;
}
