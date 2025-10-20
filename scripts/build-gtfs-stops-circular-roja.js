// scripts/build-gtfs-stops-circular-roja.js
import fs from "fs";

const stops = [
  { id: "1", name: "Barrio El Naranjo (Galicia)", lat: 40.29525, lon: -3.81256 },
  { id: "2", name: "Almendro (C.C. Nexum)", lat: 40.2876, lon: -3.8001 },
  { id: "3", name: "Móstoles", lat: 40.2903, lon: -3.8050 },
  { id: "4", name: "Av. Naciones", lat: 40.2869, lon: -3.8035 },
  { id: "5", name: "C.° Molino", lat: 40.2850, lon: -3.8010 },
  { id: "6", name: "Portugal", lat: 40.2835, lon: -3.7995 },
  { id: "7", name: "Av. Andes", lat: 40.2820, lon: -3.7980 },
  { id: "8", name: "Av. España", lat: 40.2810, lon: -3.7970 },
  { id: "9", name: "Castilla La Vieja", lat: 40.2800, lon: -3.7960 },
  { id: "10", name: "Avilés", lat: 40.2790, lon: -3.7950 },
  { id: "11", name: "Av. Estados", lat: 40.2780, lon: -3.7940 },
  { id: "12", name: "Brasil", lat: 40.2770, lon: -3.7930 },
  { id: "13", name: "Av. Fco. Sauquillo", lat: 40.2760, lon: -3.7920 },
  { id: "14", name: "Av. Fco. J. Sauquillo", lat: 40.2750, lon: -3.7910 },
  { id: "15", name: "Móstoles", lat: 40.2740, lon: -3.7900 },
  { id: "16", name: "Luis Sauquillo", lat: 40.2730, lon: -3.7890 },
  { id: "17", name: "Panaderas", lat: 40.2720, lon: -3.7880 },
  { id: "18", name: "Com. Madrid", lat: 40.2710, lon: -3.7870 },
  { id: "19", name: "Parque de los Estados", lat: 40.2700, lon: -3.7860 },
  { id: "20", name: "La Serna", lat: 40.2690, lon: -3.7850 },
  { id: "21", name: "Hospital de Europa (Metro)", lat: 40.2680, lon: -3.7840 },
  { id: "22", name: "Parque Europa (Metro)", lat: 40.2670, lon: -3.7830 },
  { id: "23", name: "Fuenlabrada Central (Metro)", lat: 40.2660, lon: -3.7820 }
];

// Generar stops.txt en formato GTFS
const header = "stop_id,stop_name,stop_lat,stop_lon\n";
const rows = stops.map(s => `${s.id},${s.name},${s.lat},${s.lon}`);
const csv = header + rows.join("\n");

const dir = "public/gtfs/circular-roja";
fs.mkdirSync(dir, { recursive: true });
const outputPath = `${dir}/stops.txt`;
fs.writeFileSync(outputPath, csv, "utf8");

console.log(`✅ stops.txt generado: ${outputPath} (${stops.length} paradas)`);
