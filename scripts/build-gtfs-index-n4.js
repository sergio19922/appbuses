// scripts/build-gtfs-index-n4.js
import fs from "fs";
import path from "path";

const indexPath = path.join("public", "gtfs", "index.json");
const outputPath = path.join("public", "gtfs", "index-n4.json");

// 🧱 Verificar existencia
if (!fs.existsSync(indexPath)) {
  console.error(`❌ No se encontró ${indexPath}`);
  process.exit(1);
}

// 📖 Leer index.json
let indexData;
try {
  indexData = JSON.parse(fs.readFileSync(indexPath, "utf8"));
} catch (e) {
  console.error("❌ index.json no es JSON válido.");
  process.exit(1);
}

// 🧩 Obtener lista de paquetes
let paquetes;
if (Array.isArray(indexData)) {
  paquetes = indexData;
} else if (typeof indexData === "object") {
  paquetes =
    Object.values(indexData).find(Array.isArray) ||
    Object.values(indexData).filter(Array.isArray)[0];
}
if (!Array.isArray(paquetes)) {
  console.error("❌ No se encontró lista de paquetes válida en index.json.");
  process.exit(1);
}

console.log("📦 Total de paquetes detectados:", paquetes.length);
console.log("🧾 IDs detectados:", paquetes.map(p => p.id));

// 🚍 Definición de rutas N4 reales
const rutasN4 = {
  paquete_024: ["421", "422", "423", "424", "425", "426", "427", "428"],
  sueltos: [
    // Interurbanas N4
    "161", "402",
    // Urbanas N4
    "fuenlabrada1",
    "fuenlabrada2",
    "fuenlabrada3",
    "fuenlabrada4",
    "fuenlabrada6",
    "fuenlabrada13",
    "fuenlabradacentral",
    "circular-roja",
    "cementerio",
    
    "miraflores",
    "leganes1"
  ]
};

// 🚫 Exclusiones explícitas
const excluir = ["circularverde", "institutoalgete"];

// 🔠 Normalizador
const normalize = s => s?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";

const indexN4 = [];

// 🧮 Construcción del índice N4
for (const paquete of paquetes) {
  const paqueteId = (paquete?.id || paquete?.name || "").trim();
  if (!paqueteId) continue;
  const normId = normalize(paqueteId);

  // 🟩 Caso especial: paquete_024
  if (normId === "paquete024") {
    const rutasObjetivo = rutasN4.paquete_024;
    const routes = Array.isArray(paquete.routes) ? paquete.routes : [];
    const filtradas = routes.filter(r =>
      rutasObjetivo.includes(r?.short_name)
    );

    if (filtradas.length) {
      console.log("🟢 Añadiendo paquete_024:", filtradas.map(r => r.short_name));
      indexN4.push({
        ...paquete,
        carretera: "N4",
        routes: filtradas.map(r => ({
          ...r,
          carretera: "N4",
          color: "00843D", // 💚 Verde interurbana
          hasShape: true
        }))
      });
    }
    continue;
  }

  // 🟢 Coincidencia exacta con rutas sueltas
  // 🟩 Coincidencia por paquete o por nombre de ruta
// ✅ Detección más flexible para rutas urbanas del sur (Fuenlabrada, Leganés…)
const perteneceN4 =
  normId.startsWith("fuenlabrada") || // cualquier paquete fuenlabrada*
  normId.startsWith("leganes") ||
  rutasN4.sueltos.some(s => {
    if (normId === normalize(s)) return true;

    return (paquete.routes || []).some(r => {
      const shortNorm = normalize(r.short_name);
      const longNorm = normalize(r.long_name);

      // Coincidencia por F13, F4, etc.
      if (shortNorm.startsWith("f") && longNorm.includes("fuenlabrada")) return true;

      return (
        shortNorm === normalize(s) ||
        longNorm.includes(normalize(s))
      );
    });
  });


if (perteneceN4) {
  console.log("🟢 Añadiendo paquete N4:", paqueteId);


    const color = paqueteId.startsWith("fuenlabrada") || paqueteId.startsWith("leganes")
      ? "E60003" // 🔴 Urbana N4
      : "00843D"; // 💚 Interurbana

    const rutasActualizadas = (paquete.routes || []).map(r => ({
      ...r,
      carretera: "N4",
      color: r.color || color,
      hasShape: true
    }));

    indexN4.push({
      ...paquete,
      carretera: "N4",
      routes: rutasActualizadas
    });
  }
}

// 🚫 Filtrar exclusiones finales
// 🧩 Reforzar inclusión de todas las líneas urbanas Fuenlabrada (F1–F13)
for (let i = 1; i <= 13; i++) {
  const id = `fuenlabrada${i}`;
  const yaExiste = indexN4.some(p => normalize(p.id) === normalize(id));

  if (!yaExiste) {
    const original = paquetes.find(p => normalize(p.id) === normalize(id));
    if (original) {
      console.log(`🟥 Añadiendo automáticamente paquete urbano: ${id}`);
      indexN4.push({
        ...original,
        carretera: "N4",
        routes: (original.routes || []).map(r => ({
          ...r,
          carretera: "N4",
          color: "E60003", // 🔴 Urbana N4
          hasShape: true
        }))
      });
    }
  }
}

// 🚫 Filtrar exclusiones finales
const indexN4Final = indexN4.filter(p => !excluir.includes(normalize(p.id)));

// 🧱 Añadir manualmente el paquete del Cementerio si no existe ya
// 🧱 Añadir manualmente el paquete del Cementerio si no existe ya
const existeCementerio = indexN4Final.some(p =>
  (p.routes || []).some(r => r.route_id === "cementerio_001")
);

if (!existeCementerio) {
  indexN4Final.push({
    id: "cementerio_manual",
    base: "/gtfs/cementerio",
    carretera: "N4",
    routes: [
      {
        route_id: "cementerio_001",
        short_name: "CEM",
        long_name: "Fuenlabrada - Cementerio",
        color: "E60003", // 🔴 Urbana
        hasShape: true,
        shape_id: "cementerio_001"
      }
    ]
  });
  console.log("🟥 Añadido manualmente el paquete 'cementerio_manual'");
}

// 🧩 Añadir manualmente el paquete de la Circular Verde si no existe ya
const existeCircularVerde = indexN4Final.some(p =>
  (p.routes || []).some(r => r.route_id === "circularverde_001")
);

if (!existeCircularVerde) {
  indexN4Final.push({
    id: "circularverde_manual",
    base: "/gtfs/circularverde",
    carretera: "N4",
    routes: [
      {
        route_id: "circularverde_001",
        short_name: "Circular Verde",
        long_name: "Fuenlabrada - Circular Verde",
        color: "8EBF42", // 💚 Verde clara
        hasShape: true,
        shape_id: "circularverde_001"
      }
    ]
  });
  console.log("🟩 Añadido manualmente el paquete 'circularverde_manual'");
}


// 💾 Guardar resultado final
fs.writeFileSync(outputPath, JSON.stringify(indexN4Final, null, 2), "utf8");
console.log(`✅ index-n4.json generado con ${indexN4Final.length} paquetes (limpio).`);
