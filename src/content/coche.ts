// Contenido de «Conoce tu coche de prácticas». Datos generales: cada coche puede variar; manda su manual.

export type V3 = [number, number, number];
export type Cam = { pos: V3; target: V3 };

export type Vista = {
  slug: string;
  nombre: string;
  titulo: string; // título gigante de fondo
  disponible: boolean;
  resumen: string;
  /** dentro del coche (primera persona) o por fuera */
  dentro: boolean;
};

export type Mando = {
  slug: string;
  nombre: string;
  /** nombre corto para las pastillas */
  corto: string;
  /** punto interactivo en 3D (coordenadas del coche, en metros; el morro mira hacia +z) */
  punto: V3;
  /** encuadre al pulsarlo */
  cam: Cam;
  queEs: string;
  comoSeUsa: string[];
  consejo: string;
  disponible: boolean;
};

/** Elemento de una vista exterior (luces, ruedas): se elige en la tarjeta o pulsando su punto. */
export type Detalle = {
  slug: string;
  nombre: string;
  punto?: V3;
  cam: Cam;
  texto: string[];
  /** cuándo es obligatorio (luces) o el dato clave que hay que recordar */
  clave: string;
};

export const VISTAS: Vista[] = [
  { slug: "general", nombre: "Vista general", titulo: "RIO", disponible: true, dentro: false, resumen: "El coche de prácticas por fuera: gíralo, acércate y cambia entre día y noche." },
  { slug: "especificaciones", nombre: "Especificaciones", titulo: "FICHA", disponible: true, dentro: false, resumen: "Medidas del coche y lo que puedes conducir con el permiso B." },
  { slug: "interior", nombre: "Interior", titulo: "AL VOLANTE", disponible: true, dentro: true, resumen: "Siéntate al volante: arrastra para mirar alrededor y pulsa cada mando para aprender qué hace." },
  { slug: "luces", nombre: "Luces", titulo: "LUCES", disponible: true, dentro: false, resumen: "Enciende cada luz y aprende cuándo es obligatoria." },
  { slug: "ruedas", nombre: "Ruedas", titulo: "RUEDAS", disponible: true, dentro: false, resumen: "Presión, dibujo, pinchazos y cómo señalizar el coche si te quedas parado." },
  { slug: "prueba", nombre: "Ponte a prueba", titulo: "TEST", disponible: true, dentro: true, resumen: "10 preguntas sobre los mandos y el coche. Al responder, te enseñamos dónde está cada cosa." },
  { slug: "capo", nombre: "Bajo el capó", titulo: "MOTOR", disponible: true, dentro: false, resumen: "" },
];

/** Posición de los ojos del conductor (volante a la izquierda) y hacia dónde mira. */
export const OJOS: Cam = { pos: [0.37, 1.19, -0.04], target: [0.33, 1.0, 0.6] };

const CAM_PALANCAS: Cam["pos"] = [0.4, 1.06, 0.12];

