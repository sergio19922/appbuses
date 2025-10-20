// scripts/build-gtfs-index-n3.js
import fs from "fs";
import path from "path";

const clean = str => String(str || "").trim().toUpperCase();

// 🔹 Rutas N3 definidas por paquete
const rutasN3 = {
  paquete_009: [
    "1","2","3","4","312","313","320","321","322","326"
  ].map(clean),

  paquete_050: [
    "350A","350B","350C","351","352","353","355"
  ].map(clean),
};

// ---------------------------------------------------
const INDEX_PATH = path.join("public", "gtfs", "index.json");
const OUTPUT_PATH = path.join("public", "gtfs", "index-n3.json");

const indexData = JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"));
const n3Packages = [];

Object.entries(rutasN3).forEach(([paqueteId, rutasLista]) => {
  const pack = indexData.packages.find(p => p.id === paqueteId);
  if (!pack) {
    console.warn(`⚠ Paquete ${paqueteId} no encontrado en index.json`);
    return;
  }

  const rutasIncluidas = pack.routes.filter(route =>
    rutasLista.includes(clean(route.short_name))
  );

  console.log(
    `Paquete ${paqueteId}: ${rutasIncluidas.length}/${pack.routes.length} rutas incluidas.`
  );
  if (rutasIncluidas.length) {
    console.log(`→ Coincidencias: ${rutasIncluidas.map(r => r.short_name).join(", ")}`);
  }

  if (rutasIncluidas.length > 0) {
    n3Packages.push({
      id: paqueteId,
      base: pack.base,
      carretera: "N3",
      routes: rutasIncluidas.map(r => ({
        ...r,
        carretera: "N3",
      })),
    });
  }
});

fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ packages: n3Packages }, null, 2), "utf8");
console.log(`✅ Índice N3 creado en ${OUTPUT_PATH}`);
