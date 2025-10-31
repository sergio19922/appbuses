import fs from "fs";
import path from "path";

const shapesDir = path.resolve("public/gtfs_prepared/shapes");
if (!fs.existsSync(shapesDir)) fs.mkdirSync(shapesDir, { recursive: true });

// Coordenadas aproximadas (plausibles para mapa)
const fallbackShapes = {
  "8__161___": [
    [40.4662, -3.6894], // Plaza Castilla
    [40.5269, -3.6423],
    [40.5390, -3.6269],
    [40.5533, -3.6161],
    [40.5668, -3.6170],
    [40.6094, -3.5959], // Fuente del Fresno
  ],
  "8__182___": [
    [40.4662, -3.6894], // Plaza Castilla
    [40.563, -3.6],     // Algete
    [40.67, -3.52],     // Valdeolmos
  ],
  "8__185___": [
    [40.4662, -3.6894], // Plaza Castilla
    [40.563, -3.6],     // Algete
    [40.58, -3.54],     // Nuevo Algete
  ],
};

for (const [routeId, coords] of Object.entries(fallbackShapes)) {
  const shapeId = routeId;
  const outFile = path.join(shapesDir, `${shapeId}.json`);

  if (fs.existsSync(outFile)) {
    console.log(`✔️ Ya existe ${shapeId}`);
    continue;
  }

  fs.writeFileSync(outFile, JSON.stringify({ coords }, null, 2));
  console.log(`✅ Creado ${outFile}`);
}

console.log("🎯 Shapes faltantes generados correctamente");
