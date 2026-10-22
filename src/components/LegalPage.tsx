import legal from "@/content/legal.json";

type Key = keyof typeof legal;

/** Textos legales copiados tal cual de la web actual. */
export function LegalPage({ doc }: { doc: Key }) {
  const { title, blocks } = legal[doc];
  return (
    <article className="mx-auto max-w-[760px] px-4 py-12 sm:px-6 md:py-20">
      <p className="eyebrow mb-2">Legal</p>
      <h1 className="h2">{title}</h1>
      <div className="mt-8 space-y-4 text-[15px] text-text-2">
        {blocks.map((b, i) =>
          "h" in b ? (
            <h2 key={i} className="pt-4 text-[17px] font-semibold text-text">
              {b.h}
            </h2>
          ) : (
            <p key={i}>{b.p}</p>
          ),
        )}
      </div>
    </article>
  );
}
