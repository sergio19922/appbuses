// scripts/build-gtfs-index-n6.js
import fs from "fs";
import path from "path";

const indexPath = path.join("public", "gtfs", "index.json");
const outputPath = path.join("public", "gtfs", "index-n6.json");

if (!fs.existsSync(indexPath)) {
  console.error(`❌ No se encontró ${indexPath}`);
  process.exit(1);
}

let indexData;
try {
  indexData = JSON.parse(fs.readFileSync(indexPath, "utf8"));
} catch {
  console.error("❌ index.json no es JSON válido.");
  process.exit(1);
}

// Obtener lista de paquetes
let paquetes =
  Array.isArray(indexData)
    ? indexData
    : Object.values(indexData).find(Array.isArray) ||
      Object.values(indexData).filter(Array.isArray)[0];

if (!Array.isArray(paquetes)) {
  console.error("❌ No se encontró lista válida de paquetes.");
  process.exit(1);
}

// Filtramos solo los paquetes de la N6
const paquetesN6 = ["paquete_004", "paquete_026", "paquete_039"];

// Diccionario de renombres exactos por route_id
const renombres = {
  // 🟥 Boadilla del Monte
  "9__1__022_": "Urbana Boadilla L1",
  "9__2__022_": "Urbana Boadilla L2",
  "9__3__022_": "Urbana Boadilla L3",
  "9__4__022_": "Urbana Boadilla L4",

  // 🟥 Las Rozas / Molino de la Hoz
  "9__1__127_": "Urbana Las Rozas L1",
  "9__2__127_": "Urbana Las Rozas L2",

  // 🟥 San Lorenzo / El Escorial
  "9__1__131_": "Urbana San Lorenzo L1",
  "9__2__131_": "Urbana San Lorenzo L2",
  "9__3__054_": "Urbana El Escorial L3",
  "9__4__131_": "Urbana San Lorenzo L4"
};

// Construcción del nuevo índice N6
const indexN6 = paquetes
  .filter(p => paquetesN6.includes(p.id))
  .map(p => ({
    ...p,
    carretera: "N6",
    routes: (p.routes || []).map(r => {
      const nuevoNombre = renombres[r.route_id];
      if (nuevoNombre) {
        console.log(`🟢 Renombrando ${r.route_id} → ${nuevoNombre}`);
        return {
          ...r,
          long_name: nuevoNombre,
          short_name: r.short_name.replace(/^0/, ""), // elimina ceros iniciales
          color: "E60003",
          hasShape: true,
          carretera: "N6"
        };
      }
      return { ...r, carretera: "N6" };
    })
  }));

// Guardar resultado
fs.writeFileSync(outputPath, JSON.stringify(indexN6, null, 2), "utf8");
console.log(`✅ index-n6.json generado con ${indexN6.length} paquetes`);