export const MANDOS: Mando[] = [
  {
    slug: "luces",
    nombre: "Mando de luces",
    corto: "Luces",
    punto: [0.595, 0.905, 0.47],
    cam: { pos: CAM_PALANCAS, target: [0.55, 0.9, 0.47] },
    queEs: "La palanca de la izquierda del volante. Girando su extremo eliges qué luces llevas encendidas.",
    comoSeUsa: [
      "Gira el extremo: apagado, luces de posición y luces de cruce.",
      "Empuja la palanca hacia delante para la luz de carretera (largas) y vuelve atrás para quitarla.",
      "Tira de ella hacia ti para dar ráfagas.",
    ],
    consejo:
      "Las luces de cruce son obligatorias de noche y en túneles, y de día cuando hay poca visibilidad. Las largas, solo en vías interurbanas sin suficiente iluminación y sin deslumbrar a nadie.",
    disponible: true,
  },
  {
    slug: "intermitentes",
    nombre: "Intermitentes",
    corto: "Intermitentes",
    punto: [0.5, 0.905, 0.47],
    cam: { pos: CAM_PALANCAS, target: [0.52, 0.9, 0.47] },
    queEs: "La misma palanca de la izquierda: subiéndola o bajándola indicas hacia dónde vas a girar o cambiar de carril.",
    comoSeUsa: [
      "Hacia arriba: intermitente derecho.",
      "Hacia abajo: intermitente izquierdo.",
      "Al enderezar el volante después del giro, la palanca vuelve sola a su sitio. Si no, quítalo tú.",
    ],
    consejo: "Pon el intermitente con antelación, antes de empezar la maniobra, y comprueba siempre los espejos.",
    disponible: true,
  },
  {
    slug: "limpiaparabrisas",
    nombre: "Limpiaparabrisas",
    corto: "Limpias",
    punto: [0.2, 0.905, 0.47],
    cam: { pos: [0.37, 1.19, -0.1], target: [0.12, 1.08, 0.75] },
    queEs: "La palanca de la derecha del volante. Mueve las escobillas del parabrisas y echa agua para limpiarlo.",
    comoSeUsa: [
      "Bájala un punto para el modo intermitente (o automático, si el coche tiene sensor de lluvia); más abajo, velocidad lenta y rápida.",
      "Tira de ella hacia ti para echar agua al parabrisas.",
      "En muchos coches, girando el extremo regulas la pausa del modo intermitente.",
    ],
    consejo: "No las uses con el cristal seco: rayan el parabrisas y gastan las escobillas. Si dejan rayas o hacen ruido, toca cambiarlas.",
    disponible: true,
  },
  {
    slug: "claxon",
    nombre: "Claxon",
    corto: "Claxon",
    punto: [0.37, 0.885, 0.4],
    cam: { pos: [0.37, 1.1, 0.0], target: [0.37, 0.88, 0.42] },
    queEs: "Se toca apretando el centro del volante. Sirve para avisar a otros usuarios de un peligro.",
    comoSeUsa: ["Aprieta el centro del volante con la palma de la mano.", "Un toque corto basta: no hace falta mantenerlo."],
    consejo:
      "En poblado solo puedes usarlo para evitar un accidente. Fuera de poblado también puedes usarlo para avisar al conductor de delante de que vas a adelantarle.",
    disponible: true,
  },
  {
    slug: "warning",
    nombre: "Luces de emergencia (warning)",
    corto: "Warning",
    punto: [0, 0.855, 0.495],
    cam: { pos: [0.12, 1.02, 0.2], target: [0, 0.86, 0.6] },
    queEs: "El botón con un triángulo rojo en el centro del salpicadero. Enciende a la vez todos los intermitentes.",
    comoSeUsa: ["Púlsalo una vez para encenderlas y otra vez para apagarlas.", "Funcionan aunque el coche esté apagado."],
    consejo:
      "Úsalas si tu coche queda inmovilizado o detenido en la vía por una emergencia. Después, ponte el chaleco y señaliza el vehículo con la luz V16.",
    disponible: true,
  },
  {
    slug: "climatizador",
    nombre: "Climatizador",
    corto: "Clima",
    punto: [-0.09, 0.765, 0.5],
    cam: { pos: [0.18, 1.0, 0.18], target: [0.02, 0.76, 0.56] },
    queEs: "Los mandos de la consola central para la temperatura, la velocidad del ventilador, el aire acondicionado (A/C) y la recirculación.",
    comoSeUsa: [
      "Rueda de la izquierda: temperatura (azul, frío; rojo, calor). La de la derecha: fuerza del ventilador.",
      "Botón A/C: enciende el aire acondicionado, que además seca el aire.",
      "Recirculación: el coche deja de coger aire de fuera. Úsala poco rato (en un túnel o con humo), porque los cristales se empañan.",
    ],
    consejo: "Ajusta la temperatura antes de arrancar o con el coche parado: mientras conduces, la vista va a la carretera.",
    disponible: true,
  },
  {
    slug: "desempanador",
    nombre: "Desempañador",
    corto: "Desempañar",
    punto: [0.05, 0.725, 0.5],
    cam: { pos: [0.3, 1.16, 0.0], target: [0.05, 1.05, 0.75] },
    queEs: "Dos botones de la consola: uno manda el aire al parabrisas y el otro calienta la luneta trasera (las líneas finas del cristal de atrás).",
    comoSeUsa: [
      "Parabrisas empañado: pulsa el botón del parabrisas y enciende el A/C para que el aire salga seco.",
      "Luneta trasera: pulsa su botón; suele apagarse sola pasados unos minutos.",
    ],
    consejo: "Si los cristales están empañados, no arranques hasta ver bien por todos ellos. Circular sin visibilidad es peligroso y se puede sancionar.",
    disponible: true,
  },
  {
    slug: "cambios",
    nombre: "Palanca de cambios",
    corto: "Cambios",
    punto: [0.03, 0.69, 0.36],
    cam: { pos: [0.2, 1.0, 0.0], target: [0.03, 0.62, 0.36] },
    queEs: "La palanca entre los asientos con la que eliges la marcha. En el pomo está dibujado el esquema de marchas de tu coche.",
    comoSeUsa: [
      "Pisa el embrague a fondo antes de mover la palanca.",
      "En el centro está el punto muerto: ahí la palanca se mueve libre de lado a lado.",
      "La marcha atrás suele llevar un seguro (levantar una anilla o empujar la palanca hacia abajo). Métela siempre con el coche parado.",
    ],
    consejo:
      "Este esquema es un ejemplo de cinco marchas. El tuyo puede tener seis o la marcha atrás en otro sitio: míralo en el pomo antes de la primera clase.",
    disponible: true,
  },
  {
    slug: "freno-mano",
    nombre: "Freno de mano",
    corto: "Freno de mano",
    punto: [0.06, 0.62, -0.02],
    cam: { pos: [0.02, 1.08, 0.3], target: [0.06, 0.56, -0.08] },
    queEs: "La palanca entre los dos asientos delanteros. Mantiene el coche inmovilizado cuando está parado.",
    comoSeUsa: [
      "Para ponerlo: tira de la palanca hacia arriba con firmeza.",
      "Para quitarlo: tira un poco, aprieta el botón de la punta y bájala del todo.",
      "Mientras está puesto, en el cuadro se enciende un testigo rojo.",
    ],
    consejo: "Ponlo siempre al aparcar, sobre todo en pendiente, y deja además una marcha metida. No arranques sin comprobar que está quitado.",
    disponible: true,
  },
  {
    slug: "pedales",
    nombre: "Pedales y doble pedal del profesor",
    corto: "Pedales",
    punto: [0.37, 0.42, 0.66],
    cam: { pos: [0.08, 0.86, 0.12], target: [0.0, 0.4, 0.68] },
    queEs:
      "De izquierda a derecha: embrague, freno y acelerador. En el lado del acompañante, el profesor tiene su propio freno y embrague (el doble pedal) para intervenir si hace falta.",
    comoSeUsa: [
      "Embrague: con el pie izquierdo, siempre que cambies de marcha o vayas a detenerte.",
      "Freno y acelerador: con el pie derecho, nunca los dos a la vez.",
      "El profesor puede frenar o pisar el embrague desde su asiento en cualquier momento.",
    ],
    consejo: "Apoya el talón en el suelo y mueve el pie derecho girando el tobillo entre el acelerador y el freno: así es más rápido y preciso.",
    disponible: true,
  },
  {
    slug: "testigos",
    nombre: "Testigos del cuadro",
    corto: "Testigos",
    punto: [0.37, 1.03, 0.6],
    cam: { pos: [0.37, 1.13, 0.2], target: [0.37, 1.03, 0.62] },
    queEs: "Las luces del cuadro de instrumentos. Su color te dice cuánta prisa corre lo que avisan.",
    comoSeUsa: [
      "Rojo: peligro o avería grave (frenos, aceite, temperatura, batería, cinturón). Detente en cuanto puedas hacerlo con seguridad.",
      "Amarillo o ámbar: algo no va bien (motor, ABS, presión de neumáticos). Revísalo pronto.",
      "Verde y azul: solo informan de lo que llevas encendido (intermitentes, cruce, largas).",
    ],
    consejo: "Al arrancar se encienden casi todos un momento para comprobarlos. Si uno rojo sigue encendido después, no salgas.",
    disponible: true,
  },
  {
    slug: "retrovisores",
    nombre: "Retrovisores",
    corto: "Espejos",
    punto: [0, 1.25, 0.45],
    cam: { pos: [0.37, 1.19, -0.04], target: [0.05, 1.23, 0.47] },
    queEs: "El espejo interior y los dos exteriores. Juntos te dejan ver lo que pasa detrás y a los lados.",
    comoSeUsa: [
      "Interior: que veas la luneta trasera entera, centrada.",
      "Exteriores: que veas un poco del costado de tu coche y, sobre todo, la carretera de al lado. Se regulan con el mando de la puerta del conductor.",
      "Aun bien colocados, hay un ángulo muerto: gira la cabeza antes de cambiar de carril.",
    ],
    consejo: "Ajústalos antes de empezar a circular, después del asiento y el volante, nunca en marcha.",
    disponible: true,
  },
  {
    slug: "cinturon",
    nombre: "Cinturón de seguridad",
    corto: "Cinturón",
    punto: [0.58, 1.05, -0.34],
    cam: { pos: [-0.15, 1.12, 0.5], target: [0.4, 0.88, -0.2] },
    queEs: "El cinturón de tres puntos del conductor. Si no te lo abrochas, el coche te avisa con un testigo rojo y un pitido.",
    comoSeUsa: [
      "Banda de arriba: sobre la clavícula, sin tocar el cuello.",
      "Banda de abajo: sobre las caderas, nunca sobre la barriga.",
      "Sin holguras ni retorcido.",
    ],
    consejo: "Es obligatorio para todos los ocupantes, delante y detrás, también en ciudad. Abróchatelo antes de arrancar.",
    disponible: true,
  },
  {
    slug: "asiento",
    nombre: "Asiento y volante",
    corto: "Asiento",
    punto: [0.37, 0.5, 0.0],
    cam: { pos: [0.0, 1.05, 0.3], target: [0.37, 0.55, -0.1] },
    queEs: "Antes de arrancar se ajustan, en este orden, el asiento, el volante y los espejos.",
    comoSeUsa: [
      "Distancia: con el embrague pisado a fondo, la pierna queda algo flexionada.",
      "Respaldo: con la espalda apoyada, las muñecas llegan a la parte de arriba del volante.",
      "Reposacabezas: su parte de arriba, a la altura de la parte de arriba de la cabeza.",
      "Volante: en muchos coches se regula en altura y profundidad con una palanca bajo la columna.",
    ],
    consejo: "Con una buena postura llegas a los pedales y al volante sin estirarte y reaccionas antes.",
    disponible: true,
  },
];

