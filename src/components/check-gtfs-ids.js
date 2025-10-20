// check-gtfs-ids.js
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const rootDir = './gtfs'; // Carpeta raíz donde tienes las subcarpetas GTFS
const filesToCheck = ['routes.txt', 'trips.txt', 'shapes.txt', 'stops.txt', 'stop_times.txt'];

const idFields = {
  'routes.txt': 'route_id',
  'trips.txt': 'trip_id',
  'shapes.txt': 'shape_id',
  'stops.txt': 'stop_id',
  'stop_times.txt': 'trip_id'
};

function readCSV(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
  return data;
}

let allIds = {};

filesToCheck.forEach(fileName => {
  allIds[fileName] = new Set();
});

function scanDir(dir) {
  filesToCheck.forEach(fileName => {
    const filePath = path.join(dir, fileName);
    if (fs.existsSync(filePath)) {
      const rows = readCSV(filePath);
      const idField = idFields[fileName];
      rows.forEach(row => {
        const id = row[idField];
        if (id) {
          if (allIds[fileName].has(id)) {
            console.log(`⚠️ ID duplicado en ${fileName}: ${id} (en carpeta ${dir})`);
          } else {
            allIds[fileName].add(id);
          }
        }
      });
    }
  });
}

function scanFolders(baseDir) {
  const entries = fs.readdirSync(baseDir, { withFileTypes: true });
  entries.forEach(entry => {
    const fullPath = path.join(baseDir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
      scanFolders(fullPath);
    }
  });
}

console.log(`🔍 Buscando colisiones de IDs en GTFS desde ${rootDir}...\n`);
scanFolders(rootDir);
console.log('\n✅ Comprobación completada.');
