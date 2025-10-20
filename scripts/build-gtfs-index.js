// scripts/build-gtfs-index.js  (ESM)
import fs from 'fs-extra';
import path from 'path';
import fg from 'fast-glob';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const GTFS_DIR = path.join(ROOT, 'public', 'gtfs');
const OUT = path.join(GTFS_DIR, 'index.json');

async function parseCSV(text) {
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
  return data;
}

function normId(id) {
  return id.toString().trim().toLowerCase();
}

function normShortName(s) {
  if (!s) return '';
  return s.toString().trim().toUpperCase().replace(/\s+/g, '');
}

(async () => {
  await fs.ensureDir(GTFS_DIR);

  const files = await fg(['public/gtfs/*/routes.txt'], { cwd: ROOT, onlyFiles: true });
  const packages = [];

  for (const rel of files) {
    const absRoutes = path.join(ROOT, rel);
    const folder = path.basename(path.dirname(absRoutes));
    const base = `/gtfs/${folder}`;

    const routesText = await fs.readFile(absRoutes, 'utf8');
    const routesRows = await parseCSV(routesText);

    // paths
    const pkgDir = path.dirname(absRoutes);
    const tripsPath = path.join(pkgDir, 'trips.txt');
    const shapesPath = path.join(pkgDir, 'shapes.txt');

    // trips.txt
    let tripsRows = [];
    const tripsExists = await fs.pathExists(tripsPath);
    if (tripsExists) {
      const tripsText = await fs.readFile(tripsPath, 'utf8');
      tripsRows = await parseCSV(tripsText);
    }

    // shapes.txt
    let shapesRows = [];
    const shapesExists = await fs.pathExists(shapesPath);
    if (shapesExists) {
      const shapesText = await fs.readFile(shapesPath, 'utf8');
      shapesRows = await parseCSV(shapesText);
    }

    // Mapa de route_id -> short_name
    const routeIdToShort = new Map();
    for (const r of routesRows) {
      routeIdToShort.set(normId(r.route_id || ''), normShortName(r.route_short_name));
    }

    // Precrear set de shape_id normalizados
    const shapeIdsSet = new Set(shapesRows.map(s => normId(s.shape_id || '')));

    // short_names con shape
    const shortNamesWithShape = new Set();
    for (const t of tripsRows) {
      const tid = normId(t.route_id || '');
      const sname = routeIdToShort.get(tid);
      if (!sname) continue;

      const normTripShape = normId(t.shape_id || '');
      if (!normTripShape) continue;

      const hasPoints = shapeIdsSet.has(normTripShape);
      if (hasPoints) shortNamesWithShape.add(sname);
    }

    const routes = routesRows.map(r => {
      const sn = normShortName(r.route_short_name);
      const hasShape = shortNamesWithShape.has(sn);
      return {
        route_id: r.route_id,
        short_name: (r.route_short_name || '').trim(),
        long_name: (r.route_long_name || '').trim(),
        color: (r.route_color || '').trim(),
        hasShape
      };
    });

    // Carretera para M607
    let carretera = '';
    if (folder.toLowerCase().includes('colmenar') || folder.toLowerCase().includes('129')) {
      carretera = 'M607';
    }

    packages.push({ id: folder, base, carretera, routes });
  }

  // 🔹 DEBUG: Mostrar todas las rutas de los paquetes clave
  const debugIds = ['0_76', '180', '009'];
  for (const pkgId of debugIds) {
    const pkg = packages.find(p => p.id === pkgId);
    if (pkg) {
      console.log(`\n📦 Paquete ${pkgId} contiene las rutas:`);
      pkg.routes.forEach(r => {
        console.log(`  - ${r.short_name}`);
      });
    }
  }

  // 🔹 Añadir carretera N2 con rutas específicas
  const n2Targets = {
    '0_76': ['1A', '002', '003', '004', '5A', '006'],
    '180': [
      '210', '211', '212', '213', '215', '220', '222', '223', '224', '224A',
      '226', '227', '229', '231', '232', '250', '251', '252', '254', '255', '256'
    ],
    '009': ['260', '261']
  };

  const n2Routes = [];
  for (const [pkgId, shortNames] of Object.entries(n2Targets)) {
    const pkg = packages.find(p => p.id === pkgId);
    if (pkg) {
      const filtered = pkg.routes.filter(r =>
        shortNames.includes(normShortName(r.short_name))
      );
      n2Routes.push(...filtered);
    }
  }

  if (n2Routes.length > 0) {
    packages.push({
      id: 'N2_virtual',
      base: '',
      carretera: 'N2',
      routes: n2Routes
    });
  }

  await fs.writeJson(
    OUT,
    { generatedAt: new Date().toISOString(), packages },
    { spaces: 2 }
  );
  console.log(`\n✓ Índice GTFS creado en ${OUT} con ${packages.length} paquetes`);
})();
