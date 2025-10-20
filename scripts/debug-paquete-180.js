// scripts/debug-paquete-180.js
import fs from "fs";
import path from "path";

const indexPath = path.join("public", "gtfs", "index.json");
const indexData = JSON.parse(fs.readFileSync(indexPath, "utf8"));

const paquete180 = indexData.find(p => p.id === "paquete_180");
if (!paquete180) {
  console.log("No encontrado paquete_180");
  process.exit(0);
}

console.log("Rutas reales en paquete_180:");
(paquete180.routes || []).forEach(r => {
  console.log("-", r.short_name || r.route_short_name || r.shortName);
});
