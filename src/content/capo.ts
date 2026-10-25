// Contenido de «Bajo el capó». Solo datos generales y seguros: nada de cifras de un modelo concreto.
// Las preguntas tipo test son de elaboración propia al estilo DGT, no preguntas oficiales.

export type Pregunta = {
  q: string;
  opts: string[];
  correcta: number;
  explica: string;
};

export type Paso = {
  titulo: string;
  texto: string;
};

export type Capa = { id: string; nombre: string };

export type Pieza = {
  slug: string;
  nombre: string;
  corto: string;
  sistema: string;
  subtitulo: string;
  disponible: boolean;
  queEs?: string[];
  revisar?: Paso[];
  falla?: string[];
  cuidados?: string[];
  examen?: Pregunta[];
  datos?: [string, string][];
  aviso?: string;
  capas?: Capa[];
  animacion?: Paso[];
  /** Posición en el minimapa (vista desde arriba, el morro a la izquierda), en % del ancho y alto */
  mapa?: { x: number; y: number; texto: string };
};

const MEDIR_ACEITE: Paso[] = [
  {
    titulo: "Coche en llano y motor parado",
    texto: "Aparca en una superficie llana. Con el motor frío, o parado unos minutos, el aceite baja al cárter y la medida es fiable.",
  },
  {
    titulo: "Saca la varilla y límpiala",
    texto: "Tira del asa, saca la varilla entera y límpiala con un trapo o papel que no suelte pelusa.",
  },
  {
    titulo: "Métela del todo y vuelve a sacarla",
    texto: "Introdúcela hasta el fondo, espera un segundo y sácala otra vez sin tocar la punta.",
  },
  {
    titulo: "Lee el nivel entre MIN y MAX",
    texto: "Sujeta la varilla en horizontal. La mancha de aceite debe quedar entre las dos marcas: ni por debajo de MIN ni por encima de MAX.",
  },
  {
    titulo: "Rellena por el tapón si hace falta",
    texto: "Si está cerca de MIN, añade el aceite que indica el manual por el tapón de llenado, poco a poco. Cierra bien el tapón, espera unos minutos y vuelve a medir. Sin pasarte de MAX.",
  },
];