const FRENTE: Cam = { pos: [3.1, 1.25, 4.6], target: [0, 0.65, 0.4] };
const DETRAS: Cam = { pos: [-2.9, 1.4, -4.8], target: [0, 0.7, -0.5] };

export const LUCES: (Detalle & { estado: { luces?: 0 | 1 | 2 | 3; intermitente?: -1 | 0 | 1; warning?: boolean; frenar?: boolean } })[] = [
  {
    slug: "posicion",
    nombre: "Posición",
    cam: FRENTE,
    estado: { luces: 1 },
    clave: "Se encienden siempre con las de cruce o carretera.",
    texto: [
      "Marcan el contorno del coche para que otros lo vean: blancas delante y rojas detrás.",
      "Solas sirven para señalizar el coche parado o estacionado en una vía mal iluminada.",
    ],
  },
  {
    slug: "cruce",
    nombre: "Cruce",
    cam: FRENTE,
    estado: { luces: 2 },
    clave: "Obligatorias de noche, en túneles señalizados y de día con poca visibilidad (lluvia, niebla).",
    texto: ["Alumbran la carretera sin deslumbrar a quien viene de frente.", "Son las «cortas» que llevarás casi siempre que conduzcas de noche."],
  },
  {
    slug: "carretera",
    nombre: "Carretera",
    cam: FRENTE,
    estado: { luces: 3 },
    clave: "De noche, en vías interurbanas mal iluminadas y a más de 40 km/h, siempre que no deslumbres.",
    texto: [
      "Las «largas»: alumbran mucho más lejos.",
      "Cámbialas por las de cruce cuando te cruces con otro vehículo o vayas detrás de uno.",
    ],
  },
  {
    slug: "freno",
    nombre: "Freno",
    cam: DETRAS,
    estado: { frenar: true },
    clave: "Se encienden solas al pisar el freno.",
    texto: ["Avisan a quien viene detrás de que estás frenando.", "Compruébalas de vez en cuando: con el coche parado, pide a alguien que mire mientras pisas el freno."],
  },
  {
    slug: "intermitentes",
    nombre: "Intermitentes",
    cam: DETRAS,
    estado: { intermitente: -1 },
    clave: "Indica cada giro, cambio de carril, adelantamiento o salida de un aparcamiento, con antelación.",
    texto: ["Naranjas, delante, detrás y en los laterales.", "Si parpadean más rápido de lo normal, suele haber una bombilla fundida."],
  },
  {
    slug: "emergencia",
    nombre: "Emergencia",
    cam: DETRAS,
    estado: { warning: true },
    clave: "Si el coche queda inmovilizado o detenido en la vía por una emergencia.",
    texto: ["Encienden todos los intermitentes a la vez.", "Después de ponerlas, chaleco reflectante y luz V16."],
  },
];

