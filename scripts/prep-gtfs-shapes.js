// scripts/prep-gtfs-shapes.js
// ESM
import fs from 'fs-extra';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const GTFS_DIR = path.join(ROOT, 'public', 'gtfs');
const OUT_DIR  = path.join(ROOT, 'public', 'gtfs_prepared'); // 👈 salida correcta

async function parseCSV(text) {
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
  return data;
}

async function prepPack(folder) {
  const baseIn  = path.join(GTFS_DIR, folder);
  const baseOut = path.join(OUT_DIR, folder); // 👈 en prepared
  await fs.ensureDir(path.join(baseOut, 'shapes'));

  const trips = await parseCSV(await fs.readFile(path.join(baseIn, 'trips.txt'), 'utf8'));
  const shapes = await parseCSV(await fs.readFile(path.join(baseIn, 'shapes.txt'), 'utf8'));
  const routes = await parseCSV(await fs.readFile(path.join(baseIn, 'routes.txt'), 'utf8'));

  // 1) Elegimos 1 shape "principal" por route_id (el más largo)
  const tripsByRoute = new Map();
  for (const t of trips) {
    if (!t.shape_id) continue;
    const list = tripsByRoute.get(t.route_id) || [];
    list.push(t.shape_id);
    tripsByRoute.set(t.route_id, list);
  }

  // Preindex shapes por shape_id
  const pointsByShape = new Map();
  for (const s of shapes) {
    const sid = s.shape_id;
    if (!sid) continue;
    const arr = pointsByShape.get(sid) || [];
    arr.push([Number(s.shape_pt_lat), Number(s.shape_pt_lon), Number(s.shape_pt_sequence)]);
    pointsByShape.set(sid, arr);
  }

  // Ordena y guarda cada shape en JSON una vez
  const shapeLen = new Map();
  for (const [sid, pts] of pointsByShape) {
    pts.sort((a,b) => a[2]-b[2]);
    const line = pts.map(([lat, lon]) => [lat, lon]);
    shapeLen.set(sid, line.length);
    await fs.writeJson(path.join(baseOut, 'shapes', `${sid}.json`), { coords: line });
  }

  // Mapa route_id -> best shape_id
  const routeToShape = {};
  for (const [rid, arr] of tripsByRoute) {
    const uniq = [...new Set(arr)];
    let best = uniq[0], bestLen = -1;
    for (const sid of uniq) {
      const len = shapeLen.get(sid) || 0;
      if (len > bestLen) { best = sid; bestLen = len; }
    }
    routeToShape[rid] = best;
  }

  // Mapa short_name -> route_id
  const shortToRoute = {};
  for (const r of routes) {
    const sn = String(r.route_short_name || '').trim();
    if (sn) shortToRoute[sn] = r.route_id;
  }

  // Guardamos en prepared
  await fs.writeJson(path.join(baseOut, 'route_to_shape.json'), routeToShape, { spaces: 0 });
  await fs.writeJson(path.join(baseOut, 'short_to_route.json'), shortToRoute, { spaces: 0 });

  console.log(`✓ ${folder}: ${pointsByShape.size} shapes -> JSON, routes: ${Object.keys(routeToShape).length}`);
}

(async () => {
  const packs = (await fs.readdir(GTFS_DIR)).filter(f => fs.existsSync(path.join(GTFS_DIR,f,'shapes.txt')));
  for (const folder of packs) await prepPack(folder);
  console.log('Listo: public/gtfs_prepared/*'); // 👈
})();
