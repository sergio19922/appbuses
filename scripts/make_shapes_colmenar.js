// node scripts/gtfs/make_shapes_colmenar.js
// Genera public/gtfs/colmenar/shapes.txt consultando Nominatim (OSM).
// Requisitos: Node 18+ (fetch nativo). Respeta rate-limit con pequeñas pausas.

import fs from "node:fs/promises";

const OUTPUT = "public/gtfs/colmenar/shapes.txt";

// ===== zona de búsqueda aprox Colmenar Viejo (para mejorar aciertos) =====
const BBOX = {
  minLon: -3.85, minLat: 40.61,
  maxLon: -3.69, maxLat: 40.71,
};

// ==== helpers para normalizar nombres y generar variantes ====
function sanitize(name) {
  return name.replace(/\(.*?\)/g, "").replace(/\s+/g, " ").trim();
}

function variantsFor(name) {
  const base = sanitize(name);

  const aliases = new Set([base]);
  aliases.add(base.replace(/^Avenida\b/i, "Av"));
  aliases.add(base.replace(/^Av\b\.?/i, "Avenida"));
  aliases.add(base.replace(/^Calle\b/i, "C"));
  aliases.add(base.replace(/^C\b\.?/i, "Calle"));
  aliases.add(base.replace(/^Paseo\b/i, "Pº"));
  aliases.add(base.replace(/Crist[oó]bal/gi, "Cristobal"));
  aliases.add(base.replace(/Doctor/gi, "Dr"));
  aliases.add(base.replace(/San Sebasti[aá]n/gi, "San Sebastian"));

  const qs = [];
  for (const a of aliases) {
    qs.push(`${a}, Colmenar Viejo, Madrid`);
    qs.push(`${a}, Colmenar Viejo`);
    qs.push(`${a}, 28770 Colmenar Viejo`);
  }
  return qs;
}

// ==== 1) Define las paradas (ordenadas) por línea ====
// Circular (L-1) y un trazado único para todas las interurbanas
const LINES_BASE = {
  CIR1: [
    "Estación de Colmenar Viejo",
    "Paseo de la Estación",
    "Paseo de la Magdalena",
    "Calle del Ejidillo",
    "Calle de la Soledad",
    "Calle del Doctor de la Morena",
    "Avenida de la Libertad",
    "Calle de San Sebastián",
    "Calle de la Corredera",
    "Calle de Zurbarán",
    "Calle de la Dehesa",
    "Avenida de Cristóbal Colón",
    "Paseo de la Estación",
  ],
  // Trazado común interurbanas
  INTER: [
    "Estación de Colmenar Viejo",
    "Avenida Juan Pablo II",
    "Avenida Severo Ochoa",
    "Carretera de Hoyo de Manzanares",
    "Avenida de Andalucía",
    "Carretera de Madrid M-607",
    "Calle Real",
    "Carretera de Miraflores",
    "Plaza de los Arcos",
    "Calle del Olivar",
    "Avenida de Remedios",
    "Calle Salvador",
    "Avenida de los Músicos",
  ],
};

// 👇 Ampliación: las interurbanas 720–727 usan el trazado INTER
const LINES = {
  ...LINES_BASE,
  "720": LINES_BASE.INTER,
  "721": LINES_BASE.INTER,
  "722": LINES_BASE.INTER,
  "723": LINES_BASE.INTER,
  "724": LINES_BASE.INTER,
  "725": LINES_BASE.INTER,
  "726": LINES_BASE.INTER,
  "727": LINES_BASE.INTER,
};

// ==== 2) Utilidades ====
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function geocode(q) {
  const queries = variantsFor(q);

  for (const text of queries) {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", text);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("addressdetails", "0");
    url.searchParams.set("viewbox", `${BBOX.minLon},${BBOX.minLat},${BBOX.maxLon},${BBOX.maxLat}`);
    url.searchParams.set("bounded", "1");

    const res = await fetch(url, { headers: { "User-Agent": "colmenar-gtfs/1.0 (dev use)" } });
    if (!res.ok) continue;
    const data = await res.json();
    if (data && data[0]) {
      const { lat, lon } = data[0];
      console.log(`✔ ${q} → ${text}`);
      return [Number(lat), Number(lon)];
    }
    await sleep(400);
  }

  console.warn("No match:", q);
  return null;
}

async function buildShapes() {
  const rows = [];
  for (const [routeId, stops] of Object.entries(LINES)) {
    const shapeId = `shape_${routeId}`;
    let seq = 1;
    console.log(`↳ ${routeId} (${stops.length} puntos)`);
    for (const name of stops) {
      const pt = await geocode(name);
      await sleep(900);
      if (!pt) continue;
      const [lat, lon] = pt;
      rows.push({
        shape_id: shapeId,
        shape_pt_lat: lat.toFixed(6),
        shape_pt_lon: lon.toFixed(6),
        shape_pt_sequence: seq++,
      });
    }
  }
  return rows;
}

function toCsv(rows) {
  const header = "shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence";
  const body = rows.map(r => `${r.shape_id},${r.shape_pt_lat},${r.shape_pt_lon},${r.shape_pt_sequence}`);
  return [header, ...body].join("\n");
}

// ==== 3) Run ====
const data = await buildShapes();
await fs.mkdir("public/gtfs/colmenar", { recursive: true });
await fs.writeFile(OUTPUT, toCsv(data), "utf8");
console.log(`✅ shapes.txt generado: ${OUTPUT} (${data.length} puntos)`);