export const RUEDAS: Detalle[] = [
  {
    slug: "dibujo",
    nombre: "Dibujo",
    punto: [0.8, 0.33, 1.5],
    cam: { pos: [2.0, 0.6, 3.0], target: [0.8, 0.32, 1.25] },
    clave: "Mínimo legal: 1,6 mm de profundidad.",
    texto: [
      "El dibujo saca el agua de debajo de la rueda. Con poco dibujo, el coche patina antes y frena peor sobre mojado.",
      "Dentro de las ranuras hay unos tacos (testigos de desgaste): si el dibujo llega a su altura, toca cambiar el neumático.",
    ],
  },
  {
    slug: "presion",
    nombre: "Presión",
    punto: [0.88, 0.2, 1.215],
    cam: { pos: [2.3, 0.75, 1.6], target: [0.86, 0.3, 1.215] },
    clave: "Revísala en frío, cada mes y antes de un viaje largo.",
    texto: [
      "La presión correcta viene en una etiqueta (en el marco de la puerta del conductor o en la tapa del depósito) y en el manual.",
      "Con poca presión el neumático se calienta, se gasta antes y el coche gasta más combustible.",
      "No olvides la rueda de repuesto, si la llevas.",
    ],
  },
  {
    slug: "repuesto",
    nombre: "Pinchazo",
    punto: [0, 0.75, -2.0],
    cam: { pos: [-1.8, 1.6, -4.2], target: [0, 0.7, -1.6] },
    clave: "Según el coche, llevarás una rueda de repuesto o un kit antipinchazos.",
    texto: [
      "Rueda de repuesto, gato y llave suelen ir bajo el suelo del maletero.",
      "El kit antipinchazos lleva un sellante y un compresor; sirve para pinchazos pequeños en la banda de rodadura, no en el lateral.",
      "Cambia la rueda solo donde no corras peligro, lejos del tráfico.",
    ],
  },
  {
    slug: "v16",
    nombre: "Luz V16",
    punto: [0.25, 1.5, 0.35],
    cam: { pos: [3.3, 2.6, 2.6], target: [0, 1.1, 0] },
    clave: "Desde el 1 de enero de 2026 es obligatoria y sustituye a los triángulos.",
    texto: [
      "Si el coche queda inmovilizado: luces de emergencia, chaleco reflectante puesto antes de bajar y la V16 en el techo.",
      "La V16 debe estar homologada y conectada: avisa de tu posición a la DGT.",
      "Colócala sin salir del coche, sacando el brazo por la ventanilla, si puedes.",
    ],
  },
];

