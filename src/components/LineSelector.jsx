import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LineSelector({ onSelectLine, carretera }) {
  const [packages, setPackages] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCarretera, setSelectedCarretera] = useState("");
  const navigate = useNavigate();
  const [tipo, setTipo] = useState("");
  const [municipioFiltro, setMunicipioFiltro] = useState("");

  const [seleccionadas, setSeleccionadas] = useState([]);


  // ⭐ Estado de favoritos (persistido en localStorage)
const [favoritos, setFavoritos] = useState(() => {
  try {
    const saved = localStorage.getItem("favoritosLineas");
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
});

// ⭐ función para alternar favoritos
const toggleFavorito = (routeId) => {
  setFavoritos(prev => {
    let nuevo;
    if (prev.includes(routeId)) {
      nuevo = prev.filter(id => id !== routeId);
    } else {
      nuevo = [...prev, routeId];
    }
    localStorage.setItem("favoritosLineas", JSON.stringify(nuevo));
    return nuevo;
  });
};

const detectarMunicipio = (ln = "") => {
  const texto = ln.toUpperCase();

  if (texto.includes("BOADILLA")) return "Boadilla del Monte";
  if (texto.includes("ALCORCÓN")) return "Alcorcón";
  if (texto.includes("MÓSTOLES")) return "Móstoles";
  if (texto.includes("ESCORIAL")) return "El Escorial";
  if (texto.includes("FUENLABRADA")) return "Fuenlabrada";
  if (texto.includes("LEGANÉS")) return "Leganés";
  if (texto.includes("TORREJÓN")) return "Torrejón de Ardoz";

  // 🔥 Nuevos municipios de la M607
  if (texto.includes("COLMENAR")) return "Colmenar Viejo";
  if (texto.includes("TRES CANTOS")) return "Tres Cantos";
  if (texto.includes("GUADALIX")) return "Guadalix de la Sierra";
  if (texto.includes("MIRAFLORES")) return "Miraflores de la Sierra";
  if (texto.includes("MANZANARES")) return "Manzanares el Real";
  if (texto.includes("SAN AGUSTÍN")) return "San Agustín del Guadalix";

  return null;
};

 const nombresRojosPorCarretera = {
 N1: {
  // 🏙️ Urbanas de Alcobendas
  "5": "5. El Soto la Moraleja",

  // 🏙️ Urbanas de Colmenar Viejo
  
  

  // 🏙️ Urbanas de Tres Cantos
  "FFCC-AVENIDA VIÑUELAS-AVENIDA COLMENAR-FFCC": "1. Tres Cantos",
  "FFCC-AVENIDA COLMENAR-AVENIDA VIÑUELAS-FFCC": "2. Tres Cantos",
  "SOTO DE VIÑUELAS-TRES CANTOS FFCC-SOTO DE VIÑUELAS": "3. Tres Cantos",
  "NUEVO TRES CANTOS - TRES CANTOS FF.CC.": "4. Tres Cantos",
  "NUEVO TRES CANTOS - AV. VIÑUELAS": "5. Tres Cantos",

  // 🚍 Resto interurbanas
  "5": "5. El Soto la Moraleja",
  "6": "Alcobendas L6",
  "8": "8. Ciudalcampo",
  "9": "Alcobendas L9",
  "CIRCULAR CIUDALCAMPO": "8. Ciudalcampo"
},



  N2: {
    "1A": "Circular Torrejón de Ardoz L1",
    "2": "Circular Torrejón de Ardoz L2",
    "3": "Circular Torrejón de Ardoz L3",
    "4": "Circular Torrejón de Ardoz L4",
    "5A": "Circular Torrejón de Ardoz L5",
    "6": "6. Torrejón de Ardoz"
  },

  N3: {
    "1": "Arganda L1",
    "RESIDENCIA-LA POVEDA": "Urbana Arganda L1",
    "2": "Arganda L2",
    "3": "Arganda L3"
  },
   N4: {
  // 🔴 Urbanas Fuenlabrada
  "parque miraflores - polígono sevilla": "Fuenlabrada 1",
  "2": " Fuenlabrada 2",
  "circular roja": "Fuenlabrada 3",
  "4": "Fuenlabrada 4",
  "6": "Fuenlabrada 6",
  "13": "Fuenlabrada 13",

  // 🔴 Urbana Leganés
  "circular vereda de los estudiantes-la fortuna": "Leganés 1"
},


N5: {
  // NAVALCARNERO
  "LA DEHESA-EL PINAR": "Navalcarnero 1",

  // MÓSTOLES
  "LAS CUMBRES-ESTACIÓN FFCC": "Móstoles 1",
  "LAS CUMBRES-ESTACION FFCC": "Móstoles 1", // sin tilde por si acaso

  "MÓSTOLES (PRADILLO)-CEMENTERIO": "Móstoles 2", // <- TODO MAYÚSCULAS en PRADILLO

  "POLÍGONO INDUSTRIAL LAS NIEVES-MÓSTOLES PRADILLO": "Móstoles 3",
  "POLIGONO INDUSTRIAL LAS NIEVES-MÓSTOLES PRADILLO": "Móstoles 3", // variante sin tilde

  "MÓSTOLES SUR - MÓSTOLES (HOSPITAL REY JUAN CARLOS)": "Móstoles 4",
  "MOSTOLES SUR - MOSTOLES (HOSPITAL REY JUAN CARLOS)": "Móstoles 4", // variante sin tildes

  "MÓSTOLES (ESTACIÓN FF.CC.) - PARQUE COIMBRA": "Móstoles 5",    // <- ESTACIÓN todo caps
  "MOSTOLES (ESTACIÓN FF.CC.) - PARQUE COIMBRA": "Móstoles 5",  
  "MOSTOLES (ESTACION FF.CC.) - PARQUE COIMBRA": "Móstoles 5",    // variante sin tildes

  "UNIVERSIDAD REY JUAN CARLOS-URB. P.GUADARRAMA": "Móstoles 6",

  // ALCORCÓN
  "PUERTA DEL SUR - FUENTE CISNEROS": "Alcorcón 1",
  "ONDARRETA-PRADO STO DOMINGO": "Alcorcón 2",

  "ALCORCÓN CENTRAL - PARQUE EL LUCERO": "Alcorcón 3",
  "ALCORCON CENTRAL - PARQUE EL LUCERO": "Alcorcón 3", // sin tilde

  // ARROYOMOLINOS
  "1A": "Arroyomolinos 1"
},



 N6: {
  // 👉 Boadilla del Monte
  "1_boadilla": "Boadilla L1",
  "2_boadilla": "Boadilla L2",
  "3_boadilla": "Boadilla L3",
  "4_boadilla": "Boadilla L4",
  "5_boadilla": "Boadilla L5",

  // 👉 El Escorial
  "1_escorial": "Escorial L1",
  "2_escorial": "Escorial L2",
  "3_escorial": "Escorial L3",

  // 👉 San Lorenzo del Escorial
  "4_sanlorenzo": "Escorial L4",

  // 👉 Las Rozas
  "1_lasrozas": "Las Rozas L1",
  "2_lasrozas": "Las Rozas L2",
  "3_lasrozas": "Las Rozas L3"
},

  

   M607: {
  "CIRCULAR COLMENAR VIEJO": "Colmenar VIejo L1",
  "FFCC-AVENIDA VIÑUELAS-AVENIDA COLMENAR-FFCC": "1. Tres Cantos",
  "FFCC-AVENIDA COLMENAR-AVENIDA VIÑUELAS-FFCC": "2. Tres Cantos",
  "SAN SEBASTIÁN - ESTACIÓN FF.CC.": "Colmenar Viejo L3",
  "SOTO DE VIÑUELAS-TRES CANTOS FFCC-SOTO DE VIÑUELAS": "3. Tres Cantos",
  
  "NUEVO TRES CANTOS - TRES CANTOS FF.CC.": "4. Tres Cantos",
  
  "NUEVO TRES CANTOS - AV. VIÑUELAS": "5. Tres Cantos",
 
}


  
};





useEffect(() => {
  // 🚦 Detecta automáticamente la carretera según la URL actual
  const path = window.location.pathname.toUpperCase();
  const selectedCarretera = path.includes("N6") ? "N6" : "N1"; // usa N1 por defecto

  // 📂 Selecciona el archivo JSON correcto
  const url =
    selectedCarretera === "N6"
      ? "/gtfs/index-n6.json"
      : "/gtfs/index.json";

  console.log(`📂 Cargando datos desde: ${url}`);

    fetch(url)
    .then(res => res.json())
    .then(data => {
      // ✅ Soporta tanto { packages: [...] } como un array directo
      let packs = Array.isArray(data) ? data : data.packages || [];

      console.log("📦 Todos los paquetes y sus rutas:");
      (packs || []).forEach(p =>
        console.log(p.id, (p.routes || []).map(r => r.short_name))
      );

      // 🔍 Verificamos si está el paquete_026 (para depuración)
      const pack026 = packs.find(p => p.id === "paquete_026");
      if (pack026) {
        console.log(
          "🔎 Rutas detectadas en paquete_026:",
          (pack026.routes || []).map(r => ({
            short: r.short_name,
            long: r.long_name,
          }))
        );
      }

      // 🧩 Buscar shapes de líneas de Alcobendas / Moraleja
      console.log("🔍 Explorando posibles shapes reales para Alcobendas/Moraleja...");
      (packs || []).forEach(pack => {
        (pack.routes || []).forEach(r => {
          const ln = (r.long_name || "").toUpperCase();
          if (ln.includes("ALCOBENDAS") || ln.includes("MORALEJA") || ln.includes("SOTO")) {
            console.log(pack.id, r.short_name, r.long_name, r.shape_id);
          }
        });
      });


      // 🕵️‍♂️ Buscar la línea urbana 5 real de La Moraleja
      console.log("🔎 Buscando la línea urbana 5 real de La Moraleja...");
      (packs || []).forEach(pack => {
        const r5 = (pack.routes || []).find(
          r =>
            r.short_name === "5" ||
            (r.long_name || "").toUpperCase().includes("MORALEJA")
        );
        if (r5) {
          console.log(
            `✅ Encontrada posible L5 en ${pack.id}:`,
            r5.short_name,
            r5.long_name,
            r5.shape_id
          );
        }
      });

      // 🔧 A partir de aquí continúa toda tu lógica normal de transformación de "packs"
      // (la parte que reasigna carreteras, modifica nombres, etc.)
      // 👇👇👇




      // 🔧 Lógica de carreteras
      packs = packs.map(pack => {
        // ✅ N1 — paquete_001
    if (pack.id === "paquete_001") {
  // 👇 listado de líneas interurbanas de la N1
  const rutasValidasN1 = [
    "5",
    "151", "152", "152C", "153", "154", "154C",
    "155", "155B", "156", "157", "157C", "158",
    "159", "166", "180", "181", "182",
    "183", "184", "185"
  ];

  const rutasModificadas = pack.routes.map(r => {
    const sn = (r.short_name || "").trim();
    const ln = (r.long_name || "").toUpperCase();
    const snNum = parseInt(sn, 10);

    // 💚 Color unificado para interurbanas N1 (151–199 y 180–185)
    let colorBase = r.color || "";
    if (
      (snNum >= 151 && snNum <= 199) ||
      ["180", "181", "182", "183", "184", "185"].includes(sn)
    ) {
      colorBase = "A8E05F"; // 🌿 verde claro unificado
    }

    //

    // 🏙️ Urbana Alcobendas L6
if (sn === "6" && ln.includes("ALCOBENDAS")) {
  return {
    ...r,
    carretera: "N1",
    color: "E60003",
    long_name: "Urb Alcobendas L6"
  };
}

// 🏙️ Urbana Alcobendas L9
if (sn === "9" && ln.includes("ALCOBENDAS")) {
  return {
    ...r,
    carretera: "N1",
    color: "E60003",
    long_name: "Urb Alcobendas L9"
  };
}

// 🏙️ Urbana Alcobendas L10
if (
  sn === "10" &&
  (ln.includes("CIRCULAR DE ALCOBENDAS") || ln.includes("CIRCULAR ALCOBENDAS"))
) {
  return {
    ...r,
    carretera: "N1",
    color: "E60003",
    long_name: "Urb Alcobendas Circular"
  };
}

// 🏙️ Urbana Alcobendas L11
if (
  sn === "11" &&
  (ln.includes("CIRCULAR DE ALCOBENDAS") || ln.includes("CIRCULAR ALCOBENDAS"))
) {
  return {
    ...r,
    carretera: "N1",
    color: "E60003",
    long_name: "Urb Alcobendas Circular"
  };
}

// 🏙️ Urbana S.S. Reyes L4
if (sn === "4" && (ln.includes("POLIDEPORTIVO") || ln.includes("MOSCATELARES"))) {
  return {
    ...r,
    carretera: "N1",
    color: "E60003",
    long_name: "S.S. Reyes L4"
  };
}

// 🏙️ Urbana S.S. Reyes L7
// 🏙️ Urbana S.S. Reyes L7
if (
  sn === "7" &&
  (
    ln.includes("POLIGONOS") ||
    ln.includes("POLÍGONOS") ||
    ln.includes("ESTACION") ||
    ln.includes("ESTACIÓN")
  )
) {
  return {
    ...r,
    carretera: "N1",
    color: "E60003",
    long_name: "Urb S.S. Reyes L7"
  };
}

packs.push({
  id: "paquete_161",
  base: "/gtfs/N1/161",
  carretera: "N1",
  routes: [
    {
      route_id: "1",
      short_name: "161",
      long_name: "Madrid-Alcobendas-SS Reyes-Urbanizacion Fuente del Fresno",
      color: "FF7F00", // 🟧 naranja interurbana N1
      carretera: "N1"
    }
  ]
  
});










    if (pack.id === "paquete_030") {
  console.log(
    "🔎 Todas las rutas de paquete_030:",
    (pack.routes || []).map(r => ({
      id: r.route_id,
      short: r.short_name,
      long: r.long_name
    }))
  );

}

    // ✅ Urbana de Alcobendas (paquete_030)
// ✅ Urbanas Alcobendas L1, L2 y L3 — paquete_030
// ✅ Urbanas Alcobendas L1, L2 y L3 — paquete_030
// ✅ Urbanas Alcobendas L1, L2 y L3 — paquete_030
if (pack.id === "paquete_030") {
  console.log(
    "🔎 Revisando paquete_030:",
    (pack.routes || []).map(r => ({ short: r.short_name, long: r.long_name }))
  );

  const rutasModificadas = (pack.routes || []).map(route => {
    const short = String(route.short_name || "").trim();
    const lnRaw  = String(route.long_name || "");
    const ln = lnRaw
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")   // <- sin barras invertidas duplicadas
      .replace(/[–—−]/g, "-");           // normaliza guiones raros

    // 🏷️ IMPORTANTE: L3 primero para que no la pille L1/L2
    if (
      short === "3" &&
      (
        ln.includes("ENCINAR") ||
        ln.includes("SOTO DE LA MORALEJA") ||
        ln.includes("ARROYO DE LA VEGA")
      )
    ) {
      console.log("✅ Detectada Alcobendas L3:", lnRaw);
      return { ...route, carretera: "N1", color: "E60003", long_name: "Alcobendas L3" };
    }

    // 🏙️ Alcobendas L1
    if (short === "1" && (ln.includes("ALCOBENDAS") || ln.includes("ARROYO DE LA VEGA"))) {
      return { ...route, carretera: "N1", color: "E60003", long_name: "Alcobendas L1" };
    }

    // 🏙️ Alcobendas L2
    if (short === "2" && (ln.includes("ALCOBENDAS") || ln.includes("MORALEJA"))) {
      return { ...route, carretera: "N1", color: "E60003", long_name: "Alcobendas L2" };
    }

    // Resto sin cambios
    return route;
  });

  console.log(
    "🟢 paquete_030 - reasignadas a N1:",
    rutasModificadas
      .filter(r => r.carretera === "N1")
      .map(r => ({ short: r.short_name, long: r.long_name }))
  );

  return { ...pack, routes: rutasModificadas };
}





    

    // 🚍 resto de líneas interurbanas de N1
    if (rutasValidasN1.includes(sn)) {
      return { ...r, carretera: "N1" };
    }

    // ⚠️ línea 263 pertenece a N2
    if (sn === "263") {
      return { ...r, carretera: "N2" };
    }

    return r;
  });

  console.log(
    "🟢 paquete_001 - reasignadas a N1:",
    rutasModificadas
      .filter(r => r.carretera === "N1")
      .map(r => ({ short: r.short_name, long: r.long_name }))
  );

  return { ...pack, routes: rutasModificadas };
}

// ✅ Urbanas Alcobendas L1 y L2 — paquete_030
if (pack.id === "paquete_030") {
  console.log(
    "🔍 Revisando paquete_030:",
    (pack.routes || []).map(r => ({
      short: r.short_name,
      long: r.long_name
    }))
  );

  const rutasModificadas = (pack.routes || []).map(route => {
    const short = (route.short_name || "").trim();
    const ln = (route.long_name || "")
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[–—−]/g, "-");

    // 🏙️ Urbana Alcobendas L3 — tiene prioridad sobre L1
    if (
      short === "3" ||
      ln.includes("ENCINAR") ||
      ln.includes("SOTO DE LA MORALEJA") ||
      ln.includes("ARROYO DE LA VEGA-SOTO")
    ) {
      console.log("✅ Detectada Alcobendas L3:", ln);
      return {
        ...route,
        carretera: "N1",
        color: "E60003",
        long_name: "Urb Alcobendas L3"
      };
    }

    // 🏙️ Urbana Alcobendas L2
    if (
      short === "2" ||
      (ln.includes("LA MORALEJA") && !ln.includes("SOTO"))
    ) {
      return {
        ...route,
        carretera: "N1",
        color: "E60003",
        long_name: "Urb Alcobendas L2"
      };
    }

    // 🏙️ Urbana Alcobendas L1
    if (
      short === "1" &&
      ln.includes("ARROYO DE LA VEGA") &&
      !ln.includes("SOTO")
    ) {
      return {
        ...route,
        carretera: "N1",
        color: "E60003",
        long_name: "Urb Alcobendas L1"
      };
    }

    // 🚍 resto mantienen su carretera original
    return route;
  });

  console.log(
    "🟢 paquete_030 - reasignadas a N1:",
    rutasModificadas
      .filter(r => r.carretera === "N1")
      .map(r => ({ short: r.short_name, long: r.long_name }))
  );

  return { ...pack, routes: rutasModificadas };
}


        // ✅ N2 / N3 — paquete_009
        if (pack.id === "paquete_009") {
  // ✅ Incluye variantes como 312A, 313B, etc.
  const n3Regex009 = /^(1|2|3|4|312|312A|313|320|321|322|326)$/i;
  const n2Regex009 = /^(260|261)$/i;

  const rutasModificadas = pack.routes.map(route => {
    const sn = (route.short_name || "").trim().toUpperCase();
    const ln = (route.long_name || "").toUpperCase();

    // 🏙️ Circular Arganda → renombrar a L3 (short_name 3)
    if (sn === "4" && ln.includes("ARGANDA")) {
      return {
        ...route,
        carretera: "N3",
        color: "E60003",
        short_name: "3",
        long_name: "Urb Arganda L3"
      };
    }

    // 🚍 Líneas N3 normales
    if (n3Regex009.test(sn)) {
      return { ...route, carretera: "N3" };
    }

    // 🚍 Líneas N2 normales
    if (n2Regex009.test(sn)) {
      return { ...route, carretera: "N2" };
    }

    return route;
  });

  return { ...pack, routes: rutasModificadas };
}



if (pack.id === "paquete_076") {
  const rutasN1 = ["191", "193", "194", "195", "196", "197", "199A"];
  const rutasN2 = [
    "824","210","211","212","215","220","222","223","224",
    "226","227","229","231","232","250","251","252","254",
    "255","256","260","261","263"
  ];

  const rutasModificadas = (pack.routes || []).map(route => {
    const sn = (route.short_name || "").trim();
    const ln = (route.long_name || "").toUpperCase();

    // 🟢 M607 — líneas interurbanas (720–727 y 913)
    // 💚 Interurbanas M607 — 720–727 y 913
const m607Interurbanas = [
  "720","721","722","723","724","725","726","727","913"
];
if (m607Interurbanas.includes(sn)) {
  return {
    ...route,
    carretera: "M607",
    color: "78BE20", // verde interurbano
    long_name: route.long_name?.replace(/^MADRID.*?-/, "").trim() || route.long_name
  };
}


    // 🏙️ Urbanas Torrejón
    if (sn === "1A" && ln.includes("TORREJ")) return { ...route, carretera: "N2", color: "E60003", long_name: "Urb Circular Torrejón L1" };
    if (sn === "2" && ln.includes("FRONTERAS")) return { ...route, carretera: "N2", color: "E60003", long_name: "Urb Torrejón de Ardoz L2" };
    if (sn === "3" && ln.includes("FRESNOS")) return { ...route, carretera: "N2", color: "E60003", long_name: "Urb Torrejón de Ardoz L3" };
    if (sn === "4" && ln.includes("CORREDOR")) return { ...route, carretera: "N2", color: "E60003", long_name: "Urb Torrejón de Ardoz L4" };
    if (sn === "5A" && ln.includes("EUROPA")) return { ...route, carretera: "N2", color: "E60003", long_name: "Urb Torrejón de Ardoz L5" };

    // 🏙️ Urbana Pedrezuela L1
    if (sn === "1" && (ln.includes("PEDREZUELA") || ln.includes("URBANIZACIONES"))) {
      return { ...route, carretera: "N1", color: "E60003", long_name: "L1P" };
    }

    // 🚍 Interurbanas N1
    if (rutasN1.includes(sn)) return { ...route, carretera: "N1" };

    // 🚍 Interurbanas N2
    if (rutasN2.includes(sn)) return { ...route, carretera: "N2" };

    return route;
  });

  console.log(
    "🟢 paquete_076 - reasignadas:",
    rutasModificadas
      .filter(r => ["N1", "N2", "M607"].includes(r.carretera))
      .map(r => ({ short: r.short_name, long: r.long_name, carretera: r.carretera }))
  );

  return { ...pack, routes: rutasModificadas };
}


// ✅ N1 — paquete_027
// ✅ N1 — paquete_027
if (pack.id === "paquete_027") {
  const rutasModificadas = (pack.routes || []).map(route => {
    const short = (route.short_name || "").trim();
    const ln = (route.long_name || "").toUpperCase();

    // 🏙️ Urbana Ciudalcampo L8
    if (short === "8" && (ln.includes("CIUDALCAMPO") || ln.includes("CIRCULAR"))) {
      return {
        ...route,
        carretera: "N1",
        color: "E60003",
        short_name: "L8",          // 👈 también actualizamos el short_name
        long_name: "Urb L8"        // 👈 nombre fijo
      };
    }

    return route;
  });

  console.log(
    "🟢 paquete_027 - reasignadas a N1:",
    rutasModificadas
      .filter(r => r.carretera === "N1")
      .map(r => ({ short: r.short_name, long: r.long_name }))
  );

  return { ...pack, routes: rutasModificadas };
}




        // ✅ N3 — paquete_050
        if (pack.id === "paquete_050") {
          const n3Regex050 = /^(350A|350B|350C|351|352|353|355)$/i;
          const rutasModificadas = pack.routes.map(route => {
            if (n3Regex050.test(route.short_name || "")) {
              return { ...route, carretera: "N3" };
            }
            return route;
          });
          return { ...pack, routes: rutasModificadas };
        }

        // ✅ N4 — paquete_024
        if (pack.id === "paquete_024") {
          const rutasValidasN4 = ["421","422","423","424","425","426","427","429"];

          const rutasModificadas = pack.routes
            .filter(route => rutasValidasN4.includes(route.short_name))
            .map(route => ({ ...route, carretera: "N4" }));

          return { ...pack, routes: rutasModificadas, carretera: "N4" };
        }

        // ✅ N4 — 402, miraflores, N4_virtual
        if (["402", "miraflores", "N4_virtual"].includes(pack.id)) {
          const rutasModificadas = pack.routes.map(route => ({ ...route, carretera: "N4" }));
          return { ...pack, routes: rutasModificadas, carretera: "N4" };
        }

        // ✅ N4 / N5 — paquete_008
        if (pack.id === "paquete_008") {
          const rutasN4 = [
            "1","480","481","482","483","484","485","486","487","488",
            "491","492","493","496","497"
          ];

          const rutasN5 = ["495","498","498A","499","1A"];

          const rutasModificadas = pack.routes.map(route => {
            const sn = (route.short_name || "").trim().toUpperCase();

            if (rutasN4.includes(sn)) return { ...route, carretera: "N4" };
            if (rutasN5.includes(sn)) return { ...route, carretera: "N5" };

            return route;
          });

          return { ...pack, routes: rutasModificadas };
        }

        // ✅ N4 — circulares varias
        if (["circular-roja", "circularverde", "cementerio", "seseña", "fuenlabradacentral"].includes(pack.id)) {
          const rutasModificadas = pack.routes.map(route => ({
            ...route,
            carretera: "N4",
            color: "8EBF42"
          }));
          return { ...pack, routes: rutasModificadas, carretera: "N4" };
        }

        // ✅ N4 — loranca y cementerio
        if (pack.id === "loranca" || pack.id === "cementerio") {
          const rutasModificadas = pack.routes.map(route => ({
            ...route,
            carretera: "N4",
            long_name: pack.id === "cementerio" ? "Cementerio" : route.long_name,
            color: pack.id === "cementerio" ? "FF0000" : route.color
          }));
          return { ...pack, routes: rutasModificadas, carretera: "N4" };
        }

        // ✅ N2_virtual / N3_virtual
        if (pack.id === "N2_virtual") {
          const rutasModificadas = pack.routes.map(route => ({ ...route, carretera: "N2" }));
          return { ...pack, routes: rutasModificadas, carretera: "N2" };
        }

        if (pack.id === "N3_virtual") {
          const rutasModificadas = pack.routes.map(route => ({ ...route, carretera: "N3" }));
          return { ...pack, routes: rutasModificadas, carretera: "N3" };
        }

        // ✅ N5 — suburbanas y urbanas
       if (["paquete_034", "paquete_038", "paquete_008", "paquete_043", "N5_virtual"].includes(pack.id)) {
  const normalizeCode = (code) =>
    String(code || "").trim().toUpperCase().replace(/[^0-9A-Z]/g, "");

  const rutasValidasN5 = [
    // 🔴 Rojas de N5 (Móstoles / Alcorcón)
    "1","2","3","4","5","6",
    // 🚍 Suburbanas N5 (completas)
    "510","510A","511","512","513","514","516","517","518",
    "519","519A","519B", // 👈 añadida 519A
    "520","521","522","523","524","526","527","528",
    "529","529A","529H", // 👈 añadidas 529A y 529H
    "530","531","531A","532","534","539",
    // 🚍 Extra
    "1A","1B","495","498","498A","499",
    "541","545","546","547","548","581" // 👈 581 ya incluida aquí
  ].map(normalizeCode);

  const rutasFiltradas = (pack.routes || []).filter(route => {
    const sn = normalizeCode(route.short_name || "");
    const ln = (route.long_name || "").toUpperCase();

    // ❌ excluir "1 LAS ROZAS - MOLINO DE LA HOZ" (N6)
    if (sn === "1" && ln.includes("MOLINO DE LA HOZ")) return false;

    // ❌ excluir "2 LAS ROZAS - EL ENCINAR" (N6)
    if (sn === "2" && ln.includes("ENCINAR")) return false;

    return rutasValidasN5.includes(sn);
  });

  const rutasModificadas = rutasFiltradas.map(route => ({
    ...route,
    carretera: "N5"
  }));

  return { ...pack, routes: rutasModificadas, carretera: "N5" };
}


        // ✅ N6 — Escorial / Boadilla / San Lorenzo
   // ✅ N5 — excepción: la 581 pertenece a N5 aunque esté en paquete_026
// ✅ N6 — Escorial / Boadilla / San Lorenzo
// ✅ N5 — excepción: la 581 pertenece a N5 aunque esté en paquete_026
if (["paquete_004", "paquete_026", "paquete_039"].includes(pack.id)) {
  const rutasModificadas = (pack.routes || [])
    .filter(r => {
      const sn = (r.short_name || "").trim().toUpperCase();
      // 👇 quitamos "581" del filtro para que entre en el mapa
      return sn !== "640A" && sn !== "661A";
    })
    .map(route => {
      const sn = (route.short_name || "").trim();
      const ln = (route.long_name || "").toUpperCase();

      // 🟢 excepción: la 581 pertenece a N5
      if (sn === "581") {
        return { ...route, carretera: "N5" };
      }

      // 🏙️ El Escorial
      if (sn === "1" && ln.includes("ESCORIAL"))
        return { ...route, carretera: "N6", short_name: "1_escorial" };
      if (sn === "2" && ln.includes("ESCORIAL"))
        return { ...route, carretera: "N6", short_name: "2_escorial" };
      if (sn === "3" && ln.includes("ESCORIAL"))
        return { ...route, carretera: "N6", short_name: "3_escorial" };

      // 🏙️ San Lorenzo del Escorial
      if (sn === "4" && ln.includes("SAN LORENZO"))
        return { ...route, carretera: "N6", short_name: "4_sanlorenzo" };

      // 🏙️ Boadilla del Monte
      if (
        sn === "1" &&
        (ln.includes("BOADILLA") ||
          ln.includes("OLIVAR") ||
          ln.includes("PARQUE LAS LOMAS") ||
          ln.includes("PASEO DE MADRID"))
      ) {
        return { ...route, carretera: "N6", short_name: "1_boadilla" };
      }
      if (sn === "2" && ln.includes("BOADILLA"))
        return { ...route, carretera: "N6", short_name: "2_boadilla" };
      if (sn === "3" && ln.includes("BOADILLA"))
        return { ...route, carretera: "N6", short_name: "3_boadilla" };
      if (sn === "4" && ln.includes("BOADILLA CENTRO"))
        return { ...route, carretera: "N6", short_name: "4_boadilla" };
      if (sn === "5" && ln.includes("BOADILLA"))
        return { ...route, carretera: "N6", short_name: "5_boadilla" };

      // 🏙️ Las Rozas
      if (sn === "1" && ln.includes("MOLINO DE LA HOZ"))
        return { ...route, carretera: "N6", short_name: "1_lasrozas" };
      if (sn === "2" && (ln.includes("ENCINAR") || ln.includes("LAS ROZAS")))
        return { ...route, carretera: "N6", short_name: "2_lasrozas" };
      if (sn === "3" && ln.includes("ROZAS"))
        return { ...route, carretera: "N6", short_name: "3_lasrozas" };

      return { ...route, carretera: "N6" };
    });

  console.log(
    "🟢 N6 -",
    pack.id,
    "rutas detectadas:",
    rutasModificadas.map(r => ({ short: r.short_name, long: r.long_name }))
  );

  return { ...pack, routes: rutasModificadas, carretera: "N6" };
}




// 🧹 Eliminar líneas 1 Colmenar Viejo sin shape (paquete_045)
// 🧹 Limpieza previa: eliminar duplicado sin shape de Colmenar Viejo (paquete_045)
// 🧹 Limpieza previa: eliminar duplicado sin shape de Colmenar Viejo (paquete_045)
// 🧹 Quitar versión rota de Colmenar Viejo (sin shape, paquete_045)
if (pack.id === "paquete_045") {
  pack.routes = (pack.routes || []).filter(
    r => r.route_id !== "9__1__045_"
  );
}






        // ✅ M607 — Colmenar Viejo / Tres Cantos
        // ✅ M607 — Colmenar Viejo / Tres Cantos
// ✅ M607 — Colmenar Viejo / Tres Cantos (paquete_129)
// ✅ M607 — Colmenar Viejo / Tres Cantos (paquete_129)
// ✅ M607 — Colmenar Viejo / Tres Cantos (paquete_129)

console.log("📦 Cargando paquete:", pack.id);
pack.routes
  ?.filter(r => (r.short_name || "").trim() === "1" && r.long_name.toUpperCase().includes("COLMENAR"))
  .forEach(r =>
    console.log("➡️ Línea 1 Colmenar encontrada en:", pack.id, r.route_id, "shape:", r.hasShape)
  );

if (pack.id === "paquete_129") {
  const rutasM607 = {
    "720": "Colmenar Viejo (Estación FF.CC.) - Collado Villalba",
    "721": "Madrid (Plaza de Castilla) - Colmenar Viejo",
    "722": "Madrid (Plaza de Castilla) - Colmenar Viejo (Gta. Mediterráneo)",
    "723": "Colmenar Viejo - Tres Cantos",
    "724": "Madrid (Plaza de Castilla) - Manzanares el Real - El Boalo",
    "725": "Madrid (Plaza de Castilla) - Miraflores - Bustarviejo - Valdemanco",
    "726": "Madrid (Plaza de Castilla) - Guadalix - Navalafuente",
    "727": "Colmenar Viejo - San Agustín del Guadalix"
  };

  const rutasModificadas = (pack.routes || []).map(route => {
    const short = (route.short_name || "").trim();
    const ln = (route.long_name || "").toUpperCase();

    // 🏙️ Mover Colmenar Viejo L1 (la buena) a N1
    if (short === "1" && ln.includes("COLMENAR VIEJO")) {
      console.log("✅ Moviendo Colmenar Viejo L1 a N1 desde paquete_129:", route.route_id);
      return {
        ...route,
        carretera: "N1",
        color: "E60003",
        long_name: "Urb Colmenar Viejo L1"
      };
    }

    // 🏙️ Urbanas Tres Cantos (1–5) → N1
   const esTresCantos =
  ["1", "2", "3", "4", "5"].includes(short) &&
  (
    ln.includes("TRES CANTOS") ||
    ln.includes("VIÑUELAS") ||
    ln.includes("NUEVO TRES CANTOS")
  );

if (esTresCantos) {
  let nuevoNombre = route.long_name;

  // 🏷️ Asignamos nombres consistentes
  if (short === "1") nuevoNombre = "Tres Cantos L1";
  else if (short === "2") nuevoNombre = " Tres Cantos L2";
  else if (short === "3") nuevoNombre = " Tres Cantos L3";
  else if (short === "4") nuevoNombre = " Tres Cantos L4";
  else if (short === "5") nuevoNombre = " Tres Cantos L5";

  return {
    ...route,
    carretera: "M607",  // 👈 ahora quedan correctamente en la M607
    color: "E60003",     // rojo urbano
    long_name: nuevoNombre
  };
}

    // 💚 Interurbanas M607 (720–727)
    const overrideName = rutasM607[short];
    if (overrideName) {
      return { ...route, carretera: "M607", color: "78BE20", long_name: overrideName };
    }

    // ❌ Evitar que cualquier otra Colmenar caiga a M607
    if (ln.includes("COLMENAR VIEJO")) {
      console.log("🧹 Eliminando duplicado Colmenar Viejo de M607:", route.route_id);
      return null;
    }

    // 🚍 Resto → M607
    return { ...route, carretera: "M607" };
  }).filter(Boolean); // 💡 elimina los null (duplicados descartados)

  return { ...pack, routes: rutasModificadas };
}



return pack;
}); // 👈 cierre del packs.map()

// 🧹 Eliminar todas las rutas que empiecen por "N" (nocturnas)
packs = packs.map(pack => {
  const rutasLimpias = (pack.routes || []).filter(r => {
    const sn = (r.short_name || "").trim().toUpperCase();
    return !sn.startsWith("N"); // 👈 descarta todas las Nxx
  });
  return { ...pack, routes: rutasLimpias };
});

console.log("🧹 Rutas nocturnas eliminadas. Paquetes restantes:", packs.length);

// 🟥 Forzar que la línea 5 (El Soto - La Moraleja) esté siempre en N1
// 🟥 Forzar que la línea 5 (El Soto - La Moraleja) esté siempre en N1
// 🧩 Recuperar el shape_id de la L5 real si existe en algún paquete

console.log("🔍 Explorando shapes disponibles en GTFS:");
(packs || []).forEach(pack => {
  (pack.routes || []).forEach(r => {
    if (r.shape_id) {
      console.log(pack.id, r.short_name, r.long_name, r.shape_id);
    }
  });
});

let shapeL5 = null;
(packs || []).forEach(pack => {
  const r5 = (pack.routes || []).find(
    r =>
      (r.short_name === "5" ||
       (r.long_name || "").toUpperCase().includes("MORALEJA")) &&
      r.shape_id
  );
  if (r5) shapeL5 = r5.shape_id;
});

console.log("🟢 Shape encontrado para L5:", shapeL5);

// 🟥 Forzar que la línea 5 (El Soto - La Moraleja) esté siempre en N1 con shape válido
// 🟥 Forzar que la línea 5 (El Soto - La Moraleja) esté siempre en N1 con shape válido
const existeL5 = (packs || []).some(pack =>
  (pack.routes || []).some(
    r =>
      (r.carretera || "").toUpperCase() === "N1" &&
      (r.short_name || "") === "5" &&
      (r.long_name || "").toUpperCase().includes("MORALEJA")
  )
);

if (!existeL5) {
  console.log("⚙️ Añadiendo manualmente la L5 de La Moraleja...");
  const packN1 = (packs || []).find(p => p.id === "paquete_001");

  // 🔍 Intentamos buscar la ruta 155 en cualquier paquete que la contenga
  let shapeL5 = null;
  (packs || []).forEach(p => {
    (p.routes || []).forEach(r => {
      const name = (r.long_name || "").toUpperCase();
      if (
        (r.short_name === "155" || name.includes("EL SOTO")) &&
        (r.hasShape || r.shape_id)
      ) {
        shapeL5 = r.route_id; // usamos su id como shape base
      }
    });
  });

  if (!shapeL5) {
    console.warn("⚠️ No se encontró la 155 con shape válido, usando fallback.");
  }

  if (packN1) {
    if (!packN1.routes) packN1.routes = [];

    packN1.routes.push({
  route_id: "8__155___", // 👈 mismo ID que la línea 155
  short_name: "5",
  long_name: "Urb El Soto La Moraleja",
  color: "E60003",       // rojo urbano
  carretera: "N1",
  hasShape: true
});


    console.log("✅ L5 de La Moraleja añadida con shape:", shapeL5 || "8__155___");
  } else {
    console.error("❌ No se encontró paquete_001 para añadir la L5.");
  }
}

// 🔍 Verificar en consola
console.table(
  (packs.find(p => p.id === "paquete_001")?.routes || [])
    .filter(r => r.short_name === "5")
    .map(r => ({
      id: r.route_id,
      long: r.long_name,
      shape: r.shape_id,
      hasShape: r.hasShape,
    }))
);

// ✅ Guardamos los paquetes finales
setPackages(packs);

console.table(uniqueRutas.filter(r => ["182","185"].includes(r.short_name)))


})
.catch(err => console.error("Error cargando GTFS index:", err));
}, []);




