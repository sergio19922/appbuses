import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, LayersControl } from 'react-leaflet';
import { useLocation } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

export default function MapView({ children, onLineaFromURL }) {
  const MAX_BOUNDS = [
    [39.90, -4.60],
    [41.20, -3.10],
  ];

  const location = useLocation();
  const alreadyLoaded = useRef(false);

  // 🚀 Restaurar línea desde URL solo 1 vez
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

  return (
    <div style={{ height: "100%", width: "100%" }}>
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
        <LayersControl position="topright">
          {/* 🗺️ Mapa base estilo Google */}
          <LayersControl.BaseLayer checked name="🗺️ Mapa (Estilo Google)">
            <TileLayer
              attribution='Tiles © Esri — Source: Esri, HERE, Garmin, FAO, NOAA, USGS'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
              maxZoom={22}
            />
          </LayersControl.BaseLayer>

          {/* 🛰️ Satélite */}
          <LayersControl.BaseLayer name="🛰️ Satélite">
            <TileLayer
              attribution='Tiles © Esri — Imagery'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={22}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* 🔹 Capas de rutas, paradas, etc. */}
        {children}
      </MapContainer>
    </div>
  );
}
