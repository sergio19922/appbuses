// scripts/prepare-gtfs-debug.js
import fs from 'fs-extra';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const GTFS_DIR = path.join(ROOT, 'public', 'gtfs');
const OUT_DIR  = path.join(ROOT, 'public', 'gtfs_prepared');

async function parseCSV(text) {
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
  return data;
}

async function prepPack(folder) {
  console.log(`📦 Preparando paquete: ${folder}`);
  const baseIn  = path.join(GTFS_DIR, folder);
  const baseOut = path.join(OUT_DIR, folder);
  await fs.ensureDir(path.join(baseOut, 'shapes'));

  const trips  = await parseCSV(await fs.readFile(path.join(baseIn, 'trips.txt'), 'utf8'));
  const shapes = await parseCSV(await fs.readFile(path.join(baseIn, 'shapes.txt'), 'utf8'));
  const routes = await parseCSV(await fs.readFile(path.join(baseIn, 'routes.txt'), 'utf8'));

  console.log(`  → trips: ${trips.length}, shapes: ${shapes.length}, routes: ${routes.length}`);

  // 1) Agrupar trips por route_id
  const tripsByRoute = new Map();
  for (const t of trips) {
    if (!t.shape_id) continue;
    const list = tripsByRoute.get(t.route_id) || [];
    list.push(t.shape_id);
    tripsByRoute.set(t.route_id, list);
  }
  console.log(`  → tripsByRoute: ${tripsByRoute.size} rutas con shape`);

  // 2) Agrupar puntos de shape
  const pointsByShape = new Map();
  for (const s of shapes) {
    const sid = s.shape_id;
    if (!sid) continue;
    const arr = pointsByShape.get(sid) || [];
    arr.push([Number(s.shape_pt_lat), Number(s.shape_pt_lon), Number(s.shape_pt_sequence)]);
    pointsByShape.set(sid, arr);
  }
  console.log(`  → pointsByShape: ${pointsByShape.size} shapes detectados`);

  // 3) Ordenar y guardar shapes
  const shapeLen = new Map();
  for (const [sid, pts] of pointsByShape) {
    pts.sort((a,b) => a[2]-b[2]);
    const line = pts.map(([lat, lon]) => [lat, lon]);
    shapeLen.set(sid, line.length);
    await fs.writeJson(path.join(baseOut, 'shapes', `${sid}.json`), { coords: line });
    console.log(`    ✓ Shape ${sid}: ${line.length} puntos`);
  }

  // 4) Elegir shape principal por route
  const routeToShape = {};
  for (const [rid, arr] of tripsByRoute) {
    const uniq = [...new Set(arr)];
    let best = uniq[0], bestLen = -1;
    for (const sid of uniq) {
      const len = shapeLen.get(sid) || 0;
      if (len > bestLen) { best = sid; bestLen = len; }
    }
    routeToShape[rid] = best;
    console.log(`    → route_id=${rid} usa shape=${best} (${shapeLen.get(best)} puntos)`);
  }

  // 5) Mapa short_name -> route_id
const shortToRoute = {};
  for (const r of routes) {
    const sn = String(r.route_short_name || '').trim();
    if (sn) shortToRoute[sn] = r.route_id;
  }

  // 🚍 Inyección manual: Línea 2 Monte Rozas - El Encinar
  if (folder === "paquete_026") {
    // id real que viene en routes.txt
    const oficialId = "9__2__127_";

    if (!shortToRoute["2"]) {
      shortToRoute["2"] = oficialId;
      console.log("⚡ Mapeada short_name=2 ->", oficialId);
    }
  }

  await fs.writeJson(path.join(baseOut, 'route_to_shape.json'), routeToShape, { spaces: 0 });
  await fs.writeJson(path.join(baseOut, 'short_to_route.json'), shortToRoute, { spaces: 0 });

  console.log(`✅ ${folder}: shapes procesados y mapas guardados`);
}