const todasLasRutas = packages.flatMap(pack =>
  (pack.routes || [])
    .filter(route => {
      // 👇 Si es de la M607 y empieza por "N", la quitamos
      if ((pack.id === "colmenar" || pack.carretera === "M607") && (route.short_name || "").startsWith("N")) {
        return false;
      }
      return true;
    })
    .map(route => ({
      ...route,
      base: pack.base,
      carretera: (route.carretera && route.carretera.trim()) || (pack.carretera || "").trim(),
      packId: pack.id,
      municipio: detectarMunicipio(route.long_name) // 👈 añadido aquí
    }))
);

  const normalize = (str) =>
    (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  let uniqueRutas = Array.from(
    new Map(todasLasRutas.map(r => [`${r.packId}-${r.route_id}`, r])).values()
  );

  // 🧩 Correcciones de clasificación: N1 y M607
// 🧩 Correcciones de clasificación: N1 y M607
uniqueRutas = uniqueRutas.map(r => {
  const sn = (r.short_name || "").trim().toUpperCase();
  const ln = (r.long_name || "").toUpperCase();

  // 🔴 L1–L5 de Tres Cantos → asegurar que estén en M607 (rojo urbano)
  if (
    ["1", "2", "3", "4", "5"].includes(sn) &&
    (
      ln.includes("TRES CANTOS") ||
      ln.includes("VIÑUELAS") ||
      ln.includes("NUEVO TRES CANTOS")
    )
  ) {
    return {
      ...r,
      carretera: "M607",   // ✅ ahora sí se quedan en M607
      color: "E60003",
      long_name: `Tres Cantos L${sn}`
    };
  }

  // 💚 700–729 → asegurar que están en M607
  if (/^7[0-2][0-9]$/.test(sn)) {
    return {
      ...r,
      carretera: "M607",
      color: "A8E05F"
    };
  }

  return r;
});

console.table(
  uniqueRutas
    .filter(r => (r.carretera || "").toUpperCase() === "N1")
    .map(r => ({
      pack: r.packId,
      id: r.route_id,
      short: r.short_name,
      long: r.long_name,
      color: r.color,
      car: r.carretera
    }))
);

// 🚫 Eliminar duplicadas 720–729 en N1
// 🧹 Eliminar de raíz todas las urbanas rojas de N1 excepto la 5 (El Soto la Moraleja)
uniqueRutas = uniqueRutas
  // 🔧 Primero normalizamos todas las rutas
  .map(r => ({
    ...r,
    short_name: (r.short_name || "").trim().toUpperCase(),
    long_name: (r.long_name || "").toUpperCase(),
    carretera: (r.carretera || "").toUpperCase(),
    color: (r.color || "").toUpperCase()
  }))
  // 🔍 Luego filtramos lo que queremos conservar
 .filter(r => {
  const { short_name: sn, long_name: ln, carretera: car, color } = r;

  // 🚫 Quitar 182 y 185 de N1
  if (car === "N1" && ["182", "185"].includes(sn)) return false;

  if (car !== "N1") return true;

  // 💚 Forzar que las 182 y 185 siempre se conserven (interurbanas verdes)
  if (car === "N1" && /^18[0-9]/.test(sn)) {
    r.color = "78BE20"; // verde interurbano
    return true;
  }

  // ❤️ Mantener solo la L5 (El Soto - La Moraleja)
  const esMoraleja = sn === "5" && (ln.includes("MORALEJA") || ln.includes("SOTO"));
  if (esMoraleja) {
    r.color = "E60003";
    r.long_name = "Urb El Soto La Moraleja";
    return true;
  }

  // 💚 Mantener interurbanas verdes (151–199)
 // 💚 Mantener interurbanas verdes (151–199 + excepciones 152C y 155B)
if (
  /^(15[1-9]|16[0-9]|17[0-9]|19[0-9])$/.test(sn) ||
  ["152C", "155B"].includes(sn)
) {
  r.color = "A8E05F"; // 🌿 verde claro definitivo
  return true;
}


  // 🚫 Eliminar cualquier otra roja urbana N1
  const esRoja =
    ["E60003", "FF0000", "C00000", "D60003"].includes(color) ||
    ln.includes("URB") ||
    ln.includes("ALCOBENDAS") ||
    ln.includes("COLMENAR") ||
    ln.includes("S.S.") ||
    ln.includes("REYES") ||
    ln.includes("CIRCULAR");

  if (esRoja) {
    console.log("🧹 Eliminando roja N1:", sn, ln);
    return false;
  }

  return true;
});


  console.log("🔍 Verificando la línea 5 N1 antes del filtrado final:");
console.table(
  uniqueRutas
    .filter(r => r.short_name === "5" && r.carretera === "N1")
    .map(r => ({
      id: r.route_id,
      long: r.long_name,
      color: r.color,
      shape: r.shape_id,
      pack: r.packId,
      hasShape: r.hasShape
    }))
);

// 🧾 Mostrar resumen final
console.table(
  uniqueRutas
    .filter(r => r.carretera === "N1")
    .map(r => ({
      packId: r.packId,
      short: r.short_name,
      long: r.long_name,
      color: r.color,
      carretera: r.carretera
    }))
);



  // 🔴 Líneas rojas válidas (solo circulares y excepciones)
// 🔴 Líneas rojas válidas (N1 + N2 + N3 + N4)
const lineasRojasValidas = [
  // N1
  "5", "6", "8", "9", "Circular Ciudalcampo",
  // N2
  "1A", "2", "3", "4", "5A", "6",
  // N3
  "1", "2", "4",
  // N4
  "2", "Circular Roja", "1", "CIRCULAR VEREDA DE LOS ESTUDIANTES-LA FORTUNA",
  "4", "6", "13",
  // N6 - Urbanas
  "Urbana Boadilla L1",
  "Urbana Boadilla L2",
  "Urbana Boadilla L3",
  "Urbana Boadilla L4",
  "Urbana Las Rozas L1",
  "Urbana Las Rozas L2",
  "Urbana San Lorenzo L1",
  "Urbana San Lorenzo L2",
  "Urbana El Escorial L3",
  "Urbana San Lorenzo L4"
];



  const splitShortName = (name = "") => {
    const match = name.match(/^(\d+)([A-Z]*)$/i);
    if (!match) return { num: NaN, suf: name };
    return { num: parseInt(match[1], 10), suf: match[2] || "" };
  };
  const compararLineas = (a, b) => {
    const sa = splitShortName(a.short_name);
    const sb = splitShortName(b.short_name);
    if (!isNaN(sa.num) && !isNaN(sb.num) && sa.num !== sb.num) return sa.num - sb.num;
    if (!isNaN(sa.num) && !isNaN(sb.num)) return sa.suf.localeCompare(sb.suf);
    return (a.short_name || "").localeCompare(b.short_name || "") ||
           (a.long_name || "").localeCompare(b.long_name || "");
  };

  // ✅ Solo circulares reales son rojas
// 👉 Detectamos solo las líneas rojas de N4
const esRojaN4 = (r) =>
  r.carretera === "N4" &&
  ["1", "2", "3", "4", "6", "13", "Circular Roja", "Circular Verde", "CIRCULAR VEREDA DE LOS ESTUDIANTES-LA FORTUNA"]
    .includes(r.short_name) || ["Circular Roja","Circular Verde","CIRCULAR VEREDA DE LOS ESTUDIANTES-LA FORTUNA"].includes(r.long_name);

const rojasN4 = uniqueRutas.filter(esRojaN4);
const resto = uniqueRutas.filter(r => !esRojaN4(r));

// 👉 orden manual exacto (tu orden 1→7)
const ordenN4 = [
  "1",   // 1. Fuenlabrada
  "2",   // 2. Fuenlabrada
  "Circular Roja", // 3. Fuenlabrada
  "CIRCULAR VEREDA DE LOS ESTUDIANTES-LA FORTUNA", // 1. Leganés
  "4",   // 4. Fuenlabrada
  "6",   // Cementerio
  "13"   // 13. Fuenlabrada
];

// 🧮 Orden numérico natural en N4
uniqueRutas = [
  ...rojasN4.sort((a, b) => {
    const numA = parseInt(a.short_name);
    const numB = parseInt(b.short_name);
    // Si ambos son números (1,2,3,4,6,13) → orden numérico
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    // Si uno es numérico y otro no, el numérico primero
    if (!isNaN(numA) && isNaN(numB)) return -1;
    if (isNaN(numA) && !isNaN(numB)) return 1;
    // Por texto si no son numéricos
    return (a.short_name || "").localeCompare(b.short_name || "");
  }),
  ...resto.sort(compararLineas)
];


// 📍 Lista de municipios únicos a partir de uniqueRutas
const municipiosUnicos = Array.from(
  new Set(uniqueRutas.map(r => r.municipio).filter(Boolean))
).sort();







// lista de códigos que tratamos como "rojo urbano"
const coloresUrbanos = ["FF0000", "E60003", "C00000", "D60003"];

// 🔴 función para decidir si es urbana
const esRoja = (route) => {
  const color = route.color?.toUpperCase() || "";
  const sn = (route.short_name || "").trim();
  const ln = (route.long_name || "").trim();

  return (
    coloresUrbanos.includes(color) ||
    lineasRojasValidas.includes(sn) ||
    lineasRojasValidas.includes(ln)
  );
};
const rutasFiltradas = uniqueRutas.filter(route => {
  const longName = normalize(route.long_name);
  const shortName = normalize(route.short_name);
  const carreteraNorm = normalize(route.carretera);
  const busqueda = normalize(search.trim());

  // 🚦 Clasificación mejorada
  const esUrbana = esRoja(route);
  const esInterurbana = !esRoja(route);

  // filtro por carretera
  if (selectedCarretera && carreteraNorm !== normalize(selectedCarretera)) return false;

  // filtro por tipo
  if (tipo === "urbana" && !esUrbana) return false;
  if (tipo === "interurbana" && !esInterurbana) return false;

  // filtro por municipio 👇
  if (municipioFiltro && route.municipio !== municipioFiltro) return false;

  // filtro por texto
  if (!busqueda) return true;
  return (
    longName.includes(busqueda) ||
    shortName.includes(busqueda) ||
    carreteraNorm.includes(busqueda)
  );
});

// 🔴 Quitar todas las rojas N1 excepto la 5
// 🔴 Quitar todas las rojas de N1 excepto la L5 de La Moraleja
// 🔴 Mantener solo la línea urbana 5 de La Moraleja en N1
// 🔴 Mantener solo la línea urbana 5 (El Soto – La Moraleja) y eliminar 1, 6, 9
const rutasFiltradasFinal = rutasFiltradas.filter(r => {
  const color = (r.color || "").toUpperCase();
  const sn = (r.short_name || "").trim();
  const ln = (r.long_name || "").toUpperCase();
  const car = (r.carretera || "").toUpperCase();

  // 🧹 En la N1 quitamos todas las rojas excepto la 5
  if (car === "N1" && ["E60003", "FF0000", "C00000", "D60003"].includes(color)) {
    // ✅ mantener solo la 5 de La Moraleja
    const esL5Moraleja =
      sn === "5" && (ln.includes("MORALEJA") || ln.includes("SOTO"));
    return esL5Moraleja;
  }

  // ✅ las demás (interurbanas verdes u otras carreteras) se conservan
  return true;
});








const handleSelect = (route) => {
  setSeleccionadas((prev) => {
    const exists = prev.find(
      (r) => r.route_id === route.route_id && r.packId === route.packId
    );
    if (exists) {
      return prev.filter(
        (r) => !(r.route_id === route.route_id && r.packId === route.packId)
      );
    } else {
      return [...prev, route];
    }
  });

  if (onSelectLine) {
    // 👉 Crear nombre base desde el diccionario
    const dic = nombresRojosPorCarretera[route.carretera] || {};
    const lnUpper = (route.long_name || "").toUpperCase().trim();
    const lnLower = (route.long_name || "").toLowerCase().trim();
    const sn = (route.short_name || "").trim();

    let nombrePersonalizado;

    // 💡 Caso especial: urbanas de Tres Cantos dentro de N1
    if (
      route.carretera === "N1" &&
      route.color?.toUpperCase() === "E60003" &&
      (
        lnUpper.includes("TRES CANTOS") ||
        lnUpper.includes("VIÑUELAS")
      )
    ) {
      const dicN1 = nombresRojosPorCarretera["N1"] || {};
      const keyMatch = Object.keys(dicN1).find(
        (k) => k.toUpperCase().trim() === lnUpper
      );
      if (dicN1[lnUpper]) {
        nombrePersonalizado = dicN1[lnUpper];
      } else if (keyMatch) {
        nombrePersonalizado = dicN1[keyMatch];
      }
    }

    // 🔍 Búsqueda general (insensible a mayúsculas y espacios)
    if (!nombrePersonalizado) {
      const keyMatch = Object.keys(dic).find(
        (k) => k.toUpperCase().trim() === lnUpper
      );
      nombrePersonalizado =
        dic[lnUpper] ||
        dic[lnLower] ||
        (keyMatch && dic[keyMatch]) ||
        dic[sn] ||
        route.long_name ||
        route.short_name;
    }

    // 🔧 Ajustes especiales para la M607
    if (route.carretera === "M607") {
      const ln = route.long_name.toUpperCase();

      if (route.short_name === "1" && ln.includes("CIRCULAR"))
        nombrePersonalizado = "1. Colmenar Viejo";
      if (route.short_name === "1" && ln.includes("VIÑUELAS"))
        nombrePersonalizado = "1. Tres Cantos";

      if (route.short_name === "2" && ln.includes("COLMENAR"))
        nombrePersonalizado = "2. Tres Cantos";

      if (route.short_name === "3" && ln.includes("SAN SEBASTIÁN"))
        nombrePersonalizado = "2. Tres Cantos";
      if (route.short_name === "3" && ln.includes("SOTO"))
        nombrePersonalizado = "3. Tres Cantos";
      if (route.short_name === "3" && ln.includes("RONDA OESTE"))
        nombrePersonalizado = "3. Colmenar Viejo";

      if (route.short_name === "4" && ln.includes("NUEVO TRES CANTOS"))
        nombrePersonalizado = "4. Tres Cantos";
      if (route.short_name === "4" && ln.includes("RONDA"))
        nombrePersonalizado = "3. Colmenar Viejo";

      if (route.short_name === "5" && ln.includes("ESTACIÓN"))
        nombrePersonalizado = "4. Tres Cantos";
      if (route.short_name === "5" && ln.includes("NUEVO TRES CANTOS"))
        nombrePersonalizado = "5. Tres Cantos";

      if (route.short_name === "6")
        nombrePersonalizado = "6. Colmenar Viejo";
    }

    // 🔧 Ajustes especiales para la N6 (Boadilla / Escorial / San Lorenzo)
    // 🟥 Renombrado y color para líneas urbanas de la N6
if ((route.carretera || "").toUpperCase().includes("N6")) {
  const ln = (route.long_name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // quita tildes

  const sn = (route.short_name || "").toLowerCase(); // short_name normalizado

  console.log("🧭 Detectado N6:", sn, ln);

  // 🟢 Inicialmente, todas las urbanas de la N6 → color rojo
  route.color = "E60003";

  // 🟢 BOADILLA DEL MONTE
// 🟥 BOADILLA DEL MONTE
if (ln.includes("boadilla")) {
  if (sn.includes("1")) nombrePersonalizado = "Urbana Boadilla L1";
  else if (sn.includes("2")) nombrePersonalizado = "Urbana Boadilla L2";
  else if (sn.includes("3")) nombrePersonalizado = "Urbana Boadilla L3";
  else if (sn.includes("4")) nombrePersonalizado = "Urbana Boadilla L4";
}

else if (ln.includes("rozas")) {
  if (sn.includes("1")) nombrePersonalizado = "Urbana Las Rozas L1";
  else if (sn.includes("2")) nombrePersonalizado = "Urbana Las Rozas L2";
}

else if (ln.includes("el escorial")) {
  if (sn.includes("3")) nombrePersonalizado = "Urbana El Escorial L3";
}

else if (ln.includes("san lorenzo")) {
  if (sn.includes("1")) nombrePersonalizado = "Urbana San Lorenzo L1";
  else if (sn.includes("2")) nombrePersonalizado = "Urbana San Lorenzo L2";
  else if (sn.includes("4")) nombrePersonalizado = "Urbana San Lorenzo L4";
}

// 👇 ESTA ES LA CLAVE
if (nombrePersonalizado) {
  route.long_name = nombrePersonalizado;
  route.nombrePersonalizado = nombrePersonalizado; // <--- NUEVA LÍNEA
  console.log("✅ Asignado:", sn, "→", nombrePersonalizado);
}


}


    // 🚀 Continuar con la selección
    onSelectLine({
      key: `${route.packId}-${route.route_id}`,
      base: route.base,
      routeId: route.route_id,
      shortName: route.short_name,
      longName: route.long_name,
      nombrePersonalizado, // 👈 ya con overrides N6 + M607 + N1 Tres Cantos
      color: `#${route.color}`,
      originalColor: `#${route.color}`,
      carretera: route.carretera,
    });
  }

  navigate(
    `/mapa?linea=${route.route_id}&pack=${route.packId}&base=${route.base}`
  );
};




return (
  <div style={{ fontSize: 14 }}>
    <input
      type="text"
      placeholder="Buscar línea..."
      value={search}
      onChange={e => setSearch(e.target.value)}
      style={{
        width: "100%",
        padding: 6,
        marginBottom: 12,
        borderRadius: 4,
        border: "1px solid #ccc"
      }}
    />

    <select
      value={selectedCarretera}
      onChange={(e) => setSelectedCarretera(e.target.value)}
      style={{
        width: "100%",
        padding: 6,
        marginBottom: 12,
        borderRadius: 4,
        border: "1px solid #ccc"
      }}
    >
        <option value="">Todas</option>
  <option value="M607">M607</option> {/* 👈 ahora la primera */}
  <option value="N1">N1</option>
  <option value="N2">N2</option>
  <option value="N3">N3</option>
  <option value="N4">N4</option>
  <option value="N5">N5</option>
  <option value="N6">N6</option>
    </select>

    {/*
<select
  value={municipioFiltro}
  onChange={(e) => setMunicipioFiltro(e.target.value)}
  style={{
    width: "100%",
    padding: 6,
    marginBottom: 12,
    borderRadius: 4,
    border: "1px solid #ccc"
  }}
>
  <option value="">Todos los municipios</option>
  {municipiosUnicos.map(m => (
    <option key={m} value={m}>{m}</option>
  ))}
</select>
*/}



   {/* 🔽 Filtro por tipo de línea */}
<label
  style={{
    fontSize: "12px",
    fontWeight: "bold",
    color: "#aaa",
    marginBottom: "4px",
    display: "block"
  }}
>
  Tipo de línea
</label>

<div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
  <button
    onClick={() => setTipo("")}
    style={{
      flex: 1,
      padding: "6px 10px",
      borderRadius: "9999px", // 👈 píldora
      border: "1px solid #ccc",
      background: tipo === "" ? "#2196F3" : "#f5f5f5",
      color: tipo === "" ? "#fff" : "#333",
      fontWeight: tipo === "" ? "bold" : "normal",
      cursor: "pointer",
      transition: "all 0.2s"
    }}
  >
    Todas
  </button>

  <button
    onClick={() => setTipo("urbana")}
    style={{
      flex: 1,
      padding: "6px 10px",
      borderRadius: "9999px",
      border: "1px solid #ccc",
      background: tipo === "urbana" ? "#E53935" : "#f5f5f5",
      color: tipo === "urbana" ? "#fff" : "#333",
      fontWeight: tipo === "urbana" ? "bold" : "normal",
      cursor: "pointer",
      transition: "all 0.2s"
    }}
  >
    Urbanas
  </button>

  <button
    onClick={() => setTipo("interurbana")}
    style={{
      flex: 1,
      padding: "6px 10px",
      borderRadius: "9999px",
      border: "1px solid #ccc",
      background: tipo === "interurbana" ? "#43A047" : "#f5f5f5",
      color: tipo === "interurbana" ? "#fff" : "#333",
      fontWeight: tipo === "interurbana" ? "bold" : "normal",
      cursor: "pointer",
      transition: "all 0.2s"
    }}
  >
    Interurbanas
  </button>
</div>




    <button
      onClick={() => {
        setSearch("");
        setSelectedCarretera("");
        if (onSelectLine) onSelectLine(null);
        navigate("/mapa");
      }}
      style={{
        width: "100%", padding: 6, marginBottom: 12,
        borderRadius: 4, border: "1px solid #ccc",
        backgroundColor: "#f44336", color: "white", cursor: "pointer"
      }}
    >
      Borrar filtros
    </button>

    {rutasFiltradasFinal.map(route => {
  // 💚 Forzamos verde para las interurbanas M607
  let colorHex = `#${route.color}`;
  const snNum = parseInt(route.short_name);

  if (
    route.carretera === "M607" &&
    (
      ["913"].includes(route.short_name) ||
      (snNum >= 720 && snNum <= 727)
    )
  ) {
    colorHex = "#A8E05F" ;
  }


      // 🔴 Líneas rojas válidas (N1 + N2 + N3)
      

      const esRoja =
  lineasRojasValidas.includes(route.short_name) ||
  lineasRojasValidas.includes(route.long_name);


      // 📌 Diccionario por carretera
    


  
      // 🚫 Evitar que la 6 de Alcobendas se cuele fuera de N1
const sn = (route.short_name || "").trim();
const ln = (route.long_name || "").toLowerCase();

// 🔧 Control especial para las líneas "6"
if (sn === "6") {
  if (ln.includes("alcobendas")) {
    route.carretera = "N1";
  } else if (ln.includes("oasiz")) {
    route.carretera = "N2";
  } else if (ln.includes("cementerio")) {
    route.carretera = "N4";
  } else if (ln.includes("guadarrama")) {
    route.carretera = "N5";
  }
}


      const nombrePersonalizado =
  nombresRojosPorCarretera[route.carretera]?.[route.short_name] ||
  nombresRojosPorCarretera[route.carretera]?.[route.long_name?.toUpperCase()] ||
  nombresRojosPorCarretera[route.carretera]?.[route.long_name?.toLowerCase()] ||
  route.long_name;




      return (
        <div
          key={`${route.packId}-${route.route_id}`}
          onClick={() => handleSelect(route)}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: "4px 8px",
            borderRadius: 4,
            background: "#f9f9f9",
            marginBottom: 4,
            border: "1px solid #eee"
          }}
        >
          <div
  style={{
    // 💚 Forzar color verde para interurbanas M607 (720–727 y 913)
backgroundColor:
  esRoja
    ? "#FF0000"
    : route.carretera === "M607" &&
      (
        ["913"].includes(route.short_name) ||
        (parseInt(route.short_name) >= 720 && parseInt(route.short_name) <= 727)
      )
    ? "#A8E05F" 
    : `#${route.color}`,

    color: "#fff",
    fontWeight: "bold",
    borderRadius: 4,
    padding: "2px 6px",
    marginRight: 8,
    minWidth: 24,
    textAlign: "center"
  }}
>
  {/* Siempre mostramos solo el número base (sin sufijo raro) */}
  {route.short_name.split("_")[0]}
</div>
<span>
  {esRoja
    ? `Urb ${nombrePersonalizado}`
    : route.carretera === "M607" &&
      (
        ["913"].includes(route.short_name) ||
        (parseInt(route.short_name) >= 720 && parseInt(route.short_name) <= 727)
      )
    ? `${nombrePersonalizado}` // 👈 sin "Inter."
    : nombrePersonalizado}
</span>




        </div>
      );
    })}

    {rutasFiltradas.length === 0 && (
      <div style={{ color: "#777", fontSize: 13 }}>No hay líneas disponibles.</div>
    )}
  </div>
);
}
