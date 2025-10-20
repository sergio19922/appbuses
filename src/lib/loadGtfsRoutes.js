/**
 * Carga y normaliza rutas desde /gtfs/index.json
 * - Genera un id único por paquete+ruta (p.ej. "paquete_001__8__151___")
 * - (Opcional) filtra por hasShape === true
 * - Devuelve helpers útiles para consumir GTFS (urls a routes.txt, shapes.txt, etc.)
 */

const GTFS_INDEX_URL = '/gtfs/index.json';

/** Asegura que el color tenga # delante */
function normalizeColor(hex) {
  if (!hex) return null;
  return hex.startsWith('#') ? hex : `#${hex}`;
}

/** Ordena primero por short_name numérico (si lo es), luego por alfanumérico */
function sortByShortName(a, b) {
  const an = Number(a.short_name);
  const bn = Number(b.short_name);
  const aIsNum = Number.isFinite(an);
  const bIsNum = Number.isFinite(bn);
  if (aIsNum && bIsNum) return an - bn;
  if (aIsNum && !bIsNum) return -1;
  if (!aIsNum && bIsNum) return 1;
  return String(a.short_name || '').localeCompare(String(b.short_name || ''), 'es', { numeric: true });
}

/**
 * Carga el índice completo tal cual viene del JSON.
 */
export async function loadGtfsIndex() {
  const res = await fetch(GTFS_INDEX_URL, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`No se pudo cargar ${GTFS_INDEX_URL} (HTTP ${res.status})`);
  }
  const data = await res.json();
  if (!data || !Array.isArray(data.packages)) {
    throw new Error('Formato de index.json inesperado: falta "packages"');
  }
  return data;
}

/**
 * Devuelve todas las rutas normalizadas.
 * @param {Object} opts
 * @param {boolean} [opts.onlyWithShape=true]  Si true, filtra por hasShape === true
 * @returns {Promise<Array>}
 */
export async function loadGtfsRoutes(opts = {}) {
  const { onlyWithShape = true } = opts;
  const data = await loadGtfsIndex();

  const routes = [];
  for (const pkg of data.packages) {
    const base = pkg.base; // p.ej. "/gtfs/paquete_001"
    for (const r of pkg.routes || []) {
      if (onlyWithShape && !r.hasShape) continue;

      const key = `${pkg.id}__${r.route_id}`; // id único sin colisiones

      routes.push({
        key,                     // único (paquete + route_id)
        package_id: pkg.id,      // p.ej. "paquete_001"
        base,                    // p.ej. "/gtfs/paquete_001"
        route_id: r.route_id,    // el id original de la ruta dentro del paquete
        short_name: r.short_name || '',
        long_name: r.long_name || '',
        color: normalizeColor(r.color),
        hasShape: !!r.hasShape,

        // URLs prácticas a los ficheros del paquete:
        routesTxt: `${base}/routes.txt`,
        shapesTxt: `${base}/shapes.txt`,
        tripsTxt: `${base}/trips.txt`,
        stopsTxt: `${base}/stops.txt`,
        stopTimesTxt: `${base}/stop_times.txt`,
      });
    }
  }

  // Orden sugerente
  routes.sort((a, b) => {
    // Por paquete para tener bloques coherentes
    const byPkg = String(a.package_id).localeCompare(String(b.package_id), 'es', { numeric: true });
    if (byPkg !== 0) return byPkg;
    return sortByShortName(a, b);
  });

  return routes;
}

/**
 * Busca una ruta por su key única (paquete__route_id).
 * @param {string} key
 * @returns {Promise<object|null>}
 */
export async function getRouteByKey(key) {
  const all = await loadGtfsRoutes({ onlyWithShape: false });
  return all.find(r => r.key === key) || null;
}

/**
 * Atajo: devuelve sólo las rutas que SÍ tienen shapes.
 * @returns {Promise<Array>}
 */
export async function loadRoutesWithShape() {
  return loadGtfsRoutes({ onlyWithShape: true });
}
