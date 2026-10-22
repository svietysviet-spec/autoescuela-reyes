import type { ReactNode } from "react";

export type Step = {
  title: string;
  body: ReactNode;
  action?: ReactNode;
};

export function Steps({ steps }: { steps: Step[] }) {
  const cols = steps.length >= 4 ? "lg:grid-cols-4" : steps.length === 3 ? "lg:grid-cols-3" : "";
  return (
    <ol className={`grid gap-4 md:grid-cols-2 ${cols}`}>
      {steps.map((s, i) => (
        <li key={s.title} style={{ "--i": i } as React.CSSProperties} className="reveal card flex flex-col p-6">
          <span
            aria-hidden
            className="grid size-10 place-items-center rounded-full bg-accent text-[17px] font-bold text-on-accent"
          >
            {i + 1}
          </span>
          <h3 className="h3 mt-4">
            <span className="sr-only">Paso {i + 1}: </span>
            {s.title}
          </h3>
          <div className="mt-2 text-[15px] text-text-2">{s.body}</div>
          {s.action && <div className="mt-auto pt-5">{s.action}</div>}
        </li>
      ))}
    </ol>
  );
}
