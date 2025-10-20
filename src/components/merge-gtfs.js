// scripts/merge-gtfs.js
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const Papa = require('papaparse');

const INPUT_ROOT = 'gtfs';        // aquí tienes tus subcarpetas /gtfs/folder1, /gtfs/folder2...
const OUTPUT_DIR = 'public/gtfs'; // salida final para que la app React siga funcionando

const FILES = [
  'agency.txt',
  'routes.txt',
  'calendar.txt',
  'calendar_dates.txt',
  'trips.txt',
  'shapes.txt',
  'stops.txt',
  'stop_times.txt',
  'feed_info.txt',
  'fare_attributes.txt',
  'fare_rules.txt',
  'frequencies.txt',
  'transfers.txt',
];

// qué campos hay que prefijar en cada fichero
function rewriteRow(file, row, prefix) {
  const r = { ...row };
  const p = (v) => (v ? `${prefix}${v}` : v);

  switch (file) {
    case 'agency.txt':
      if (r.agency_id) r.agency_id = p(r.agency_id);
      break;

    case 'routes.txt':
      if (r.route_id) r.route_id = p(r.route_id);
      if (r.agency_id) r.agency_id = p(r.agency_id);
      break;

    case 'trips.txt':
      if (r.trip_id) r.trip_id = p(r.trip_id);
      if (r.route_id) r.route_id = p(r.route_id);
      if (r.service_id) r.service_id = p(r.service_id);
      if (r.shape_id) r.shape_id = p(r.shape_id);
      break;

    case 'shapes.txt':
      if (r.shape_id) r.shape_id = p(r.shape_id);
      break;

    case 'stops.txt':
      if (r.stop_id) r.stop_id = p(r.stop_id);
      break;

    case 'stop_times.txt':
      if (r.trip_id) r.trip_id = p(r.trip_id);
      if (r.stop_id) r.stop_id = p(r.stop_id);
      break;

    case 'calendar.txt':
    case 'calendar_dates.txt':
      if (r.service_id) r.service_id = p(r.service_id);
      break;

    case 'fare_attributes.txt':
      if (r.fare_id) r.fare_id = p(r.fare_id);
      if (r.agency_id) r.agency_id = p(r.agency_id);
      break;

    case 'fare_rules.txt':
      if (r.fare_id) r.fare_id = p(r.fare_id);
      if (r.route_id) r.route_id = p(r.route_id);
      if (r.origin_id) r.origin_id = p(r.origin_id);
      if (r.destination_id) r.destination_id = p(r.destination_id);
      if (r.contains_id) r.contains_id = p(r.contains_id);
      break;

    case 'frequencies.txt':
      if (r.trip_id) r.trip_id = p(r.trip_id);
      break;

    case 'transfers.txt':
      if (r.from_stop_id) r.from_stop_id = p(r.from_stop_id);
      if (r.to_stop_id) r.to_stop_id = p(r.to_stop_id);
      break;
  }
  return r;
}

function readCsvSync(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
  return data.filter(row => Object.values(row).some(v => (v ?? '').toString().trim() !== ''));
}

async function writeCsv(filePath, rows) {
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
  if (!rows.length) {
    await fsp.writeFile(filePath, '');
    return;
  }
  // columnas unificadas
  const headers = Array.from(rows.reduce((set, r) => {
    Object.keys(r).forEach(k => set.add(k));
    return set;
  }, new Set()));
  const text = Papa.unparse(rows, { columns: headers });
  await fsp.writeFile(filePath, text, 'utf8');
}

function listSubfolders(dir) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => path.join(dir, d.name));
}

(async function main() {
  const feeds = listSubfolders(INPUT_ROOT);
  if (!feeds.length) {
    console.error(`No hay subcarpetas en ${INPUT_ROOT}. Mete ahí tus GTFS (folder1, folder2, ...)`);
    process.exit(1);
  }

  // acumuladores por fichero
  const merged = Object.fromEntries(FILES.map(f => [f, []]));

  for (const feedDir of feeds) {
    const prefix = path.basename(feedDir).replace(/\W+/g, '_') + '__';
    console.log(`\n▶ Procesando ${feedDir}  (prefijo: ${prefix})`);

    for (const file of FILES) {
      const src = path.join(feedDir, file);
      if (!fs.existsSync(src)) continue;

      const rows = readCsvSync(src);
      const rew = rows.map(r => rewriteRow(file, r, prefix));
      merged[file].push(...rew);
      console.log(`  + ${file}: ${rows.length} filas`);
    }
  }

  // escribir salida
  for (const file of FILES) {
    const out = path.join(OUTPUT_DIR, file);
    const rows = merged[file];
    console.log(`✍ Escribiendo ${out} (${rows.length} filas)`);
    await writeCsv(out, rows);
  }

  console.log(`\n✅ Listo. GTFS fusionado en ${OUTPUT_DIR}\n`);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
