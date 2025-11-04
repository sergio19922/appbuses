// scripts/build-gtfs-prepared.js
import fs from "fs-extra";
import path from "path";
import Papa from "papaparse";

// 🏗 Directorios base
const GTFS_DIR = path.join("public", "gtfs");
const OUT_DIR = path.join("public", "gtfs_prepared");

// 🧰 Función auxiliar
async function parseCSV(filePath) {
  const text = await fs.readFile(filePath, "utf8");
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
  return data;
}

// ✳️ Normalizador
const norm = (s) => (s ? s.toString().trim() : "");

// 🚀 Script principal
(async () => {
  console.log("🧭 Preparando GTFS JSONs...");

  const paquetes = await fs.readdir(GTFS_DIR);

  for (const paquete of paquetes) {
    const pkgDir = path.join(GTFS_DIR, paquete);
    const stats = await fs.stat(pkgDir);
    if (!stats.isDirectory()) continue;

    const outDir = path.join(OUT_DIR, paquete);
    await fs.ensureDir(outDir);
    await fs.ensureDir(path.join(outDir, "shapes"));

    const routesPath = path.join(pkgDir, "routes.txt");
    const tripsPath = path.join(pkgDir, "trips.txt");
    const shapesPath = path.join(pkgDir, "shapes.txt");

    if (!(await fs.pathExists(routesPath)) || !(await fs.pathExists(tripsPath))) {
      console.warn(`⚠️  Saltando ${paquete}: faltan routes.txt o trips.txt`);
      continue;
    }

    console.log(`📦 Procesando paquete: ${paquete}`);

    // Leer los CSV
    const routes = await parseCSV(routesPath);
    const trips = await parseCSV(tripsPath);
    const shapes = (await fs.pathExists(shapesPath)) ? await parseCSV(shapesPath) : [];

    // Crear route_to_shape.json
    const routeToShape = {};
    for (const trip of trips) {
      if (trip.route_id && trip.shape_id) {
        routeToShape[norm(trip.route_id)] = norm(trip.shape_id);
      }
    }

    // Crear short_to_route.json
    const shortToRoute = {};
    for (const r of routes) {
      if (r.route_short_name && r.route_id) {
        shortToRoute[norm(r.route_short_name)] = norm(r.route_id);
      }
    }

    await fs.writeJson(path.join(outDir, "route_to_shape.json"), routeToShape, { spaces: 2 });
    await fs.writeJson(path.join(outDir, "short_to_route.json"), shortToRoute, { spaces: 2 });

    // Crear los shapes individuales
    const groupedShapes = {};
    for (const s of shapes) {
      const sid = norm(s.shape_id);
      if (!sid) continue;
      if (!groupedShapes[sid]) groupedShapes[sid] = [];
      groupedShapes[sid].push([
        parseFloat(s.shape_pt_lat),
        parseFloat(s.shape_pt_lon)
      ]);
    }

    for (const [sid, coords] of Object.entries(groupedShapes)) {
      await fs.writeJson(
        path.join(outDir, "shapes", `${sid}.json`),
        { shape_id: sid, coords },
        { spaces: 2 }
      );
    }

    console.log(`✅ ${paquete}: ${Object.keys(routeToShape).length} rutas, ${Object.keys(groupedShapes).length} shapes.`);
  }

  console.log("\n🎉 GTFS preparado correctamente en /public/gtfs_prepared/");
})();
