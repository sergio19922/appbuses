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
  onSelectLinea,
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

  // 🔹 Cierra el popup solo cuando la línea se desmonta (por borrar filtros)
  useEffect(() => {
    return () => {
      if (map && map.closePopup) {
        map.closePopup();
      }
    };
  }, [map]);

  if (!coords.length) return null;

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
            if (onSelectLinea) {
              onSelectLinea(coords);
            }

            // Popup con estilo limpio y visible
            const content = `
              <div style="
                text-align:center;
                max-width:250px;
                background:rgba(255,255,255,0.95);
                padding:8px 10px;
                border-radius:6px;
                box-shadow:0 2px 6px rgba(0,0,0,0.25);
              ">
                <div><b>Línea ${shortName}</b></div>
                ${
                  longName
                    ? `<div style="margin-top:4px;font-size:13px;color:#333;">
                        ${longName}
                      </div>`
                    : ''
                }
              </div>
            `;

            L.popup()
              .setLatLng(e.latlng)
              .setContent(content)
              .openOn(map);
          },
        }}
      />
    </>
  );
}
