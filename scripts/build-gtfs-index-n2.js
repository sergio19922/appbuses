// scripts/build-gtfs-index-n2.js
import fs from "fs";
import path from "path";

const indexPath = path.join("public", "gtfs", "index.json");
const outputPath = path.join("public", "gtfs", "index-n2.json");

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

// --- Definimos las rutas del N2 ---
const rutasN2 = [
  "1A","3","4","5A","6","824",
  "210","211","212","215","220","222","223","224",
  "226","227","229","231","232","250","251","252",
  "254","255","256","260","261"
];

// 🚫 Excluidas aunque encajen con el patrón
const rutasN2Excluidas = ["2", "224A"];


// --- Construcción del índice N2 ---
const indexN2 = paquetes
  .map((paquete) => {
    const paqueteId = paquete?.id;
    const rutasObjetivo = rutasN2[paqueteId];
    if (!rutasObjetivo) return null;

    const routes = Array.isArray(paquete?.routes) ? paquete.routes : [];
    const routesFiltradas = routes.filter(r =>
      rutasObjetivo.includes(r?.short_name)
    );

    // Mostrar detalle en consola
    console.log(
      `Paquete ${paqueteId}: ${routesFiltradas.length}/${routes.length} rutas incluidas.`
    );
    console.log("→ Coincidencias:", routesFiltradas.map(r => r.short_name).join(", "));

    if (routesFiltradas.length === 0) return null;

    return {
      ...paquete,
      carretera: "N2",
      routes: routesFiltradas
    };
  })
  .filter(Boolean);

fs.writeFileSync(outputPath, JSON.stringify(indexN2, null, 2), "utf8");
console.log(`✅ Índice N2 creado en ${outputPath}`);
