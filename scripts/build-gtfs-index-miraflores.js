// scripts/build-gtfs-index-miraflores.js

import fs from "fs";
import path from "path";

const outputDir = path.join(process.cwd(), "public", "gtfs", "miraflores");

// Lista fija de 15 paradas de la Línea 1 Parque Miraflores
const stops = [
  "Polígono Sevilla (Camino Bajo de Getafe)",
  "Cruce Pol. Ind. El Álamo",
  "Cruce Pol. Ind. El Palomo",
  "Ctra. Pinto",
  "Constitución",
  "Avda. Econ. y Social",
  "Leganés – S. Saquillo",
  "Móstoles",
  "Galicia",
  "Islas Británicas",
  "Francia",
  "C/ del Molino",
  "Av. del Hospital",
  "Nuevo Versalles",
  "Av. Pablo Iglesias – Parque Miraflores"
];

// Generamos coordenadas dummy (lat, lon) en secuencia para shapes.txt
// ⚠️ Esto es un placeholder. Si luego quieres, se pueden sustituir por coords reales.
const baseLat = 40.717;
const baseLon = -3.766;

const shapes = stops.map((stop, i) => ({
  shape_id: "MIRAFLORES",
  shape_pt_lat: (baseLat + i * 0.001).toFixed(6),
  shape_pt_lon: (baseLon + i * 0.001).toFixed(6),
  shape_pt_sequence: i + 1
}));

// Guardar shapes.txt
const shapesTxt = [
  "shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence",
  ...shapes.map(
    (s) =>
      `${s.shape_id},${s.shape_pt_lat},${s.shape_pt_lon},${s.shape_pt_sequence}`
  )
].join("\n");

// Crear carpeta si no existe
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "shapes.txt"), shapesTxt, "utf8");

console.log(
  `✅ shapes.txt generado: ${path.join(outputDir, "shapes.txt")} (${stops.length} puntos)`
);
