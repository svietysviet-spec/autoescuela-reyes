import Image from "next/image";

/** Esquemas de maniobras/circuitos sobre fondo blanco (son dibujos técnicos). */
export function Diagrams({ items }: { items: { title: string; image: string; alt: string; width: number; height: number }[] }) {
  return (
    <ul className={`grid gap-4 ${items.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
      {items.map((d, i) => (
        <li key={d.title} style={{ "--i": i } as React.CSSProperties} className="reveal card overflow-hidden">
          <div className="bg-white p-4">
            <Image
              src={d.image}
              alt={d.alt}
              width={d.width}
              height={d.height}
              sizes="(min-width: 768px) 520px, 100vw"
              className="mx-auto h-auto max-h-[260px] w-auto object-contain"
            />
          </div>
          <p className="border-t border-line px-5 py-4 font-semibold">{d.title}</p>
        </li>
      ))}
    </ul>
  );
}
