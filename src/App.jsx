import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MapView from "./components/MapView.jsx";
import LineSelector from "./components/LineSelector.jsx";
import LineFromGTFS from "./components/LineFromGTFS.jsx";
import Splash from "./Splash.jsx";
import "./index.css";

// Base fija
const BASE_CARRETERAS = [
  { value: "", label: "Todas" },
  { value: "M607", label: "M607 (Colmenar + 129)" },
  { value: "N1", label: "N1 (Paquete 001 + 076)" },
  { value: "N2", label: "N2 (Paquete 009 + 076)" },
  { value: "N3", label: "N3" },
  { value: "N4", label: "N4" },
  { value: "N5", label: "N5" },
  { value: "N6", label: "N6" },
];

export default function App() {
  // 🧩 Estado general
  const [showSplash, setShowSplash] = useState(true);
  const [selected, setSelected] = useState([]);
  const [carreteraSeleccionada, setCarreteraSeleccionada] = useState("");
  const [carreteras, setCarreteras] = useState(BASE_CARRETERAS);
  const [showSelected, setShowSelected] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // ⏱️ Control del splash
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // 🚀 Restaurar selección si hay parámetro en URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const lineasParam = params.get("lineas");

    if (lineasParam) {
      const items = lineasParam
        .split(",")
        .map((l) => {
          const [pack, routeId] = l.split(":");
          if (!pack || !routeId) return null;
          return {
            key: `${pack}-${routeId}`,
            base: `/gtfs/${pack}`,
            routeId,
            shortName: routeId,
            longName: "",
            color: "#F39400",
            carretera: "Otras",
          };
        })
        .filter(Boolean);

      if (items.length > 0) {
        setSelected(items);
      }
    }
  }, [location.search]);

  // 📦 Comprobación dinámica de carreteras (N2, N4)
  useEffect(() => {
    const checkCarreteras = async () => {
      try {
        const resultados = await Promise.all([
          fetch("/gtfs/index-n2.json?v=20250814").then((r) => r.json()).catch(() => null),
          fetch("/gtfs/index-n4.json?v=20250814").then((r) => r.json()).catch(() => null),
        ]);

        const [dataN2, dataN4] = resultados;

        setCarreteras((prev) => {
          let nueva = [...prev];
          if (Array.isArray(dataN2) && dataN2.length > 0 && !nueva.some((o) => o.value === "N2")) {
            nueva.push({ value: "N2", label: "N2" });
          }
          if (Array.isArray(dataN4) && dataN4.length > 0 && !nueva.some((o) => o.value === "N4")) {
            nueva.push({ value: "N4", label: "N4" });
          }
          return nueva;
        });
      } catch (e) {
        console.error("Error comprobando index-n2/n4", e);
      }
    };

    checkCarreteras();
  }, []);

  // 📍 Selección de línea
  const onSelectLine = (item) => {
    if (item === null) {
      setSelected([]);
      return;
    }

    setSelected((prev) => {
      const exists = prev.some((p) => p.key === item.key);
      if (exists) return prev.filter((p) => p.key !== item.key);

      const color = "#F39400"; // Naranja corporativo
      return [
        ...prev,
        {
          key: item.key,
          base: item.base,
          routeId: item.routeId,
          shortName: item.shortName,
          longName: item.longName || item.long_name || "",
          nombrePersonalizado: item.nombrePersonalizado || "",
          color,
          carretera: item.carretera || "Otras",
        },
      ];
    });
  };

  // 🧩 Agrupar seleccionadas
  const groupedSelected = selected.reduce((acc, item) => {
    const key = item.carretera || "Otras";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  // 📤 Compartir selección
  const compartirSeleccion = () => {
    if (!selected.length) {
      alert("No hay líneas seleccionadas");
      return;
    }
    const lineasParam = selected.map((s) => `${s.base.split("/").pop()}:${s.routeId}`).join(",");
    const url = `${window.location.origin}/mapa?lineas=${lineasParam}`;
    navigator.clipboard.writeText(url);
    alert("Enlace copiado 📋\n" + url);
  };

  // 🎬 Renderizado principal (Splash o App)
  return (
    <>
      {showSplash ? (
        <Splash onFinish={() => setShowSplash(false)} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", height: "100vh" }}>
          {/* 🧭 Panel lateral */}
          <aside style={{ borderRight: "1px solid #e5e7eb", overflow: "auto", background: "#111" }}>
            <h2 style={{ padding: "12px", color: "white" }}>Selecciona tu línea</h2>

            {/* 🔽 Selector de líneas seleccionadas */}
            <div style={{ padding: "0 12px 12px" }}>
              <button
                onClick={() => setShowSelected((prev) => !prev)}
                style={{
                  width: "100%",
                  padding: 6,
                  borderRadius: 4,
                  border: "1px solid #444",
                  backgroundColor: "#333",
                  color: "white",
                  cursor: "pointer",
                  marginBottom: 8,
                }}
              >
                {showSelected ? "▼ Seleccionadas" : "► Seleccionadas"} ({selected.length})
              </button>

              {showSelected && (
                <div
                  style={{
                    fontSize: 13,
                    color: "#eee",
                    maxHeight: "220px",
                    overflowY: "auto",
                    border: "1px solid #444",
                    borderRadius: 4,
                    padding: 8,
                    backgroundColor: "#222",
                  }}
                >
                  {selected.length === 0 && <div>Ninguna</div>}
                  {selected.length > 0 && (
                    <button
                      onClick={() => {
                        setSelected([]);
                        navigate("/mapa", { replace: true });
                      }}
                      style={{
                        width: "100%",
                        padding: 6,
                        borderRadius: 4,
                        border: "1px solid #444",
                        backgroundColor: "#b91c1c",
                        color: "white",
                        cursor: "pointer",
                        marginBottom: 10,
                      }}
                    >
                      🗑️ Quitar todas
                    </button>
                  )}

                  {Object.entries(groupedSelected).map(([carretera, items]) => (
                    <div key={carretera} style={{ marginBottom: 10 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4, color: "#f0ad4e" }}>
                        {carretera} ({items.length})
                      </div>
                      {items.map((s) => (
                        <div
                          key={`pill-${s.key}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 6,
                          }}
                        >
                          <span>
                            <strong style={{ fontWeight: 700, marginRight: 4 }}>
                              {s.shortName}.
                            </strong>
                            {s.nombrePersonalizado?.replace(/^\d+\.\s*/, "") ||
                              s.longName ||
                              s.shortName}
                          </span>

                          <button
                            onClick={() =>
                              setSelected((prev) => prev.filter((p) => p.key !== s.key))
                            }
                            style={{
                              marginLeft: "auto",
                              border: "1px solid #666",
                              padding: "2px 6px",
                              borderRadius: 4,
                              cursor: "pointer",
                              background: "#444",
                              color: "white",
                            }}
                          >
                            Quitar
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 💚 Total seleccionadas */}
            <div
              style={{
                marginTop: 10,
                padding: "6px 10px",
                borderRadius: 6,
                backgroundColor: "#064e3b",
                color: "#bbf7d0",
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              Total seleccionadas: {selected.length}
            </div>

            {/* 📤 Botón compartir */}
            <div style={{ padding: "0 12px 12px" }}>
              <button
                onClick={compartirSeleccion}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #444",
                  backgroundColor: "#2196F3",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                📤 Compartir URL
              </button>
            </div>

            {/* 🚌 Selector de líneas */}
            <div style={{ padding: "0 12px 12px" }}>
              <LineSelector onSelectLine={onSelectLine} carretera={carreteraSeleccionada} />
            </div>
          </aside>

          {/* 🗺️ Mapa principal */}
          <section>
            <MapView
              lastSelected={selected[selected.length - 1]}
              onLineaFromURL={({ linea, pack, base }) => {
                setSelected((prev) => {
                  const key = `${pack}-${linea}`;
                  if (prev.some((p) => p.key === key)) return prev;
                  return [
                    ...prev,
                    {
                      key,
                      base,
                      routeId: linea,
                      shortName: linea,
                      longName: "",
                      color: "#F39400",
                      carretera: "Otras",
                    },
                  ];
                });
              }}
            >
              {selected.map((s) => (
                <LineFromGTFS
                  key={s.key}
                  base={s.base}
                  routeId={s.routeId}
                  shortName={s.shortName}
                  longName={s.longName}
                  color="#F39400"
                />
              ))}
            </MapView>
          </section>
        </div>
      )}
    </>
  );
}
