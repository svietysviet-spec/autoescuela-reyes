"use client";

import { useState } from "react";
import { CENTERS, formatPhone, mapsUrl, tel, wa, type Center } from "@/lib/site";
import { Clock, Mail, Phone, Pin, WhatsApp } from "./icons";

const ZONES = Array.from(new Set(CENTERS.map((c) => c.zone)));

export function Locations({ centers = CENTERS }: { centers?: Center[] }) {
  const [zone, setZone] = useState<string | null>(null);
  const zones = ZONES.filter((z) => centers.some((c) => c.zone === z));
  const list = zone ? centers.filter((c) => c.zone === zone) : centers;

  return (
    <div>
      {zones.length > 1 && (
        <div role="group" aria-label="Filtrar sedes por zona" className="reveal mb-6 flex flex-wrap gap-2">
          <button type="button" className="chip" aria-pressed={zone === null} onClick={() => setZone(null)}>
            Todas <span className="opacity-60">{centers.length}</span>
          </button>
          {zones.map((z) => (
            <button key={z} type="button" className="chip" aria-pressed={zone === z} onClick={() => setZone(z)}>
              {z} <span className="opacity-60">{centers.filter((c) => c.zone === z).length}</span>
            </button>
          ))}
        </div>
      )}

      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <li key={c.id} className="card flex flex-col p-6">
            <p className="eyebrow">{c.zone}</p>
            <h3 className="h3 mt-1">{c.name}</h3>
            <p className="mt-1 text-[13px] text-text-2">{c.services.join(" · ")}</p>
            <dl className="mt-4 space-y-2.5 text-[15px]">
              <div className="flex gap-3">
                <dt className="sr-only">Dirección</dt>
                <Pin className="mt-0.5 shrink-0 text-text-2" width={18} height={18} />
                <dd>
                  {c.mapsQuery ? (
                    <a href={mapsUrl(c.mapsQuery)} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {c.address}
                    </a>
                  ) : (
                    c.address
                  )}
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="sr-only">Horario</dt>
                <Clock className="mt-0.5 shrink-0 text-text-2" width={18} height={18} />
                <dd>{c.hours}</dd>
              </div>
              {c.phone && (
                <div className="flex gap-3">
                  <dt className="sr-only">Teléfono</dt>
                  <Phone className="mt-0.5 shrink-0 text-text-2" width={18} height={18} />
                  <dd>
                    <a href={tel(c.phone)} className="hover:underline">
                      {formatPhone(c.phone)}
                    </a>
                  </dd>
                </div>
              )}
              {c.email && (
                <div className="flex gap-3">
                  <dt className="sr-only">Email</dt>
                  <Mail className="mt-0.5 shrink-0 text-text-2" width={18} height={18} />
                  <dd className="min-w-0 break-words">
                    <a href={`mailto:${c.email}`} className="hover:underline">
                      {c.email}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
            <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
              <a
                href={wa(c.whatsapp, `Hola, escribo a ${c.name} de Autoescuela Reyes.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-wa btn-sm"
              >
                <WhatsApp width={18} height={18} /> WhatsApp
              </a>
              {c.phone ? (
                <a href={tel(c.phone)} className="btn btn-gray btn-sm">
                  Llamar
                </a>
              ) : c.mapsQuery ? (
                <a href={mapsUrl(c.mapsQuery)} target="_blank" rel="noopener noreferrer" className="btn btn-gray btn-sm">
                  Cómo llegar
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
