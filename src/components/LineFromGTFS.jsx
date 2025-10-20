// src/components/LineFromGTFS.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No pude leer ${url}`);
  return res.json();
}

function FitBoundsOnce({ latlngs, padding = 60 }) {
  const map = useMap();
  const done = useRef(false);

  useEffect(() => {
    if (!done.current && latlngs?.length) {
      map.setMaxZoom(22);
      map.fitBounds(L.latLngBounds(latlngs), { padding: [padding, padding] });
      done.current = true;
    }
  }, [latlngs, map, padding]);

  return null;
}

export default function LineFromGTFS({
  base = '/gtfs',
  color = '#00a551',
  weight = 5,
  routeId,
  shortName,
  longName,
  fitBounds: doFit = true,
  onError = (e) => console.warn('[LineFromGTFS]', e?.message || e),
  onSelectLinea, // 👈 nueva prop
}) {
  const [coords, setCoords] = useState([]);
  const [hover, setHover] = useState(false);
  const map = useMap();

  const preparedBase = useMemo(
    () => base.replace('/gtfs/', '/gtfs_prepared/'),
    [base]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const routeToShape = await getJSON(`${preparedBase}/route_to_shape.json`);
        let rid = routeId;

        if (!rid && shortName) {
          const shortToRoute = await getJSON(`${preparedBase}/short_to_route.json`);
          rid = shortToRoute[String(shortName).trim()];
        }
        if (!rid) throw new Error('routeId no disponible');

        const sid = routeToShape[rid];
        if (!sid) throw new Error(`No hay shape para route_id=${rid}`);

        const shape = await getJSON(`${preparedBase}/shapes/${sid}.json`);
        if (!shape?.coords?.length) throw new Error('Shape vacío');

        if (!cancelled) setCoords(shape.coords);
      } catch (e) {
        onError(e);
        if (!cancelled) setCoords([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [preparedBase, routeId, shortName, onError]);

  if (!coords.length) return null;

  const url = `/mapa?linea=${routeId}&base=${base}`;

  return (
    <>
      {doFit && <FitBoundsOnce latlngs={coords} />}
      <Polyline
        positions={coords}
        pathOptions={{ color, weight: hover ? weight + 3 : weight }}
        eventHandlers={{
          mouseover: () => setHover(true),
          mouseout: () => setHover(false),
          click: (e) => {
            // 👇 avisamos al padre con las coords
            if (onSelectLinea) {
              onSelectLinea(coords);
            }

            // popup como antes
            const content = `
              <div style="text-align:center;max-width:250px;">
                <div><b>Línea ${shortName}</b></div>
                ${
                  longName
                    ? `<div style="margin-top:4px;font-size:13px;color:#333;">
                         ${longName}
                       </div>`
                    : ''
                }
                <div style="margin-top:8px;">
                  <a href="${url}" target="_blank"
                     style="display:inline-block;margin-right:8px;padding:4px 10px;background:#2196F3;color:white;border-radius:4px;text-decoration:none;font-size:13px;">
                    🔗 Abrir
                  </a>
                  <button onclick="navigator.clipboard.writeText('${window.location.origin + url}')"
                          style="display:inline-block;padding:4px 10px;background:#666;color:white;border-radius:4px;border:none;cursor:pointer;font-size:13px;">
                    📋 Copiar
                  </button>
                </div>
              </div>
            `;
            L.popup()
              .setLatLng(e.latlng)
              .setContent(content)
              .openOn(map);
          }
        }}
      />
    </>
  );
}
