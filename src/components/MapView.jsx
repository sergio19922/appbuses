import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { useLocation } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import * as turf from '@turf/turf';

export default function MapView({ children, onLineaFromURL, lineaCoords }) {
  const MAX_BOUNDS = [
    [39.90, -4.60],
    [41.20, -3.10],
  ];

  const location = useLocation();
  const alreadyLoaded = useRef(false);

  // 🔹 Estado de geolocalización
  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [tracking, setTracking] = useState(false);

  // 🔹 Estado de distancia a la línea
  const [distancia, setDistancia] = useState(null);

  // 🚀 Restaurar desde URL solo 1 vez
  useEffect(() => {
    if (alreadyLoaded.current) return;
    const params = new URLSearchParams(location.search);
    const lineaParam = params.get('linea');
    const packParam = params.get('pack');
    const baseParam = params.get('base');

    if (lineaParam && onLineaFromURL) {
      onLineaFromURL({ linea: lineaParam, pack: packParam, base: baseParam });
      alreadyLoaded.current = true;
    }
  }, [location, onLineaFromURL]);

  // 🔹 Activar geolocalización
  const startGeolocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocalización no soportada en este navegador");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const userPos = [pos.coords.latitude, pos.coords.longitude];
        setPosition(userPos);
        setAccuracy(pos.coords.accuracy);

        // ✅ Si tenemos línea seleccionada, calcular distancia
        if (lineaCoords && lineaCoords.length > 0) {
          try {
            const point = turf.point([userPos[1], userPos[0]]); // lon, lat
            const line = turf.lineString(
              lineaCoords.map(([lat, lon]) => [lon, lat]) // lon, lat
            );
            const d = turf.pointToLineDistance(point, line, { units: 'meters' });
            setDistancia(Math.round(d));
          } catch (e) {
            console.error("Error calculando distancia:", e);
          }
        }
      },
      (err) => console.error("Error geolocalización", err),
      { enableHighAccuracy: true }
    );

    setWatchId(id);
    setTracking(true);
  };

  // 🔹 Desactivar geolocalización
  const stopGeolocation = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setPosition(null);
    setAccuracy(null);
    setTracking(false);
    setDistancia(null);
  };

  // 🔹 Icono azul para tu ubicación
  const userIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      {/* Botón de geolocalización */}
      <button
        onClick={tracking ? stopGeolocation : startGeolocation}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 1000,
          background: tracking ? "#b91c1c" : "#2563eb",
          color: "white",
          padding: "12px",
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          fontSize: 20,
          lineHeight: "1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        title={tracking ? "Desactivar geolocalización" : "Activar geolocalización"}
      >
        {tracking ? "✖" : "📍"}
      </button>

      {/* 🔹 Distancia a la línea */}
      {distancia !== null && (
        <div
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            background: "white",
            padding: "10px 16px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            fontWeight: "bold",
            fontSize: "14px",
            zIndex: 1000
          }}
        >
          🚏 Distancia a la línea:{" "}
          <span style={{ color: "red" }}>{distancia} m</span>
        </div>
      )}

      {/* Mapa */}
      <MapContainer
        style={{ height: '100%', width: '100%' }}
        center={[40.4168, -3.7038]}
        zoom={12}
        minZoom={11}
        maxZoom={22}
        maxBounds={MAX_BOUNDS}
        maxBoundsViscosity={1.0}
        preferCanvas
        scrollWheelZoom
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={22}
          noWrap
        />

        {/* Marcador de ubicación */}
        {position && (
          <>
            <Marker position={position} icon={userIcon}>
              <Popup>
                📍 Estás aquí
                {accuracy && <div>Precisión: {Math.round(accuracy)} m</div>}
              </Popup>
            </Marker>

            {/* ✅ Círculo de precisión */}
            {accuracy && accuracy < 200 && (
              <Circle
                center={position}
                radius={accuracy}
                pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
              />
            )}
          </>
        )}

        {children}
      </MapContainer>
    </div>
  );
}
