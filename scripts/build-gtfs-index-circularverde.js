// scripts/build-gtfs-index-circular-verde.js

import fs from "fs";
import path from "path";

const outputDir = path.join(process.cwd(), "public", "gtfs", "circular-verde");

// Lista de paradas de la Circular Verde (L2)
const stops = [
  "Barrio El Naranjo (Galicia)",
  "Av. Provincias",
  "Zamora",
  "Castilla La Nueva",
  "Av. España",
  "Barcelona",
  "Av. Andes",
  "Calle Asturias",
  "Av. Estados",
  "Panaderas",
  "Extremadura",
  "Constitución",
  "Av. Fco. J. Sauquillo",
  "Av. Madrid",
  "Concejal Jiménez",
  "Luis Sauquillo",
  "Móstoles (zona sur)",
  "Suiza",
  "Portugal",
  "Ctra. del Molino",
  "Francia",
  "Av. Europa",
  "Móstoles - Polígono Vereda",
  "Almendro (C.C. Nexum)"
];

// Generamos coordenadas dummy en secuencia para shapes.txt
// ⚠️ Sustituir por coordenadas reales si las tienes
const baseLat = 40.29943;
const baseLon = -3.80956;

const shapes = stops.map((stop, i) => ({
  shape_id: "CIRCULAR2",
  shape_pt_lat: (baseLat - i * 0.001).toFixed(6),
  shape_pt_lon: (baseLon - i * 0.001).toFixed(6),
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
