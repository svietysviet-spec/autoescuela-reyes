import * as THREE from "three";

// Rotulación de Reyes pintada sobre la carrocería: franjas amarillas y negras, «ReYes» y la web.
// Se proyecta sobre los laterales del coche desde la pintura (sin calcas ni texturas del modelo).

const YELLOW = "#f7ce3e";
const BLACK = "#15171b";

/** Lienzo de un lateral: `frontAtLeft` indica si el morro del coche queda a la izquierda del dibujo. */
function drawSide(frontAtLeft: boolean) {
  const W = 2048;
  const H = 400; // cubre de y = 0,25 m a y = 1,0 m
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, W, H);
  // x del dibujo → posición a lo largo del coche (0 = morro)
  const X = (f: number) => (frontAtLeft ? f : 1 - f) * W;
  const span = (f0: number, f1: number) => [Math.min(X(f0), X(f1)), Math.abs(X(f1) - X(f0))] as const;
  g.save();
  g.translate(0, H);
  g.scale(1, -1); // la v del sombreador crece hacia arriba

  // franja amarilla baja a lo largo de las puertas
  const [bx, bw] = span(0.2, 0.78);
  g.fillStyle = YELLOW;
  g.beginPath();
  g.moveTo(bx, 70);
  g.lineTo(bx + bw, 70);
  g.lineTo(bx + bw - 40, 150);
  g.lineTo(bx + 40, 150);
  g.closePath();
  g.fill();

  // cortes diagonales amarillos y negros detrás de la rueda trasera
  for (let i = 0; i < 4; i++) {
    const f = 0.8 + i * 0.035;
    const [x] = span(f, f + 0.018);
    g.fillStyle = i % 2 ? BLACK : YELLOW;
    g.beginPath();
    g.moveTo(x, 70);
    g.lineTo(x + 34, 70);
    g.lineTo(x + 34 + (frontAtLeft ? 60 : -60), 250);
    g.lineTo(x + (frontAtLeft ? 60 : -60), 250);
    g.closePath();
    g.fill();
  }
  g.restore();

  // «ReYes» grande en la puerta delantera y la web en la trasera
  g.fillStyle = BLACK;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = "italic 900 150px 'Arial Black', 'Helvetica Neue', Arial, sans-serif";
  g.lineWidth = 10;
  g.strokeStyle = YELLOW;
  const logoX = X(0.38);
  g.strokeText("ReYes", logoX, H - 210);
  g.fillText("ReYes", logoX, H - 210);
  g.font = "700 40px 'Helvetica Neue', Arial, sans-serif";
  g.fillText("AUTOESCUELA", logoX, H - 120);
  g.font = "600 34px 'Helvetica Neue', Arial, sans-serif";
  g.fillText("www.autoescuelareyes.com", X(0.62), H - 200);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Inyecta la rotulación en el material de la carrocería. */
export function applyLivery(mat: THREE.MeshPhysicalMaterial) {
  const left = drawSide(true); // lado +x (conductor): visto desde fuera, el morro queda a la izquierda
  const right = drawSide(false);
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uSideA = { value: left };
    sh.uniforms.uSideB = { value: right };
    sh.vertexShader =
      "varying vec3 vWPos;\nvarying vec3 vWN;\n" +
      sh.vertexShader.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvWN = normalize(mat3(modelMatrix) * objectNormal);",
      );
    sh.fragmentShader =
      "uniform sampler2D uSideA;\nuniform sampler2D uSideB;\nvarying vec3 vWPos;\nvarying vec3 vWN;\n" +
      sh.fragmentShader.replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        if (!gl_FrontFacing) diffuseColor.rgb = vec3(0.09, 0.095, 0.11); // cara interior: panel oscuro
        if (gl_FrontFacing && vWN.x * vWPos.x > 0.0 && abs(vWN.x) > 0.45 && abs(vWPos.x) > 0.6) {
          float f = (2.04 - vWPos.z) / 4.08;
          float v = (vWPos.y - 0.25) / 0.75;
          if (f > 0.0 && f < 1.0 && v > 0.0 && v < 1.0) {
            vec4 t = vWPos.x > 0.0 ? texture2D(uSideA, vec2(f, v)) : texture2D(uSideB, vec2(1.0 - f, v));
            diffuseColor.rgb = mix(diffuseColor.rgb, t.rgb, t.a);
          }
        }`,
      );
  };
  mat.customProgramCacheKey = () => "reyes-livery";
}
