// scripts/build-gtfs-stops-miraflores.js
import fs from "fs";

const stops = [
  { id: "1", name: "POLÍGONO SEVILLA", lat: 40.2821, lon: -3.7895 },
  { id: "2", name: "Cruce Pol. Ind. El Álamo", lat: 40.2840, lon: -3.7847 },
  { id: "3", name: "Cruce Pol. Ind. El Palomo", lat: 40.2862, lon: -3.7803 },
  { id: "4", name: "Ctra. Pinto", lat: 40.2890, lon: -3.7741 },
  { id: "5", name: "Constitución", lat: 40.2931, lon: -3.7689 },
  { id: "6", name: "Avda. Fco. J. Sauquillo", lat: 40.2974, lon: -3.7623 },
  { id: "7", name: "Leganés", lat: 40.3012, lon: -3.7578 },
  { id: "8", name: "Móstoles", lat: 40.3050, lon: -3.7521 },
  { id: "9", name: "Galicia", lat: 40.3095, lon: -3.7470 },
  { id: "10", name: "Islas Británicas", lat: 40.3132, lon: -3.7419 },
  { id: "11", name: "Francia", lat: 40.3169, lon: -3.7360 },
  { id: "12", name: "C. del Molino", lat: 40.3201, lon: -3.7308 },
  { id: "13", name: "Av. del Hospital", lat: 40.3238, lon: -3.7251 },
  { id: "14", name: "Av. Pablo Iglesias", lat: 40.3276, lon: -3.7193 },
  { id: "15", name: "PARQUE MIRAFLORES", lat: 40.3310, lon: -3.7135 },
];

// Generar stops.txt en formato GTFS
const header = "stop_id,stop_name,stop_lat,stop_lon\n";
const rows = stops.map(
  (s) => `${s.id},${s.name},${s.lat},${s.lon}`
);

const csv = header + rows.join("\n");

// Guardar en public/gtfs/miraflores
const outputPath = "public/gtfs/miraflores/stops.txt";
fs.writeFileSync(outputPath, csv, "utf8");

console.log(`✅ stops.txt generado: ${outputPath} (${stops.length} paradas)`);
