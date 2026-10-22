import Image from "next/image";
import type { ReactNode } from "react";

/** Bloque de imagen + texto, para temas destacados (amaxofobia, CAP…). */
export function Split({
  image,
  imageAlt,
  eyebrow,
  title,
  titleId,
  children,
  reverse,
  contain,
}: {
  image: string;
  imageAlt: string;
  eyebrow: string;
  title: ReactNode;
  titleId?: string;
  children: ReactNode;
  reverse?: boolean;
  contain?: boolean;
}) {
  return (
    <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
      <div
        className={`reveal relative aspect-[4/3] overflow-hidden rounded-[18px] ${contain ? "bg-white" : "bg-bg-2"} ${reverse ? "md:order-2" : ""}`}
      >
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(min-width: 768px) 536px, 100vw"
          className={contain ? "object-contain p-6" : "object-cover"}
        />
      </div>
      <div className="reveal" style={{ "--i": 1 } as React.CSSProperties}>
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h2 id={titleId} className="h2">
          {title}
        </h2>
        <div className="mt-4 space-y-4 text-text-2">{children}</div>
      </div>
    </div>
  );
}