export const PIEZAS: Pieza[] = [
  {
    slug: "motor",
    nombre: "El motor en general",
    corto: "Vista general",
    sistema: "Vista general",
    subtitulo: "Qué hay bajo el capó y dónde está cada cosa",
    disponible: true,
    queEs: [
      "Al abrir el capó verás el motor en el centro y, a su alrededor, los depósitos y piezas que tienes que saber revisar.",
      "Pulsa cualquier pieza para acercarte y ver su ficha, o pulsa un testigo del salpicadero para saber a qué pieza se refiere.",
      "Los tapones suelen tener colores y símbolos para reconocerlos: amarillo el aceite, azul el limpiaparabrisas, y con un aviso el refrigerante.",
    ],
    revisar: [
      { titulo: "Coche en llano y motor frío", texto: "Así las medidas son fiables y no hay riesgo de quemaduras." },
      { titulo: "Aceite", texto: "Con la varilla, entre MIN y MAX." },
      { titulo: "Refrigerante y frenos", texto: "Mirando el depósito desde fuera, entre MIN y MAX." },
      { titulo: "Limpiaparabrisas", texto: "Lleno, con anticongelante en invierno." },
    ],
    falla: [
      "Testigo rojo: detente en cuanto puedas hacerlo con seguridad y para el motor.",
      "Testigo amarillo o ámbar: avisa de un fallo o de algo que hay que revisar pronto.",
    ],
    cuidados: [
      "Revisa los niveles con regularidad y siempre antes de un viaje largo.",
      "Sigue el plan de mantenimiento del manual de tu coche.",
    ],
    examen: [
      {
        q: "Un testigo luminoso de color rojo en el cuadro indica…",
        opts: ["Un aviso informativo sin importancia.", "Un fallo importante o un peligro: hay que detenerse en cuanto sea posible.", "Que un sistema está funcionando."],
        correcta: 1,
        explica: "El rojo indica peligro o avería grave. El amarillo o ámbar avisa; el verde y el azul informan.",
      },
    ],
    datos: [
      ["Rojo", "Peligro o avería grave"],
      ["Amarillo / ámbar", "Aviso: revisar pronto"],
      ["Verde / azul", "Información: un sistema está en marcha"],
    ],
    mapa: { x: 22, y: 50, texto: "El compartimento del motor, en la parte delantera del coche." },
  },
  {
    slug: "aceite",
    nombre: "Varilla del aceite y tapón de llenado",
    corto: "Aceite del motor",
    sistema: "Motor y aceite",
    subtitulo: "Lo que más vas a revisar en tu coche",
    disponible: true,
    queEs: [
      "El aceite lubrica las piezas del motor que rozan entre sí. También ayuda a enfriarlas y a mantenerlas limpias.",
      "La varilla sirve para comprobar cuánto aceite hay en el cárter, el depósito que está en la parte de abajo del motor.",
      "El tapón de llenado está arriba del motor, normalmente con el dibujo de una aceitera. Por ahí se añade el aceite.",
      "Algunos coches modernos no tienen varilla: el nivel se consulta en el ordenador de a bordo.",
    ],
    revisar: MEDIR_ACEITE,
    falla: [
      "Si se enciende el testigo rojo de la aceitera mientras circulas, hay poca presión de aceite. Detente en cuanto puedas hacerlo con seguridad y para el motor.",
      "Con poco aceite el motor se desgasta y puede averiarse gravemente.",
      "Demasiado aceite también es malo: nunca pases de la marca MAX.",
      "Manchas de aceite debajo del coche pueden indicar una fuga.",
    ],
    cuidados: [
      "Revisa el nivel con frecuencia (por ejemplo, una vez al mes) y siempre antes de un viaje largo.",
      "Usa el tipo de aceite que indica el manual de tu coche.",
      "El cambio de aceite y de filtro se hace cuando marque el manual del fabricante.",
      "Mide siempre igual: coche en llano y motor frío o parado unos minutos.",
    ],
    examen: [
      {
        q: "Para comprobar el nivel de aceite del motor, el vehículo debe estar…",
        opts: [
          "En una superficie llana y con el motor parado.",
          "Con el motor en marcha para que el aceite circule.",
          "En una pendiente para que el aceite baje al cárter.",
        ],
        correcta: 0,
        explica: "En llano y con el motor parado el aceite está en el cárter y la varilla marca el nivel real.",
      },
      {
        q: "Si en marcha se enciende el testigo rojo de la presión del aceite, lo correcto es…",
        opts: [
          "Seguir circulando hasta el próximo taller.",
          "Acelerar para que suba la presión.",
          "Detener el vehículo en cuanto sea posible con seguridad y parar el motor.",
        ],
        correcta: 2,
        explica: "Un testigo rojo indica un fallo importante. Seguir con poca presión de aceite puede romper el motor.",
      },
    ],
    datos: [
      ["Dónde se mide", "Con la varilla o, en algunos coches, en el ordenador de a bordo"],
      ["Nivel correcto", "Entre las marcas MIN y MAX"],
      ["Por dónde se rellena", "Por el tapón con el dibujo de la aceitera"],
      ["Qué aceite usar", "El que indique el manual del fabricante"],
      ["Testigo", "Aceitera roja: presión de aceite baja"],
    ],
    capas: [
      { id: "tapon", nombre: "Tapón de llenado" },
      { id: "varilla", nombre: "Varilla" },
      { id: "tubo", nombre: "Tubo de la varilla" },
      { id: "bloque", nombre: "Bloque del motor" },
      { id: "carter", nombre: "Cárter y aceite" },
    ],
    animacion: MEDIR_ACEITE,
    mapa: { x: 22, y: 50, texto: "Bajo el capó, en el motor. El asa de la varilla suele ser amarilla o naranja." },
  },
  {
    slug: "refrigerante",
    nombre: "Depósito del líquido refrigerante",
    corto: "Refrigerante",
    sistema: "Refrigeración",
    subtitulo: "El anticongelante que evita que el motor se caliente",
    disponible: true,
    aviso: "Nunca abras el tapón con el motor caliente: el líquido está a presión y puede quemarte.",
    queEs: [
      "El líquido refrigerante (anticongelante) recorre el motor, recoge su calor y lo lleva al radiador para enfriarse.",
      "El depósito de expansión es de plástico translucido, para que se vea el nivel desde fuera, y tiene las marcas MIN y MAX.",
      "Además de enfriar, protege el circuito contra la congelación y la corrosión.",
    ],
    revisar: [
      { titulo: "Motor frío", texto: "Revísalo siempre con el motor frío y el coche en llano. No abras el tapón en caliente." },
      { titulo: "Mira el nivel desde fuera", texto: "No hace falta abrirlo: el nivel se ve a través del plástico. Debe estar entre MIN y MAX." },
      { titulo: "Rellena si hace falta", texto: "Con el motor frío, abre el tapón despacio y añade el refrigerante que indica el manual hasta quedar entre las marcas." },
      { titulo: "Si baja a menudo, al taller", texto: "Si tienes que rellenar con frecuencia, puede haber una fuga." },
    ],
    falla: [
      "Si se enciende el testigo rojo de temperatura, el motor se está calentando demasiado: detente en cuanto puedas con seguridad y para el motor.",
      "Con poco refrigerante el motor puede sobrecalentarse y averiarse.",
      "Manchas de color bajo la parte delantera del coche o olor dulzón pueden indicar una fuga.",
    ],
    cuidados: [
      "Revisa el nivel con regularidad y antes de un viaje largo, siempre en frío.",
      "Usa el refrigerante que indica el manual; no mezcles tipos distintos sin saber si son compatibles.",
      "El cambio completo del líquido se hace cuando marque el manual del fabricante.",
    ],
    examen: [
      {
        q: "El nivel del líquido refrigerante debe comprobarse…",
        opts: ["Con el motor caliente, para que el líquido esté dilatado.", "Con el motor frío.", "Solo cuando se enciende el testigo de temperatura."],
        correcta: 1,
        explica: "En frío la medida es correcta y no hay riesgo de quemaduras al abrir el depósito.",
      },
      {
        q: "Si el motor está caliente, abrir el tapón del depósito del refrigerante…",
        opts: ["Es peligroso, porque el líquido está a presión y muy caliente.", "Es recomendable para que baje la presión.", "No tiene ningún riesgo."],
        correcta: 0,
        explica: "Al abrirlo en caliente el líquido puede salir de golpe y provocar quemaduras.",
      },
    ],
    datos: [
      ["Cuándo se revisa", "Con el motor frío y el coche en llano"],
      ["Nivel correcto", "Entre MIN y MAX"],
      ["Qué líquido usar", "El que indique el manual del fabricante"],
      ["Testigo", "Termómetro rojo: temperatura del motor alta"],
    ],
    capas: [
      { id: "deposito", nombre: "Depósito" },
      { id: "liquido", nombre: "Líquido refrigerante" },
      { id: "tapon", nombre: "Tapón" },
      { id: "manguito", nombre: "Manguito" },
    ],
    animacion: [
      { titulo: "Motor frío: nivel real", texto: "Con el motor frío, el nivel que ves es el real. Debe estar entre MIN y MAX." },
      { titulo: "Motor caliente: el líquido se dilata", texto: "Al calentarse, el líquido se dilata y el nivel sube. Por eso se mide en frío." },
      { titulo: "Nunca abras en caliente", texto: "En caliente el circuito está a presión. Espera a que el motor se enfríe antes de tocar el tapón." },
    ],
    mapa: { x: 26, y: 26, texto: "Bajo el capó, a un lado del motor. Suele tener el tapón con un símbolo de aviso." },
  },
  {
    slug: "radiador",
    nombre: "Radiador y electroventilador",
    corto: "Radiador",
    sistema: "Refrigeración",
    subtitulo: "Donde se enfría el líquido refrigerante",
    disponible: true,
    queEs: [
      "El radiador está delante del motor, detrás de la rejilla. El líquido caliente pasa por sus tubos finos y el aire que entra lo enfría.",
      "El electroventilador ayuda cuando no entra bastante aire, por ejemplo en un atasco.",
      "Ojo: el ventilador puede ponerse en marcha solo, incluso con el motor apagado, si el motor sigue caliente.",
    ],
    revisar: [
      { titulo: "Mira la rejilla", texto: "Que no haya hojas, bolsas o suciedad tapando el paso del aire." },
      { titulo: "Busca fugas", texto: "Manchas de líquido bajo el frontal o restos secos en el radiador pueden indicar una fuga." },
      { titulo: "Escucha el ventilador", texto: "Tras un atasco con calor es normal oírlo funcionar un rato." },
    ],
    falla: [
      "Si el testigo de temperatura se enciende o la aguja sube mucho, el motor se está calentando: detente con seguridad y para el motor.",
      "Un radiador obstruido o con fugas, o un ventilador que no funciona, pueden provocar el sobrecalentamiento.",
    ],
    cuidados: [
      "No metas las manos cerca del ventilador con el motor caliente: puede arrancar solo.",
      "Mantén el nivel de refrigerante correcto y la rejilla despejada.",
    ],
    examen: [
      {
        q: "El electroventilador del radiador sirve para…",
        opts: ["Enfriar el habitáculo.", "Ayudar a enfriar el líquido refrigerante cuando no entra suficiente aire.", "Cargar la batería."],
        correcta: 1,
        explica: "Mueve aire a través del radiador cuando el coche va despacio o está parado.",
      },
    ],
    datos: [
      ["Dónde está", "En el frontal, detrás de la rejilla"],
      ["Qué hace", "Enfría el líquido refrigerante con el aire"],
      ["Testigo", "Termómetro rojo: temperatura del motor alta"],
    ],
    capas: [
      { id: "nucleo", nombre: "Núcleo (tubos y aletas)" },
      { id: "depositos", nombre: "Depósitos laterales" },
      { id: "ventilador", nombre: "Electroventilador" },
      { id: "manguitos", nombre: "Manguitos" },
    ],
    animacion: [{ titulo: "El ventilador en marcha", texto: "Cuando el líquido está muy caliente y no entra bastante aire, el ventilador arranca y fuerza el paso del aire." }],
    mapa: { x: 6, y: 50, texto: "En la parte más delantera, detrás de la rejilla y del paragolpes." },
  },
  {
    slug: "frenos",
    nombre: "Depósito del líquido de frenos",
    corto: "Líquido de frenos",
    sistema: "Frenos",
    subtitulo: "Sin él, el pedal de freno no frena",
    disponible: true,
    queEs: [
      "Al pisar el freno, el líquido de frenos transmite la fuerza del pedal hasta las ruedas.",
      "El depósito está encima de la bomba de freno, normalmente en el lado del conductor, junto al habitáculo.",
      "Tiene marcas MIN y MAX. Es normal que el nivel baje un poco a medida que se gastan las pastillas.",
    ],
    revisar: [
      { titulo: "Coche en llano", texto: "Comprueba el nivel con el coche en una superficie llana." },
      { titulo: "Mira el nivel desde fuera", texto: "El depósito es translúcido: el nivel debe estar entre MIN y MAX." },
      { titulo: "Si está bajo, al taller", texto: "Un nivel bajo puede indicar pastillas muy gastadas o una fuga. Que lo revisen." },
    ],
    falla: [
      "Si se enciende el testigo rojo de frenos con el freno de mano quitado, puede faltar líquido o haber una avería: detente con seguridad y pide ayuda.",
      "Un pedal blando o que se hunde más de lo normal es una señal de alarma.",
    ],
    cuidados: [
      "El líquido de frenos absorbe humedad con el tiempo y pierde eficacia: se cambia cuando indique el manual del fabricante.",
      "Usa solo el tipo que indique el manual y con el depósito bien cerrado.",
      "Es corrosivo: evita que caiga sobre la pintura.",
    ],
    examen: [
      {
        q: "Si el nivel del líquido de frenos baja de forma notable, lo más probable es que…",
        opts: ["El coche consuma líquido de frenos al circular.", "Haya una fuga o las pastillas estén muy gastadas.", "Haga demasiado calor."],
        correcta: 1,
        explica: "El circuito es cerrado: si el nivel baja mucho, hay desgaste importante o una fuga.",
      },
    ],
    datos: [
      ["Dónde está", "Sobre la bomba de freno, junto al habitáculo"],
      ["Nivel correcto", "Entre MIN y MAX"],
      ["Particularidad", "Absorbe humedad con el tiempo"],
      ["Testigo", "Círculo rojo con «!» o «BRAKE»"],
    ],
    capas: [
      { id: "deposito", nombre: "Depósito" },
      { id: "liquido", nombre: "Líquido de frenos" },
      { id: "tapon", nombre: "Tapón" },
      { id: "bomba", nombre: "Bomba y servofreno" },
    ],
    animacion: [
      { titulo: "Pastillas nuevas", texto: "Con las pastillas nuevas el nivel está cerca de MAX." },
      { titulo: "Pastillas gastadas", texto: "Al gastarse las pastillas, el nivel baja poco a poco. Si llega a MIN, toca revisión." },
    ],
    mapa: { x: 38, y: 24, texto: "Al fondo del capó, junto al parabrisas, en el lado del conductor." },
  },
  {
    slug: "limpiaparabrisas",
    nombre: "Depósito del limpiaparabrisas",
    corto: "Limpiaparabrisas",
    sistema: "Visibilidad",
    subtitulo: "Para ver bien siempre",
    disponible: true,
    queEs: [
      "Guarda el líquido que sale por los surtidores al accionar el lavaparabrisas.",
      "Su tapón suele ser azul y llevar el dibujo de un parabrisas con chorros de agua.",
    ],
    revisar: [
      { titulo: "Abre el tapón", texto: "Es el único depósito que se puede abrir sin esperar a que el motor esté frío." },
      { titulo: "Rellena", texto: "Añade líquido limpiaparabrisas. En invierno, uno con anticongelante." },
    ],
    falla: ["Si no sale líquido, el depósito puede estar vacío, el surtidor obstruido o el líquido congelado."],
    cuidados: [
      "Mantenlo lleno, sobre todo antes de un viaje.",
      "Cambia las escobillas si dejan marcas o hacen ruido.",
    ],
    examen: [
      {
        q: "Circular con el parabrisas sucio y sin líquido limpiaparabrisas…",
        opts: ["No afecta a la seguridad.", "Reduce la visibilidad y es un riesgo.", "Solo importa de noche."],
        correcta: 1,
        explica: "Una buena visibilidad es fundamental; el lavaparabrisas debe funcionar.",
      },
    ],
    datos: [
      ["Tapón", "Normalmente azul, con el símbolo del parabrisas"],
      ["Qué echar", "Líquido limpiaparabrisas (con anticongelante en invierno)"],
    ],
    capas: [
      { id: "deposito", nombre: "Depósito" },
      { id: "tapon", nombre: "Tapón" },
      { id: "bomba", nombre: "Bomba y tubo" },
    ],
    mapa: { x: 10, y: 22, texto: "En una esquina delantera del capó." },
  },
  {
    slug: "bateria",
    nombre: "Batería",
    corto: "Batería",
    sistema: "Eléctrico",
    subtitulo: "La energía para arrancar",
    disponible: true,
    queEs: [
      "La batería da la corriente para arrancar el motor y alimenta los aparatos eléctricos cuando el motor está parado.",
      "Con el motor en marcha, el alternador la recarga.",
      "Tiene dos bornes: el positivo (+), normalmente con tapa roja, y el negativo (−).",
    ],
    revisar: [
      { titulo: "Para desconectarla: primero el negativo (−)", texto: "Así evitas cortocircuitos si la llave toca la carrocería." },
      { titulo: "Después, el positivo (+)", texto: "Con el negativo ya suelto, retira el positivo." },
      { titulo: "Para conectarla: primero el positivo (+)", texto: "Al montarla, el orden es el contrario." },
      { titulo: "Por último, el negativo (−)", texto: "Aprieta bien los bornes y comprueba que no haya óxido." },
    ],
    falla: [
      "Si el motor gira despacio al arrancar o no arranca, la batería puede estar descargada.",
      "Si se enciende el testigo rojo de la batería en marcha, el sistema no está cargando: acude a un taller.",
      "Los bornes con óxido blanco o verdoso hacen mal contacto.",
    ],
    cuidados: [
      "No dejes luces encendidas con el motor parado.",
      "Mantén los bornes limpios y bien apretados.",
      "No acerques llamas ni chispas: la batería puede desprender gases.",
    ],
    examen: [
      {
        q: "Para desconectar la batería, ¿qué borne se suelta primero?",
        opts: ["El positivo (+).", "El negativo (−).", "Da igual el orden."],
        correcta: 1,
        explica: "Se suelta primero el negativo y se conecta el último, para evitar cortocircuitos.",
      },
      {
        q: "Si se enciende en marcha el testigo de la batería, indica que…",
        opts: ["La batería está completamente cargada.", "Hay un fallo en el sistema de carga.", "Hay que cambiar el aceite."],
        correcta: 1,
        explica: "El alternador no está recargando la batería; conviene ir al taller.",
      },
    ],
    datos: [
      ["Borne positivo", "+ (normalmente con tapa roja)"],
      ["Borne negativo", "−"],
      ["Desconectar", "Primero el negativo, después el positivo"],
      ["Conectar", "Primero el positivo, después el negativo"],
      ["Testigo", "Batería roja: fallo en la carga"],
    ],
    capas: [
      { id: "caja", nombre: "Caja de la batería" },
      { id: "positivo", nombre: "Borne positivo (+)" },
      { id: "negativo", nombre: "Borne negativo (−)" },
      { id: "anclaje", nombre: "Anclaje" },
    ],
    animacion: [
      { titulo: "1 · Suelta el negativo (−)", texto: "Primero el negativo: así evitas cortocircuitos." },
      { titulo: "2 · Suelta el positivo (+)", texto: "Después el positivo. La batería ya está desconectada." },
      { titulo: "3 · Conecta el positivo (+)", texto: "Para montarla, primero el positivo." },
      { titulo: "4 · Conecta el negativo (−)", texto: "Y por último el negativo. Aprieta bien los bornes." },
    ],
    mapa: { x: 30, y: 76, texto: "Bajo el capó, a un lado del motor (en algunos coches va en el maletero o bajo un asiento)." },
  },
  {
    slug: "filtro-aire",
    nombre: "Filtro de aire",
    corto: "Filtro de aire",
    sistema: "Admisión y correas",
    subtitulo: "Aire limpio para el motor",
    disponible: true,
    queEs: [
      "El motor necesita aire para quemar el combustible. El filtro de aire retiene el polvo y la suciedad antes de que entren.",
      "Va dentro de una caja de plástico (la caja del filtro), con una tapa sujeta por pinzas o tornillos.",
    ],
    revisar: [
      { titulo: "Abre la caja", texto: "Suelta las pinzas o tornillos de la tapa." },
      { titulo: "Saca el filtro", texto: "Míralo a contraluz: si está muy sucio u oscuro, toca cambiarlo." },
      { titulo: "Monta y cierra bien", texto: "Colócalo en su posición y cierra la tapa sin dejar huecos." },
    ],
    falla: ["Un filtro muy sucio puede aumentar el consumo y hacer que el motor rinda menos."],
    cuidados: [
      "Se cambia cuando indique el manual del fabricante; antes si circulas a menudo por zonas con mucho polvo.",
      "No hay que confundirlo con el filtro de habitáculo (el del aire que entra al interior del coche).",
    ],
    examen: [
      {
        q: "Un filtro de aire muy sucio puede provocar…",
        opts: ["Un mayor consumo de combustible.", "Que se gasten antes los neumáticos.", "Que falle el claxon."],
        correcta: 0,
        explica: "Al motor le llega menos aire y funciona peor.",
      },
    ],
    datos: [
      ["Dónde está", "En una caja de plástico conectada a la entrada de aire del motor"],
      ["Cuándo se cambia", "Cuando indique el manual del fabricante"],
    ],
    capas: [
      { id: "caja", nombre: "Caja" },
      { id: "tapa", nombre: "Tapa" },
      { id: "filtro", nombre: "Filtro" },
      { id: "entrada", nombre: "Entrada de aire" },
    ],
    animacion: [
      { titulo: "Abre la tapa", texto: "Suelta las pinzas y levanta la tapa de la caja." },
      { titulo: "Saca el filtro", texto: "Revísalo: si está muy sucio, cámbialo por uno nuevo." },
    ],
    mapa: { x: 18, y: 72, texto: "Encima o a un lado del motor, conectado al conducto de entrada de aire." },
  },
  {
    slug: "correa",
    nombre: "Correa de distribución o de accesorios",
    corto: "Correa",
    sistema: "Admisión y correas",
    subtitulo: "Dos correas distintas, dos cuidados distintos",
    disponible: true,
    queEs: [
      "La correa de accesorios se ve en un lateral del motor y mueve el alternador, la bomba de agua y el compresor del aire acondicionado, según el coche.",
      "La correa (o cadena) de distribución va tapada dentro del motor y sincroniza sus piezas internas. Si se rompe, puede causar una avería grave.",
    ],
    revisar: [
      { titulo: "Correa de accesorios", texto: "Con el motor parado, mira que no tenga grietas ni deshilachados." },
      { titulo: "Escucha", texto: "Un chirrido al arrancar o al girar el volante puede indicar que patina o está desgastada." },
      { titulo: "Distribución: por kilómetros o años", texto: "No se ve. Se cambia cuando indique el manual del fabricante, aunque parezca que va bien." },
    ],
    falla: [
      "Si se rompe la correa de accesorios puede encenderse el testigo de la batería, porque el alternador deja de cargar.",
      "Una correa de distribución rota puede dañar seriamente el motor.",
    ],
    cuidados: [
      "Respeta los cambios de la correa de distribución que marca el manual del fabricante.",
      "No toques las correas ni las poleas con el motor en marcha.",
    ],
    examen: [
      {
        q: "La correa de distribución se cambia…",
        opts: ["Solo cuando se rompe.", "Cuando lo indique el fabricante, por kilómetros o tiempo.", "Cada vez que se cambia el aceite."],
        correcta: 1,
        explica: "Si se espera a que se rompa, la avería puede ser muy cara.",
      },
    ],
    datos: [
      ["Correa de accesorios", "Visible; mueve alternador, bomba de agua, etc."],
      ["Correa de distribución", "Tapada; sincroniza el motor"],
      ["Cuándo se cambian", "Cuando indique el manual del fabricante"],
    ],
    capas: [
      { id: "correa", nombre: "Correa" },
      { id: "poleas", nombre: "Poleas" },
      { id: "alternador", nombre: "Alternador" },
      { id: "tensor", nombre: "Tensor" },
    ],
    animacion: [{ titulo: "Motor en marcha", texto: "La polea del cigüeñal mueve la correa y esta hace girar el alternador y la bomba de agua." }],
    mapa: { x: 22, y: 82, texto: "En un lateral del motor." },
  },
];

export const PIEZA_DEFECTO = "motor";

export function getPieza(slug: string | undefined | null) {
  return PIEZAS.find((p) => p.slug === slug && p.disponible) ?? PIEZAS.find((p) => p.slug === PIEZA_DEFECTO)!;
}

export const SISTEMAS = Array.from(new Set(PIEZAS.map((p) => p.sistema)));

/** Testigos del salpicadero relacionados con lo que hay bajo el capó (todos rojos). */
export const TESTIGOS = [
  { id: "aceite", nombre: "Presión de aceite", pieza: "aceite", texto: "Aceitera roja: poca presión de aceite. Detente con seguridad y para el motor." },
  { id: "temperatura", nombre: "Temperatura del motor", pieza: "refrigerante", texto: "Termómetro rojo: el motor se calienta demasiado. Detente con seguridad y para el motor." },
  { id: "bateria", nombre: "Carga de la batería", pieza: "bateria", texto: "Batería roja: el sistema no está cargando la batería. Acude a un taller." },
  { id: "frenos", nombre: "Frenos", pieza: "frenos", texto: "«!» en un círculo rojo: freno de mano puesto, o falta líquido de frenos o hay una avería." },
] as const;
