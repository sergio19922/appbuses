// scripts/build-gtfs-index-n6.js
import fs from "fs";
import path from "path";

const indexPath = path.join("public", "gtfs", "index.json");
const outputPath = path.join("public", "gtfs", "index-n6.json");

if (!fs.existsSync(indexPath)) {
  console.error(`❌ No se encontró ${indexPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(indexPath, "utf8");
let indexData;
try {
  indexData = JSON.parse(raw);
} catch (e) {
  console.error("❌ index.json no es JSON válido.");
  console.error(e.message);
  process.exit(1);
}

// --- Normalización: obtenemos la lista de paquetes ---
let paquetes;
if (Array.isArray(indexData)) {
  paquetes = indexData;
} else if (indexData && typeof indexData === "object") {
  const candidates = [
    "packages",
    "data",
    "paquetes",
    "items",
    "index",
    "results",
    "routes"
  ];
  paquetes =
    candidates.map(k => indexData[k]).find(Array.isArray) ||
    Object.values(indexData).find(Array.isArray);
}

if (!Array.isArray(paquetes)) {
  console.error("❌ No se pudo encontrar una lista de paquetes en index.json.");
  process.exit(1);
}

// --- Paquetes que pertenecen a N6 ---
const paquetesN6 = ["paquete_004", "paquete_026", "paquete_039"];

// --- Diccionario de renombres SOLO para rutas urbanas de N6 ---
const renombres = {
  "9__1__127_": { short_name: "1", long_name: "Urb. 1 Boadilla del Monte" },
  "9__1__022_": { short_name: "1", long_name: "Urb. 1 El Escorial" },
  "9__2__127_": { short_name: "2", long_name: "Urb. 2 Boadilla del Monte" },
  "9__2__022_": { short_name: "2", long_name: "Urb. 2 El Escorial" },
  "9__3__127_": { short_name: "3", long_name: "Urb. 3 Boadilla del Monte" },
  "9__3__022_": { short_name: "3", long_name: "Urb. 3 El Escorial" },
  "9__4__127_": { short_name: "4", long_name: "Urb. 4 Boadilla del Monte" },
  "9__4__131_": { short_name: "4", long_name: "Urb. 4 San Lorenzo del Escorial" }
};

// --- Construcción del índice SOLO con N6 ---
const indexN6 = paquetes
  .filter(paquete => paquetesN6.includes(paquete.id)) // ✅ solo N6
  .map(paquete => {
    let rutasModificadas = (paquete.routes || []).map(r => {
      let ren = renombres[r.route_id];
      if (ren) {
        return { ...r, ...ren, carretera: "N6" };
      }
      return { ...r, carretera: "N6" };
    });
    return { ...paquete, routes: rutasModificadas, carretera: "N6" };
  });

fs.writeFileSync(outputPath, JSON.stringify(indexN6, null, 2), "utf8");
console.log(`✅ Índice N6 creado en ${outputPath}`);
