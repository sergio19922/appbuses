// scripts/build-gtfs-index.js  (ESM)
import fs from 'fs-extra';
import path from 'path';
import fg from 'fast-glob';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');

// ✅ Carpeta donde están los GTFS
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

  // ✅ Buscar todos los paquetes en public/gtfs
  const files = await fg(['public/gtfs/*/routes.txt'], { cwd: ROOT, onlyFiles: true });
  console.log(`🧭 Archivos detectados: ${files.length}`);

  let packages = [];


  for (const rel of files) {
    console.log("📦 Paquetes iniciales detectados:", packages.map(p => p.id));

    console.log(`📦 Procesando archivo: ${rel}`);
    

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

    // Crear lista de rutas del paquete
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

    // Carretera especial para M607
    // Carretera especial para M607 y N5
// 🚦 Asignación de carreteras especiales (automática)
let carretera = '';

// M607
if (folder.toLowerCase().includes('colmenar') || folder.toLowerCase().includes('129')) {
  carretera = 'M607';
}

// N5 → si contiene rutas de la 580 a la 629 o N903/N907
const n5Rutas = [
  '580', '581',
  '620', '621', '622', '623', '624', '624A',
  '625', '626', '626A', '627', '628', '629',
  'N903', 'N907'
];
const paqueteRutas = routes.map(r => r.short_name);
if (paqueteRutas.some(r => n5Rutas.includes(r))) {
  carretera = 'N5';
}



    packages.push({ id: folder, base, carretera, routes });
    if (routes.some(r => /^(15[1-9]|16[0-9]|17[0-9]|18[0-9]|19[0-9])$/.test(r.short_name))) {
  console.log(`🟢 Paquete ${folder} contiene rutas 151–199:`, routes.map(r => r.short_name));
}

  }

  // 🧹 FILTRAR paquetes no deseados del index principal
const excluirIds = ["circularverde", "elrellano", "zarzalejo"]; // agrega aquí los que quieras ocultar
packages = packages.filter(pkg => !excluirIds.includes(pkg.id.toLowerCase()));


  // 🔹 DEBUG opcional
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

  // 🔹 Añadir carretera N2 virtual (rutas agrupadas)
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
  

    // 🧭 Forzar la línea 161 dentro de la carretera N1
  packages = packages.map(p => {
    if (p.id === "161" || (p.routes || []).some(r => r.short_name === "161")) {
      console.log("✅ Línea 161 detectada y marcada como N1");
      return {
        ...p,
        carretera: "N1",
        routes: (p.routes || []).map(r => ({
          ...r,
          carretera: "N1",
          color: "A8E05F",
          long_name: "Madrid-Alcobendas-SS Reyes-Urbanizacion Fuente del Fresno"
        }))
      };
    }
    return p;
  });


    // 🧭 Forzar la línea 720 dentro de la carretera M607
  // 🧭 Forzar la línea 720 dentro de la carretera M607 (solo la buena)
// 🧹 Eliminar completamente la 720 mala (sin shape) y mantener solo la buena
packages = packages
  .map(p => {
    if (p.id === "720" || (p.routes || []).some(r => r.short_name === "720")) {
      const rutasValidas = (p.routes || []).filter(
        r => r.short_name === "720" && r.hasShape
      );

      if (rutasValidas.length > 0) {
        console.log("✅ Línea 720 buena detectada y marcada como M607");
        return {
          ...p,
          carretera: "M607",
          routes: rutasValidas.map(r => ({
            ...r,
            carretera: "M607",
            color: "A8E05F", // 💚 verde claro (mismo tono que el resto de M607)
            long_name: "Colmenar Viejo - Collado Villalba"
          }))
        };
      }

      // 🚨 Si no tiene rutas válidas, eliminar el paquete por completo
      return null;
    }

    return p;
  })
  .filter(Boolean);

  // 🧭 Forzar la línea 722 dentro de la carretera M607
packages = packages.map(p => {
  if (p.id === "722" || (p.routes || []).some(r => r.short_name === "722")) {
    console.log("✅ Línea 722 detectada y marcada como M607");
    return {
      ...p,
      carretera: "M607",
      routes: (p.routes || []).map(r => ({
        ...r,
        carretera: "M607",
        color: "00843D", // 💚 verde CRTM interurbano
        long_name:
          "Madrid (Plaza de Castilla) - Moralzarzal - Los Molinos - Cercedilla"
      }))
    };
  }
  return p;
});

// 🧭 Forzar la línea 725 dentro de la carretera M607
packages = packages.map(p => {
  if (p.id === "725" || (p.routes || []).some(r => r.short_name === "725")) {
    console.log("✅ Línea 725 detectada y marcada como M607");
    return {
      ...p,
      carretera: "M607",
      routes: (p.routes || []).map(r => ({
        ...r,
        carretera: "M607",
        color: "00843D", // 💚 verde CRTM interurbano
        long_name: "Miraflores - Colmenar Viejo"
      }))
    };
  }
  return p;
});



    // 🛣️ Asignar automáticamente las interurbanas 151–199 a la carretera N1
