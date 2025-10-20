// scripts/build-gtfs-index-n4.js
import fs from "fs";
import path from "path";

const indexPath = path.join("public", "gtfs", "index.json");
const outputPath = path.join("public", "gtfs", "index-n4.json");

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

// --- Definimos las rutas del N4 ---
const rutasN4 = {
  paquete_024: ["421", "422", "423", "424", "425", "426", "427", "428"],
  sueltos: [
    "402",
    "6",
    "circular-roja",
    "circularverde",
    "colmenar",
    "fuenlabradacentral",
    "miraflores",
    "sesena",
    "cementerio",
    "loranca"
  ]
};

// --- Construcción del índice N4 ---
const indexN4 = paquetes
  .map((paquete) => {
    const paqueteId = paquete?.id;

    // Caso especial: paquete_024 contiene varias rutas
    if (paqueteId === "paquete_024") {
      const rutasObjetivo = rutasN4["paquete_024"];
      const routes = Array.isArray(paquete?.routes) ? paquete.routes : [];
      const routesFiltradas = routes.filter(r =>
        rutasObjetivo.includes(r?.short_name)
      );

      return {
        ...paquete,
        carretera: "N4",
        routes: routesFiltradas
      };
    }

    // Caso especial: paquetes sueltos
    if (rutasN4.sueltos.includes(paqueteId)) {
      // 🔴 Forzamos Loranca a hasShape = true siempre
      if (paqueteId === "loranca") {
        return {
          ...paquete,
          carretera: "N4",
          routes: (paquete.routes || []).map(r => ({
            ...r,
            hasShape: true
          }))
        };
      }

      return {
        ...paquete,
        carretera: "N4"
      };
    }

    return null;
  })
  .filter(Boolean);

fs.writeFileSync(outputPath, JSON.stringify(indexN4, null, 2), "utf8");
console.log(`✅ Índice N4 creado en ${outputPath}`);
