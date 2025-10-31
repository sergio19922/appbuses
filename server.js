import express from 'express';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

// =======================================================
// 🧩 Función para crear carpeta y escribir archivo
// =======================================================
function ensureDirAndWrite(folder, filename, content) {
  const folderPath = path.join('public', 'gtfs', folder);
  fs.mkdirSync(folderPath, { recursive: true });
  const filePath = path.join(folderPath, filename);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Guardado: ${filePath}`);
}

// =======================================================
// 🟢 1️⃣ GUARDAR SHAPE Y AUTOGENERAR ESTRUCTURA COMPLETA
// =======================================================
app.post('/guardar_shape', (req, res) => {
  try {
    const {
      nombreArchivo,
      data,
      shape_id = 'SHAPE_001',
      route_id = '1',
      short_name = '1',
      long_name = '',
      color = 'FF7F00'
    } = req.body;

    if (!nombreArchivo) return res.status(400).json({ error: "Falta nombreArchivo" });
    if (!data || !Array.isArray(data) || data.length === 0)
      return res.status(400).json({ error: "Data no válida o vacía" });

    const folder = path.join('public', 'gtfs', nombreArchivo);
    fs.mkdirSync(folder, { recursive: true });

    // === shapes.txt ===
    const shapes = [
      'shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence',
      ...data.map((p, i) => [shape_id, p.lat, p.lng, i + 1].join(','))
    ].join('\n') + '\n';
    ensureDirAndWrite(nombreArchivo, 'shapes.txt', shapes);

    // === routes.txt === ✅ (corregido y mejorado)
    const routeLongName = long_name || `Línea ${short_name}`;
    const routes = [
      'route_id,route_short_name,route_long_name,route_color',
      `${route_id},${short_name},${routeLongName},${color}`
    ].join('\n') + '\n';
    ensureDirAndWrite(nombreArchivo, 'routes.txt', routes);

    // === trips.txt ===
    const trips = [
      'route_id,service_id,trip_id,shape_id',
      `${route_id},WEEKDAY,TRIP_${shape_id},${shape_id}`
    ].join('\n') + '\n';
    ensureDirAndWrite(nombreArchivo, 'trips.txt', trips);

    // === stops.txt ===
    const stops = 'stop_id,stop_name,stop_lat,stop_lon\nSTOP_1,STOP_1,0,0\n';
    ensureDirAndWrite(nombreArchivo, 'stops.txt', stops);

    // === stop_times.txt ===
    const stopTimes =
      'trip_id,arrival_time,departure_time,stop_id,stop_sequence\n' +
      `TRIP_${shape_id},08:00:00,08:00:00,STOP_1,1\n`;
    ensureDirAndWrite(nombreArchivo, 'stop_times.txt', stopTimes);

    console.log(`✅ Estructura completa GTFS generada en /public/gtfs/${nombreArchivo}`);
    res.json({ ok: true });
  } catch (err) {
    console.error("❌ Error en /guardar_shape:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================================================
// 🟠 2️⃣ GUARDAR PARADAS (stops.txt)
// =======================================================
app.post('/guardar_stops', (req, res) => {
  try {
    const { nombreArchivo, data } = req.body;
    if (!nombreArchivo) return res.status(400).json({ error: "Falta nombreArchivo" });
    if (!data || !Array.isArray(data))
      return res.status(400).json({ error: "Data no válida o vacía" });

    const stops = [
      'stop_id,stop_name,stop_lat,stop_lon',
      ...data.map(s => [s.stop_id, s.stop_name, s.lat, s.lon].join(','))
    ].join('\n') + '\n';

    ensureDirAndWrite(nombreArchivo, 'stops.txt', stops);
    res.json({ ok: true });
  } catch (err) {
    console.error("❌ Error en /guardar_stops:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================================================
// 🔵 3️⃣ GUARDAR TRIPS (trips.txt)
// =======================================================
app.post('/guardar_trips', (req, res) => {
  try {
    const { nombreArchivo, data } = req.body;
    if (!nombreArchivo) return res.status(400).json({ error: "Falta nombreArchivo" });
    if (!data || !Array.isArray(data))
      return res.status(400).json({ error: "Data no válida o vacía" });

    const trips = [
      'route_id,service_id,trip_id,shape_id',
      ...data.map(t => [t.route_id, t.service_id, t.trip_id, t.shape_id].join(','))
    ].join('\n') + '\n';

    ensureDirAndWrite(nombreArchivo, 'trips.txt', trips);
    res.json({ ok: true });
  } catch (err) {
    console.error("❌ Error en /guardar_trips:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================================================
// 🟣 4️⃣ GUARDAR STOP_TIMES (stop_times.txt)
// =======================================================
app.post('/guardar_stop_times', (req, res) => {
  try {
    const { nombreArchivo, data } = req.body;
    if (!nombreArchivo) return res.status(400).json({ error: "Falta nombreArchivo" });
    if (!data || !Array.isArray(data))
      return res.status(400).json({ error: "Data no válida o vacía" });

    const stopTimes = [
      'trip_id,arrival_time,departure_time,stop_id,stop_sequence',
      ...data.map(s =>
        [s.trip_id, s.arrival_time, s.departure_time, s.stop_id, s.stop_sequence].join(',')
      )
    ].join('\n') + '\n';

    ensureDirAndWrite(nombreArchivo, 'stop_times.txt', stopTimes);
    res.json({ ok: true });
  } catch (err) {
    console.error("❌ Error en /guardar_stop_times:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================================================
// 🚀 Servidor en marcha
// =======================================================
app.listen(3000, () => {
  console.log('🚀 Servidor en marcha en http://localhost:3000');
});
