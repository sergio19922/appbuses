import React, { useState, useEffect } from 'react';
import MapView from './MapView';
import { Polyline } from 'react-leaflet';

export default function MapWithCarreteraFilter() {
  const [indexData, setIndexData] = useState(null);
  const [shapesData, setShapesData] = useState({});
  const [selectedCarretera, setSelectedCarretera] = useState('M607'); // Selección inicial

  useEffect(() => {
    // Cargar index.json
    fetch('/gtfs/index.json')
      .then(res => res.json())
      .then(data => setIndexData(data))
      .catch(err => console.error('Error cargando index.json', err));
  }, []);

  useEffect(() => {
    if (!indexData) return;

    // Filtrar paquetes por la carretera seleccionada
    const paquetesFiltrados = indexData.packages.filter(pkg => pkg.carretera === selectedCarretera);

    // Cargar shapes de esos paquetes
    paquetesFiltrados.forEach(pkg => {
      fetch(`${pkg.base}/shapes.txt`)
        .then(res => res.text())
        .then(text => {
          const lines = text.split('\n').slice(1); // quitar cabecera
          const parsed = {};
          lines.forEach(line => {
            if (!line.trim()) return;
            const [shape_id, lat, lon, seq] = line.split(',');
            if (!parsed[shape_id]) parsed[shape_id] = [];
            parsed[shape_id].push({
              shape_pt_lat: lat,
              shape_pt_lon: lon,
              shape_pt_sequence: seq
            });
          });
          setShapesData(prev => ({ ...prev, ...parsed }));
        })
        .catch(err => console.error(`Error cargando shapes de ${pkg.id}`, err));
    });
  }, [indexData, selectedCarretera]);

  if (!indexData) return <p>Cargando datos...</p>;

  // Extraer carreteras únicas
  const carreteras = [...new Set(indexData.packages.map(pkg => pkg.carretera).filter(Boolean))];

  // Filtrar paquetes por carretera seleccionada
  const paquetes = indexData.packages.filter(pkg => pkg.carretera === selectedCarretera);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Filtro de carretera */}
      <div style={{ padding: '8px', background: '#f0f0f0' }}>
        <label>
          Carretera:{' '}
          <select value={selectedCarretera} onChange={e => setSelectedCarretera(e.target.value)}>
            {carreteras.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Mapa */}
      <div style={{ flex: 1 }}>
        <MapView>
          {paquetes.flatMap(pkg =>
            pkg.routes
              .filter(r => r.hasShape)
              .map(route => {
                const points = shapesData[route.route_id] || [];
                if (!points.length) return null;

                const sortedPoints = [...points].sort(
                  (a, b) => Number(a.shape_pt_sequence) - Number(b.shape_pt_sequence)
                );

                const coords = sortedPoints.map(p => [
                  parseFloat(p.shape_pt_lat),
                  parseFloat(p.shape_pt_lon)
                ]);

                return (
                  <Polyline
                    key={`${pkg.id}-${route.short_name}`}
                    positions={coords}
                    pathOptions={{
                      color: `#${route.color || '3388ff'}`,
                      weight: 4
                    }}
                  />
                );
              })
          )}
        </MapView>
      </div>
    </div>
  );
}