/** Datos del Kia Rio de 5 puertas (2017-2023), modelo en el que se basa el 3D. */
export const FICHA: { k: string; v: string }[] = [
  { k: "Largo", v: "4,07 m" },
  { k: "Ancho", v: "1,73 m (sin espejos)" },
  { k: "Alto", v: "1,45 m" },
  { k: "Distancia entre ejes", v: "2,58 m" },
  { k: "Plazas", v: "5" },
  { k: "Maletero", v: "325 litros" },
  { k: "Motor y cambio", v: "[MOTOR Y CAMBIO DEL COCHE DE PRÁCTICAS]" },
];

export const PERMISO_B = "Con el permiso B puedes conducir coches de hasta 3.500 kg de masa máxima autorizada y hasta 9 plazas, contando la del conductor.";

export type Pregunta = { q: string; opciones: string[]; ok: number; porque: string; mando?: string; vista?: string };

export const PREGUNTAS: Pregunta[] = [
  {
    q: "Vas a girar a la derecha. ¿Hacia dónde mueves la palanca izquierda del volante?",
    opciones: ["Hacia arriba", "Hacia abajo", "Hacia ti"],
    ok: 0,
    porque: "Arriba, intermitente derecho; abajo, izquierdo. Hacia ti das ráfagas.",
    mando: "intermitentes",
  },
  {
    q: "¿Con qué pie se pisa el embrague?",
    opciones: ["Con el derecho", "Con el izquierdo", "Con cualquiera de los dos"],
    ok: 1,
    porque: "El izquierdo solo trabaja con el embrague; el derecho, con el freno y el acelerador.",
    mando: "pedales",
  },
  {
    q: "Tu coche se queda inmovilizado en la calzada. ¿Qué haces primero?",
    opciones: ["Bajar a mirar el motor", "Encender las luces de emergencia", "Encender las antiniebla"],
    ok: 1,
    porque: "Primero el warning; después, chaleco puesto antes de bajar y la luz V16.",
    mando: "warning",
  },
  {
    q: "En el cuadro se enciende un testigo rojo mientras circulas. ¿Qué significa?",
    opciones: ["Solo informa de algo que llevas encendido", "Un peligro o avería grave: hay que detenerse en cuanto sea seguro", "Que toca la revisión"],
    ok: 1,
    porque: "Rojo, peligro; ámbar, revisar pronto; verde y azul, informativo.",
    mando: "testigos",
  },
  {
    q: "¿Cuándo puedes usar el claxon dentro de poblado?",
    opciones: ["Para avisar de que vas a adelantar", "Para saludar", "Solo para evitar un accidente"],
    ok: 2,
    porque: "En poblado, el claxon solo se usa para evitar un accidente.",
    mando: "claxon",
  },
  {
    q: "El parabrisas se empaña. ¿Qué es lo más eficaz?",
    opciones: ["Aire al parabrisas con el A/C encendido", "Poner la recirculación", "Limpiar el cristal con la mano"],
    ok: 0,
    porque: "El A/C seca el aire, y la recirculación empaña más porque no entra aire de fuera.",
    mando: "desempanador",
  },
  {
    q: "¿Quién tiene que llevar puesto el cinturón de seguridad?",
    opciones: ["Solo el conductor", "Los de delante", "Todos los ocupantes, delante y detrás"],
    ok: 2,
    porque: "Es obligatorio para todos los ocupantes, también en ciudad.",
    mando: "cinturon",
  },
  {
    q: "¿Cuál es la profundidad mínima legal del dibujo de los neumáticos de un coche?",
    opciones: ["0,8 mm", "1,6 mm", "3 mm"],
    ok: 1,
    porque: "1,6 mm. Por debajo, el neumático no evacúa bien el agua.",
    vista: "ruedas",
  },
  {
    q: "¿Cuándo debes usar las luces de carretera (largas)?",
    opciones: ["De noche en vías interurbanas mal iluminadas, sin deslumbrar", "En cualquier túnel", "Siempre que llueva"],
    ok: 0,
    porque: "Solo fuera de poblado, en vías sin suficiente iluminación y sin deslumbrar a nadie.",
    mando: "luces",
  },
  {
    q: "¿En qué orden se ajusta el puesto de conducción?",
    opciones: ["Espejos, asiento y volante", "Asiento, volante y espejos", "Da igual el orden"],
    ok: 1,
    porque: "Primero el asiento y el volante; los espejos, al final, porque dependen de tu postura.",
    mando: "asiento",
  },
];

export const VISTA_DEFECTO = "general";
export const getVista = (s?: string | null) => VISTAS.find((v) => v.slug === s && v.disponible && v.slug !== "capo") ?? VISTAS[0];
export const getMando = (s?: string | null) => MANDOS.find((m) => m.slug === s && m.disponible) ?? null;

export const CREDITO = {
  titulo: "2021 Kia Rio",
  autor: "tonielpro520",
  url: "https://sketchfab.com/3d-models/2021-kia-rio-82803d9c4afb4cf2867ef364d31e6528",
  licencia: "CC BY 4.0",
  licenciaUrl: "https://creativecommons.org/licenses/by/4.0/",
};