// 🧱 Asegurar que paquete_001 no se pierda por ningún map/filter
if (!packages.some(p => p.id === "paquete_001")) {
  console.warn("⚠️ paquete_001 se perdió tras el procesado. Reinyectando manualmente...");

  const absPath = path.join(GTFS_DIR, "paquete_001", "routes.txt");
  if (await fs.pathExists(absPath)) {
    const text = await fs.readFile(absPath, "utf8");
    const rows = await parseCSV(text);
    const routes = rows.map(r => ({
      route_id: r.route_id,
      short_name: (r.route_short_name || "").trim(),
      long_name: (r.route_long_name || "").trim(),
      color: "A8E05F", // 💚 verde claro
      hasShape: true,
      carretera: "N1",
    }));
    packages.push({
      id: "paquete_001",
      base: "/gtfs/paquete_001",
      carretera: "N1",
      routes,
    });
    console.log("✅ paquete_001 reinsertado con", routes.length, "rutas");
  } else {
    console.error("❌ No se encontró public/gtfs/paquete_001/routes.txt");
  }
}

// 🟢 Forzar Miraflores dentro de la carretera N4




  



  // ✅ Guardar índice principal
  await fs.writeJson(
    OUT,
    { generatedAt: new Date().toISOString(), packages },
    { spaces: 2 }
  );
  console.log(`\n✅ Índice GTFS creado en ${OUT} con ${packages.length} paquetes`);

  // 🚀 Generar automáticamente el índice N5
  console.log('\n🚀 Generando automáticamente el índice N5...');

  const n5Targets = [
    '580', '581',
    '620', '621', '622', '623', '624', '624A',
    '625', '626', '626A', '627', '628', '629',
    'N903', 'N907'
  ];

  const n5Packages = packages
    .map(pkg => ({
      id: pkg.id,
      base: pkg.base,
      carretera: 'N5',
      routes: pkg.routes.filter(r => n5Targets.includes(r.short_name))
    }))
    .filter(pkg => pkg.routes.length > 0);

  const OUT_N5 = path.join(GTFS_DIR, 'index-n5.json');
  await fs.writeJson(
    OUT_N5,
    { generatedAt: new Date().toISOString(), packages: n5Packages },
    { spaces: 2 }
  );
  // 🚀 Generar automáticamente el índice N4
console.log('\n🚀 Generando automáticamente el índice N4...');

const rutasN4 = {
  paquete_024: ["421", "422", "423", "424", "425", "426", "427", "428"],
  sueltos: [
    // Interurbanas reales
    "161",
    "402",

    // Urbanas Fuenlabrada y Leganés
    "fuenlabrada1",
    "fuenlabrada2",
    "fuenlabrada3",
    "fuenlabrada4",
    "fuenlabrada6",
    "fuenlabrada13",
    "fuenlabradacentral",
    "circular-roja",
    "cementerio",
    "loranca",
    "miraflores",
    "leganes1"
  ]
};


const n4Packages = [];

for (const pkg of packages) {
  const pkgId = pkg.id.trim().toLowerCase();

  // 🟩 Paquete 024 con varias rutas específicas
  if (pkgId === "paquete_024") {
    const rutasObjetivo = rutasN4["paquete_024"];
    const filtradas = pkg.routes.filter(r =>
      rutasObjetivo.includes(r.short_name)
    );
    n4Packages.push({
      ...pkg,
      carretera: "N4",
      routes: filtradas.map(r => ({
        ...r,
        carretera: "N4",
        color: r.color || "00843D",
        hasShape: true
      }))
    });
    console.log(`🟢 Añadido paquete_024 con rutas ${filtradas.map(r => r.short_name).join(', ')}`);
    continue;
  }

  // 🟢 Paquetes sueltos
  if (rutasN4.sueltos.some(s => pkgId.includes(s.toLowerCase()))) {
    n4Packages.push({
      ...pkg,
      carretera: "N4",
      routes: (pkg.routes || []).map(r => ({
        ...r,
        carretera: "N4",
        color: r.color || "00843D",
        hasShape: true
      }))
    });
    console.log(`🟢 Añadido paquete suelto: ${pkg.id}`);
  }
}

// ⚙️ Inclusión manual de circular-roja si no está
if (!n4Packages.some(p => p.id === "circular-roja")) {
  n4Packages.push({
    id: "circular-roja",
    base: "/gtfs/circular-roja",
    carretera: "N4",
    routes: [
      {
        route_id: "1",
        short_name: "Circular Roja",
        long_name: "Fuenlabrada - Circular Roja",
        color: "E60003",
        hasShape: true,
        carretera: "N4"
      }
    ]
  });
  console.log("⚙️ Añadida circular-roja manualmente.");
}

// 💾   Guardar index-n4.json
const OUT_N4 = path.join(GTFS_DIR, 'index-n4.json');
await fs.writeJson(
  OUT_N4,
  { generatedAt: new Date().toISOString(), packages: n4Packages },
  { spaces: 2 }
);

console.log(`✅ Índice N4 creado automáticamente en ${OUT_N4} con ${n4Packages.length} paquetes`);

  console.log(`✅ Índice N5 creado automáticamente en ${OUT_N5} con ${n5Packages.length} paquetes`);
})();

