// scripts/build-gtfs-index-n5.js
import fs from "fs";
import path from "path";

const indexPath = path.join("public", "gtfs", "index.json");
const outputPath = path.join("public", "gtfs", "index-n5.json");

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

// --- Función para normalizar short_name (quita guiones, espacios, etc.)
function normalizeCode(code) {
  return String(code || "").replace(/[^0-9A-Za-z]/g, "").toUpperCase();
}

// --- Definimos las rutas del N5 ---
const rutasN5 = {
  paquete_008: ["495", "498", "498A", "499"],
  paquete_034: [
    "510", "510A", "511", "512", "513", "514", "516", "517", "518", "519", "519B",
    "520", "521", "522", "523", "524", "526", "527", "528", "529", "530", "531",
    "531A", "532", "534", "539"
  ],
  paquete_043: ["541", "545", "546", "547", "548"],
  paquete_026: [
    "580", "581", "620", "621", "622", "623", "624", "625", "626", "627", "628", "629"
  ],
  sueltos: []
};


// --- Construcción del índice N5 ---
const indexN5 = paquetes
  .map((paquete) => {
    const paqueteId = paquete?.id;

    // Caso especial: paquete con varias rutas
    if (rutasN5[paqueteId]) {
      const rutasObjetivo = rutasN5[paqueteId].map(normalizeCode);
      const routes = Array.isArray(paquete?.routes) ? paquete.routes : [];

      const routesFiltradas = routes.filter(r =>
        rutasObjetivo.includes(normalizeCode(r?.short_name))
      );

      console.log(
        `Paquete ${paqueteId}: ${routesFiltradas.length}/${routes.length} rutas incluidas.`
      );
      console.log("→ Coincidencias:", routesFiltradas.map(r => r.short_name).join(", "));

      return {
        ...paquete,
        carretera: "N5",
        routes: routesFiltradas
      };
    }

    // Caso especial: paquetes sueltos
    if (rutasN5.sueltos.includes(paqueteId)) {
      console.log(`Paquete suelto ${paqueteId} incluido en N5.`);
      return {
        ...paquete,
        carretera: "N5"
      };
    }

    return null;
  })
  .filter(Boolean);

  // --- 🔧 Forzar inclusión manual de circularverde si no está ---



fs.writeFileSync(outputPath, JSON.stringify(indexN5, null, 2), "utf8");
console.log(`✅ Índice N5 creado en ${outputPath}`);
