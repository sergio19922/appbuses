// scripts/build-gtfs-circular-roja.js
import fs from "fs";
import path from "path";

// Directorio de salida
const outputDir = path.join("public", "gtfs", "circular-roja");
fs.mkdirSync(outputDir, { recursive: true });

// ===================== PARADAS =====================
const stops = [
  { id: 1, name: "Barrio El Naranjo (Galicia)", lat: 40.29525, lon: -3.81256 },
  { id: 2, name: "Almendro (C.C. Nexum)", lat: 40.2876, lon: -3.8001 },
  { id: 3, name: "Móstoles", lat: 40.2903, lon: -3.805 },
  { id: 4, name: "Av. Naciones", lat: 40.2869, lon: -3.8035 },
  { id: 5, name: "C.° Molino", lat: 40.285, lon: -3.801 },
  { id: 6, name: "Portugal", lat: 40.2835, lon: -3.7995 },
  { id: 7, name: "Av. Andes", lat: 40.282, lon: -3.798 },
  { id: 8, name: "Av. España", lat: 40.281, lon: -3.797 },
  { id: 9, name: "Castilla La Vieja", lat: 40.28, lon: -3.796 },
  { id: 10, name: "Avilés", lat: 40.279, lon: -3.795 },
  { id: 11, name: "Av. Estados", lat: 40.278, lon: -3.794 },
  { id: 12, name: "Brasil", lat: 40.277, lon: -3.793 },
  { id: 13, name: "Av. Fco. Sauquillo", lat: 40.276, lon: -3.792 },
  { id: 14, name: "Av. Fco. J. Sauquillo", lat: 40.275, lon: -3.791 },
  { id: 15, name: "Móstoles", lat: 40.274, lon: -3.79 },
  { id: 16, name: "Luis Sauquillo", lat: 40.273, lon: -3.789 },
  { id: 17, name: "Panaderas", lat: 40.272, lon: -3.788 },
  { id: 18, name: "Com. Madrid", lat: 40.271, lon: -3.787 },
  { id: 19, name: "Parque de los Estados", lat: 40.27, lon: -3.786 },
  { id: 20, name: "La Serna", lat: 40.269, lon: -3.785 },
  { id: 21, name: "Hospital de Europa (Metro)", lat: 40.268, lon: -3.784 },
  { id: 22, name: "Parque Europa (Metro)", lat: 40.267, lon: -3.783 },
  { id: 23, name: "Fuenlabrada Central (Metro)", lat: 40.266, lon: -3.782 }
];

// ===================== STOPS.TXT =====================
const stopsTxt = [
  "stop_id,stop_name,stop_lat,stop_lon",
  ...stops.map(s => `${s.id},${s.name},${s.lat},${s.lon}`)
].join("\n");
fs.writeFileSync(path.join(outputDir, "stops.txt"), stopsTxt, "utf8");

// ===================== SHAPES.TXT =====================
const shapeId = "CIRCULAR3";
const shapesTxt = [
  "shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence",
  ...stops.map((s, i) => `${shapeId},${s.lat},${s.lon},${i + 1}`)
].join("\n");
fs.writeFileSync(path.join(outputDir, "shapes.txt"), shapesTxt, "utf8");

// ===================== ROUTES.TXT =====================
const routesTxt =
  "route_id,agency_id,route_short_name,route_long_name,route_type\n" +
  "CIRCULAR3,AGENCY1,L3,Circular Roja,3";
fs.writeFileSync(path.join(outputDir, "routes.txt"), routesTxt, "utf8");

// ===================== TRIPS.TXT =====================
const trips = [
  { trip_id: "CIRCULAR3_TRIP1", startHour: 6, startMinute: 0 },
  { trip_id: "CIRCULAR3_TRIP2", startHour: 8, startMinute: 0 }
];
const tripsTxt = [
  "route_id,service_id,trip_id,shape_id",
  ...trips.map(t => `CIRCULAR3,WD,${t.trip_id},${shapeId}`)
].join("\n");
fs.writeFileSync(path.join(outputDir, "trips.txt"), tripsTxt, "utf8");

// ===================== STOP_TIMES.TXT =====================
function generateStopTimes(tripId, startHour, startMinute) {
  const rows = [];
  let h = startHour, m = startMinute;
  stops.forEach((s, idx) => {
    const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
    rows.push(`${tripId},${time},${time},${s.id},${idx + 1}`);
    m += 5; if (m >= 60) { h++; m -= 60; }
  });
  return rows;
}
const stopTimesTxt = [
  "trip_id,arrival_time,departure_time,stop_id,stop_sequence",
  ...trips.flatMap(t => generateStopTimes(t.trip_id, t.startHour, t.startMinute))
].join("\n");
fs.writeFileSync(path.join(outputDir, "stop_times.txt"), stopTimesTxt, "utf8");

console.log("✅ GTFS completo generado en", outputDir);
