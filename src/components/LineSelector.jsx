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
    "5": "5. El Soto la Moraleja",
    "6": "6. Alcobendas",
    "8": "8. Ciudalcampo",
    "9": "9. Alcobendas",
    "Circular Ciudalcampo": "8. Ciudalcampo"
  },
  N2: {
    "1A": "1. Torrejón de Ardoz",
    "2": "2. Torrejón de Ardoz",
    "3": "3. Torrejón de Ardoz",
    "4": "4. Torrejón de Ardoz",
    "5A": "5. Torrejón de Ardoz",
    "6": "6. Torrejón de Ardoz"
  },
  N3: {
    "1": "1. Arganda",
    "RESIDENCIA-LA POVEDA": "1. Arganda",
    "2": "2. Arganda",
    "4": "4. Arganda"
  },
    N4: {
    "2": "2. Fuenlabrada",
    "circular roja": "3. Fuenlabrada",
    "parque miraflores - polígono sevilla": "1. Fuenlabrada",
    "1 leganes": "1. Leganés",
    "circular vereda de los estudiantes-la fortuna": "1. Leganés",
    "4": "4. Fuenlabrada",
    "6": "6. Cementerio",
    "13": "13. Fuenlabrada"
  },

  N5: {
    "LA DEHESA-EL PINAR": "1. Navalcarnero",
    "LAS CUMBRES-ESTACIÓN FFCC": "1. Móstoles",
    "PUERTA DEL SUR - FUENTE CISNEROS": "1. Alcorcón",
    "1A": "1A. Arroyomolinos",
    "MÓSTOLES (Pradillo)-CEMENTERIO": "2. Móstoles",
    "ONDARRETA-PRADO STO DOMINGO": "2. Alcorcón",
    "ALCORCÓN CENTRAL - PARQUE EL LUCERO": "3. Alcorcón",
    "POLÍGONO INDUSTRIAL LAS NIEVES-MÓSTOLES PRADILLO": "3. Móstoles",
    "MÓSTOLES SUR - MÓSTOLES (HOSPITAL REY JUAN CARLOS)": "4. Móstoles",
    "MOSTOLES (Estación FF.CC.) - PARQUE COIMBRA": "5. Móstoles",
    "UNIVERSIDAD REY JUAN CARLOS-URB. P.GUADARRAMA": "6. Móstoles"
  },

  N6: {
  // 👉 Boadilla del Monte
  "1_boadilla": "1. Boadilla del Monte",
  "2_boadilla": "2. Boadilla del Monte",
  "3_boadilla": "3. Boadilla del Monte",
  "5_boadilla": "5. Boadilla del Monte",

  // 👉 El Escorial
  "1_escorial": "1. El Escorial",
  "2_escorial": "2. El Escorial",
  "3_escorial": "3. El Escorial",

  // 👉 San Lorenzo del Escorial
  "4_sanlorenzo": "4. San Lorenzo del Escorial"
},

  

   M607: {
  "CIRCULAR COLMENAR VIEJO": "1. Colmenar Viejo",
  "FFCC-AVENIDA VIÑUELAS-AVENIDA COLMENAR-FFCC": "1. Tres Cantos",
  "FFCC-AVENIDA COLMENAR-AVENIDA VIÑUELAS-FFCC": "2. Tres Cantos",
  "SAN SEBASTIÁN - ESTACIÓN FF.CC.": "3. Colmenar Viejo",
  "SOTO DE VIÑUELAS-TRES CANTOS FFCC-SOTO DE VIÑUELAS": "3. Tres Cantos",
  "RONDA OESTE - FF.CC.": "4. Colmenar Viejo",
  "NUEVO TRES CANTOS - TRES CANTOS FF.CC.": "4. Tres Cantos",
  "ESTACIÓN FF.CC. - SAN SEBASTIÁN (CIRCULAR)": "5. Colmenar Viejo",
  "NUEVO TRES CANTOS - AV. VIÑUELAS": "5. Tres Cantos",
  "ESTACIÓN FF.CC. - OLIVAR": "6. Colmenar Viejo"
}


  
};






    useEffect(() => {
      fetch("/gtfs/index.json")
        .then(res => res.json())
        .then(data => {
          let packs = data.packages || [];

        // 🔧 Tu lógica de carreteras
        packs = packs.map(pack => {
         if (pack.id === "paquete_001") {
  // 👇 listado de líneas que realmente pertenecen a la N1
  const rutasValidasN1 = [
    "3", "5", "6", "8", "9",
    "151", "152", "153", "154", "155", "156", "157","263"
    // añade aquí el resto de suburbanas de la N1
  ];

  const rutasModificadas = pack.routes
    .filter(r => rutasValidasN1.includes(r.short_name))
    .map(r => ({ ...r, carretera: "N1" }));

  // añadir manualmente la Circular Ciudalcampo si no estuviera
  

  return { ...pack, routes: rutasModificadas, carretera: "N1" };
}

if (pack.id === "paquete_027") {
  const rutasModificadas = pack.routes.map(route => {
    if (route.short_name === "8") {
      return {
        ...route,
        carretera: "N1",         // 👈 la metemos en N1
        color: "FF0000",         // rojo como las demás circulares
        long_name: "Circular Ciudalcampo"
      };
    }
    if (route.short_name === "171") {
      return { ...route, carretera: "N1" }; // 👈 el 171 también es N1
    }
    return route;
  });

  return { ...pack, routes: rutasModificadas, carretera: "N1" };
}



if (pack.id === "paquete_076") {
  const rutasN1 = ["191", "193", "194", "195", "196", "197", "199A", "263"];

  const rutasModificadas = pack.routes.map(route => {
    const sn = (route.short_name || "").trim();
    const ln = (route.long_name || "").trim();

    // 🚍 N1
    if (rutasN1.includes(sn)) {
      return { ...route, carretera: "N1" };
    }

    // ✅ excepción: la 6 de Torrejón (Oasiz) siempre en N2
    if (sn === "6" && ln.toLowerCase().includes("oasiz")) {
      return { ...route, carretera: "N2" };
    }

    // 🚍 El resto se asignan como N2 según regex
    if (/^(1A|2|3|4|5A|824|210|211|212|215|220|222|223|224|226|227|229|231|232|250|251|252|254|255|256|260|261)[A-Z]?$/i.test(sn)) {
      
      // 🚫 excluir la "2" de Urb. Berrocales
      if (sn === "2" && ln.toLowerCase().includes("berrocales")) {
        return route;
      }

      // 🚫 excluir la 224A
      if (sn === "224A") {
        return route;
      }

      return { ...route, carretera: "N2" };
    }

    return route;
  });

  return { ...pack, routes: rutasModificadas };
}





          if (pack.id === "paquete_180") {
            const rutasModificadas = pack.routes.map(route => {
              if (/^(824|210|211|212|215|220|222|223|224|226|227|229|231|232|250|251|252|254|255|256)[A-Z]?$/i.test(route.short_name)) {
                return { ...route, carretera: "N2" };
              }
              return route;
            });
            return { ...pack, routes: rutasModificadas };
          }

          if (pack.id === "paquete_009") {
            const n3Regex009 = /^(1|2|3|4|312|313|320|321|322|326)$/i;
            const n2Regex009 = /^(260|261)$/i;
            const rutasModificadas = pack.routes.map(route => {
              const sn = route.short_name?.trim() || "";
              if (n3Regex009.test(sn)) return { ...route, carretera: "N3" };
              if (n2Regex009.test(sn)) return { ...route, carretera: "N2" };
              return route;
            });
            return { ...pack, routes: rutasModificadas };
          }

          if (pack.id === "paquete_050") {
            const n3Regex050 = /^(350A|350B|350C|351|352|353|355)$/i;
            const rutasModificadas = pack.routes.map(route => {
              if (n3Regex050.test(route.short_name || "")) return { ...route, carretera: "N3" };
              return route;
            });
            return { ...pack, routes: rutasModificadas };
          }

          // ✅ N4: paquete_024 y 402
          // 🚍 N4
if (pack.id === "paquete_024") {
  const rutasValidasN4 = ["421","422","423","424","425","426","427","428","429"];

  const rutasModificadas = pack.routes
    .filter(route => rutasValidasN4.includes(route.short_name))
    .map(route => ({ ...route, carretera: "N4" }));

  return { ...pack, routes: rutasModificadas, carretera: "N4" };
}

if (pack.id === "402") {
  const rutasModificadas = pack.routes.map(route => ({ ...route, carretera: "N4" }));
  return { ...pack, routes: rutasModificadas, carretera: "N4" };
}

if (pack.id === "miraflores") {
  const rutasModificadas = pack.routes.map(route => ({ ...route, carretera: "N4" }));
  return { ...pack, routes: rutasModificadas, carretera: "N4" };
}

if (pack.id === "paquete_008") {
  const rutasN4 = [
    "1","480","481","482","483","484","485","486","487","488",
    "491","492","493","496","497"
  ];

  const rutasN5 = ["495","498","498A","499","1A"];  // 👈 añade 1A y 1B aquí

  const rutasModificadas = pack.routes.map(route => {
    const sn = (route.short_name || "").trim().toUpperCase();

    if (rutasN4.includes(sn)) {
      return { ...route, carretera: "N4" };
    }
    if (rutasN5.includes(sn)) {
      return { ...route, carretera: "N5" };
    }

    return route; // si no coincide, no lo tocamos
  });

  return { ...pack, routes: rutasModificadas };
}



if (["circular-roja", "circularverde", "cementerio", "seseña", "fuenlabradacentral"].includes(pack.id)) {
  const rutasModificadas = pack.routes.map(route => ({
    ...route,
    carretera: "N4",
    // 👇 unificamos el color al mismo verde de N4 suburbanas
    color: "8EBF42"
  }));
  return { ...pack, routes: rutasModificadas, carretera: "N4" };
}


if (pack.id === "loranca") {
  const rutasModificadas = pack.routes.map(route => ({ ...route, carretera: "N4" }));
  return { ...pack, routes: rutasModificadas, carretera: "N4" };
}

if (pack.id === "cementerio") {
  const rutasModificadas = pack.routes.map(route => ({
    ...route,
    carretera: "N4",              // 🚍 lo asignamos a N4
    long_name: "Cementerio",
    color: "FF0000"
  }));
  return { ...pack, routes: rutasModificadas, carretera: "N4" };
}



if (pack.id === "N4_virtual") {
  const rutasModificadas = pack.routes.map(route => ({ ...route, carretera: "N4" }));
  return { ...pack, routes: rutasModificadas, carretera: "N4" };
}



          if (pack.id === "N2_virtual") {
            const rutasModificadas = pack.routes.map(route => ({ ...route, carretera: "N2" }));
            return { ...pack, routes: rutasModificadas, carretera: "N2" };
          }

          if (pack.id === "N3_virtual") {
            const rutasModificadas = pack.routes.map(route => ({ ...route, carretera: "N3" }));
            return { ...pack, routes: rutasModificadas, carretera: "N3" };
          }

          if (pack.id === "N4_virtual") {
            const rutasModificadas = pack.routes.map(route => ({ ...route, carretera: "N4" }));
            return { ...pack, routes: rutasModificadas, carretera: "N4" };
          }

         // ✅ N5 - todas las rutas que indicaste
// ✅ N5 - todas las rutas que indicaste
if (["paquete_034", "paquete_038", "paquete_008", "paquete_043", "paquete_026", "N5_virtual"].includes(pack.id)) {
  const normalizeCode = (code) =>
    String(code || "").trim().toUpperCase().replace(/[^0-9A-Z]/g, "");

  const rutasValidasN5 = [
    // 🔴 Rojas de N5 (Móstoles)
    "1","2","3","4","5","6",
    // 🚍 Suburbanas N5
    "510","510A","511","512","513","514","516","517","518","519","519B",
    "520","521","522","523","524","526","527","528","529","530","531",
    "531A","532","534","539",
    // 🚍 Extra
    "1A","1B",
    "495","498","498A","499",
    "541","545","546","547","548",
    "581"
  ].map(normalizeCode);

  const rutasFiltradas = (pack.routes || []).filter(route => {
    const sn = normalizeCode(route.short_name || "");
    const ln = (route.long_name || "").toUpperCase();

    // ❌ excluir "1 LAS ROZAS - MOLINO DE LA HOZ"
    if (sn === "1" && ln.includes("MOLINO DE LA HOZ")) return false;

    // ❌ excluir "2 LAS ROZAS - EL ENCINAR"
    if (pack.id !== "paquete_026" && sn === "2" && ln.includes("ENCINAR")) return false;


    return rutasValidasN5.includes(sn);
  });

  const rutasModificadas = rutasFiltradas.map(route => ({
    ...route,
    carretera: "N5"
  }));

  return { ...pack, routes: rutasModificadas, carretera: "N5" };
}

if (["paquete_004", "paquete_026", "paquete_039"].includes(pack.id)) {
  const rutasModificadas = pack.routes.map(route => {
    const sn = (route.short_name || "").trim();
    const ln = (route.long_name || "").toUpperCase();

    // 👇 Duplicamos short_name con sufijo para diferenciar

    // 🟢 Línea 1
    if (sn === "1" && ln.includes("ESCORIAL")) {
      return { ...route, carretera: "N6", short_name: "1_escorial" };
    }
    if (sn === "1" && ln.includes("BOADILLA")) {
      return { ...route, carretera: "N6", short_name: "1_boadilla" };
    }
    if (sn === "1" && ln.includes("PASEO DE MADRID-OLIVAR-PARQUE-LAS LOMAS")) {
      return { ...route, carretera: "N6", short_name: "1_boadilla" };
    }

    // 🟢 Línea 2
    if (sn === "2" && ln.includes("ESCORIAL")) {
      return { ...route, carretera: "N6", short_name: "2_escorial" };
    }
    if (sn === "2" && ln.includes("BOADILLA")) {
      return { ...route, carretera: "N6", short_name: "2_boadilla" };
    }

    // 🟢 Línea 3
    if (sn === "3" && ln.includes("ESCORIAL")) {
      return { ...route, carretera: "N6", short_name: "3_escorial" };
    }
    if (sn === "3" && ln.includes("BOADILLA")) {
      return { ...route, carretera: "N6", short_name: "3_boadilla" };
    }

    // 🟢 Línea 5
    if (sn === "5" && ln.includes("BOADILLA")) {
      return { ...route, carretera: "N6", short_name: "5_boadilla" };
    }

    // 🟢 Línea 4
    if (sn === "4" && ln.includes("SAN LORENZO")) {
      return { ...route, carretera: "N6", short_name: "4_sanlorenzo" };
    }

    // ⚪ Si no coincide ningún caso especial, solo le marcamos carretera N6
    return { ...route, carretera: "N6" };
  });

  return { ...pack, routes: rutasModificadas, carretera: "N6" };
}






          // ✅ M607: paquete_129 con overrides oficiales
          // ✅ M607: paquete_129 con overrides oficiales
// ✅ M607: Colmenar Viejo y Tres Cantos
// ✅ M607: Colmenar Viejo y Tres Cantos
if (pack.id === "colmenar") {
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

  const rutasModificadas = pack.routes
    .filter(route => !(route.short_name || "").startsWith("N")) // 👈 excluye N701
    .map(route => {
      const short = (route.short_name || "").trim();
      const overrideName = rutasM607[short];
      if (overrideName) {   
        return {
          ...route,
          carretera: "M607",
          long_name: overrideName,
          color: "78BE20"
        };
      }
      return { ...route, carretera: "M607" };
    });

  return { ...pack, routes: rutasModificadas, carretera: "M607" };
}



          return pack;
        }); 

        // 🔽 Extra N4: Circular Colmenar
                // ✅ quitamos la inyección manual de "Circular Colmenar Viejo"
        setPackages(packs);
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
  "4", "6", "13"
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

uniqueRutas = [
  ...rojasN4.sort((a, b) => {
    const aKey = ordenN4.find(k => k === a.short_name || k === a.long_name);
    const bKey = ordenN4.find(k => k === b.short_name || k === b.long_name);
    return ordenN4.indexOf(aKey) - ordenN4.indexOf(bKey);
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
    let nombrePersonalizado =
      nombresRojosPorCarretera[route.carretera]?.[route.short_name] ||
      nombresRojosPorCarretera[route.carretera]?.[route.long_name?.toUpperCase()] ||
      nombresRojosPorCarretera[route.carretera]?.[route.long_name?.toLowerCase()] ||
      route.long_name ||
      route.short_name;

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
    if (route.carretera === "N6") {
      const ln = (route.long_name || "").toLowerCase();

      if (route.short_name === "1" && ln.includes("boadilla"))
        nombrePersonalizado = "1. Boadilla del Monte";
      if (route.short_name === "1" && ln.includes("escorial"))
        nombrePersonalizado = "1. El Escorial";

      if (route.short_name === "2" && ln.includes("boadilla"))
        nombrePersonalizado = "2. Boadilla del Monte";
      if (route.short_name === "2" && ln.includes("escorial"))
        nombrePersonalizado = "2. El Escorial";

      if (route.short_name === "3" && ln.includes("boadilla"))
        nombrePersonalizado = "3. Boadilla del Monte";
      if (route.short_name === "3" && ln.includes("escorial"))
        nombrePersonalizado = "3. El Escorial";

      if (route.short_name === "4" && ln.includes("san lorenzo"))
        nombrePersonalizado = "4. San Lorenzo del Escorial";

      if (route.short_name === "5" && ln.includes("boadilla"))
        nombrePersonalizado = "5. Boadilla del Monte";
    }

    onSelectLine({
      key: `${route.packId}-${route.route_id}`,
      base: route.base,
      routeId: route.route_id,
      shortName: route.short_name,
      longName: route.long_name,
      nombrePersonalizado, // 👈 ya con overrides N6 + M607
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
      <option value="N1">N1</option>
      <option value="N2">N2</option>
      <option value="N3">N3</option>
      <option value="N4">N4</option>
      <option value="N5">N5</option>
      <option value="N6">N6</option>
      <option value="M607">M607</option>
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

    {rutasFiltradas.map(route => {
      const colorHex = `#${route.color}`;

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
    backgroundColor: esRoja ? "#FF0000" : `#${route.color}`,
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
  {esRoja ? `Urb ${nombrePersonalizado}` : nombrePersonalizado}
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
