// Sonidos generados con Web Audio (sin archivos): el «tic-tac» del intermitente y el clic de un mando.

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(v: boolean) {
  muted = v;
}

function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Clic seco y corto. `tone` cambia el timbre (el tic y el tac del intermitente suenan distinto). */
export function click(tone = 1, volume = 0.25) {
  if (muted) return;
  const a = ac();
  if (!a) return;
  const t = a.currentTime;
  const len = Math.floor(a.sampleRate * 0.03);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6);
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = 1800 * tone;
  f.Q.value = 4;
  const g = a.createGain();
  g.gain.setValueAtTime(volume, t);
  src.connect(f).connect(g).connect(a.destination);
  src.start(t);
}

/** Claxon: dos notas cuadradas a la vez, filtradas para que no chirríen. */
export function horn(seconds = 0.45) {
  if (muted) return;
  const a = ac();
  if (!a) return;
  const t = a.currentTime;
  const f = a.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 2200;
  const g = a.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.09, t + 0.02);
  g.gain.setValueAtTime(0.09, t + seconds - 0.05);
  g.gain.linearRampToValueAtTime(0, t + seconds);
  f.connect(g).connect(a.destination);
  for (const hz of [415, 520]) {
    const o = a.createOscillator();
    o.type = "square";
    o.frequency.value = hz;
    o.connect(f);
    o.start(t);
    o.stop(t + seconds);
  }
}

/** Barrido de la escobilla: ruido suave que sube y baja. */
export function swish(volume = 0.05) {
  if (muted) return;
  const a = ac();
  if (!a) return;
  const t = a.currentTime;
  const len = Math.floor(a.sampleRate * 0.5);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / len);
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = 900;
  f.Q.value = 0.8;
  const g = a.createGain();
  g.gain.value = volume;
  src.connect(f).connect(g).connect(a.destination);
  src.start(t);
}
