// Prepara el coche de prácticas para la web a partir del glTF original del Kia Rio (CC BY 4.0, tonielpro520).
//   node scripts/optimizar-coche.mjs              → public/models/coche.glb y coche-lite.glb
//   node scripts/optimizar-coche.mjs --analizar   → lista cada pieza con su caja en metros
// Quita logos y matrícula, pasa a metros (el coche mide 4,07 m), centra, une piezas por material
// y comprime con meshopt.
import { NodeIO, PropertyType } from "@gltf-transform/core";
import { EXTMeshoptCompression, KHRMeshQuantization } from "@gltf-transform/extensions";
import { cloneDocument, dedup, join, meshopt, prune, quantize, simplify, weld } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer";
import { getBounds } from "@gltf-transform/core";

const SRC = "modelos/kia-rio/scene.gltf";
const LENGTH_M = 4.07;
// materiales que se eliminan: logotipos de la marca y matrícula
const DROP = /Kia_Logo|Badges|License_Plate/;

await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({
  "meshopt.encoder": MeshoptEncoder,
});

const doc = await io.read(SRC);
const root = doc.getRoot();
const scene = root.listScenes()[0];

// 1 · escala a metros, centrado en x/z y apoyado en el suelo
const b0 = getBounds(scene);
const len = b0.max[2] - b0.min[2];
const k = LENGTH_M / len;
const cx = (b0.min[0] + b0.max[0]) / 2;
const cz = (b0.min[2] + b0.max[2]) / 2;
const wrapper = doc.createNode("coche").setScale([k, k, k]).setTranslation([-cx * k, -b0.min[1] * k, -cz * k]);
for (const n of scene.listChildren()) {
  scene.removeChild(n);
  wrapper.addChild(n);
}
scene.addChild(wrapper);

if (process.argv.includes("--analizar")) {
  const rows = [];
  for (const node of root.listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    const mat = mesh.listPrimitives()[0].getMaterial()?.getName().replace("M_2021_Kia_Rio_Hatchback_", "") ?? "";
    const b = getBounds(node);
    const tris = mesh.listPrimitives().reduce((s, p) => s + (p.getIndices()?.getCount() ?? 0) / 3, 0);
    rows.push({ node: node.getName(), mat, tris, min: b.min.map((v) => +v.toFixed(2)), max: b.max.map((v) => +v.toFixed(2)) });
  }
  console.log(JSON.stringify({ scale: k, bounds: getBounds(scene), rows }, null, 1));
  process.exit(0);
}

// 2 · fuera logos y matrícula (la cabina original se recorta en el navegador con planos de corte)
for (const node of root.listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  const name = mesh.listPrimitives()[0].getMaterial()?.getName() ?? "";
  // Object_4 y Object_5: los emblemas del capó, del portón y del lateral (material genérico Color_M02).
  // Object_9 y Object_10: las escobillas fijas del modelo (la web pinta unas propias que se mueven).
  if (DROP.test(name) || ["Object_4", "Object_5", "Object_9", "Object_10"].includes(node.getName())) node.dispose();
}

// 3 · une piezas por material, suelda vértices y comprime (calidad completa para escritorio)
// ojo: todos los materiales del original son iguales (blancos); no se deduplican para no perder sus nombres
await doc.transform(
  prune(),
  dedup({ propertyTypes: [PropertyType.ACCESSOR, PropertyType.MESH, PropertyType.TEXTURE] }),
  join({ keepNamed: false }),
  weld(),
  prune({ keepAttributes: true }),
);
const full = cloneDocument(doc);
await full.transform(quantize(), meshopt({ encoder: MeshoptEncoder, level: "medium" }));
await io.write("public/models/coche.glb", full);

// 4 · versión ligera para móvil: la mitad de triángulos
await doc.transform(simplify({ simplifier: MeshoptSimplifier, ratio: 0.5, error: 0.004, lockBorder: false }));
await doc.transform(quantize(), meshopt({ encoder: MeshoptEncoder, level: "medium" }));
await io.write("public/models/coche-lite.glb", doc);
console.log("listo: public/models/coche.glb y coche-lite.glb");
