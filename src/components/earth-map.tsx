import { useEffect, useRef, useState } from "react";
import type { LayerGroup, Map as LMap } from "leaflet";

export type MapPoint = { lat: number; lng: number; label: string };
export type MapPin = { id: string; city: string; lat: number; lng: number; real: boolean };

const TILE = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const LABELS = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";
const TEAL = "#6fb8b3";
const TEAL_FILL = "#4f8f8b";

type Props = {
  active: boolean;
  focus: MapPoint | null;
  pins: MapPin[];
  you: MapPoint | null;
  pickMode: "from" | "to" | null;
  onPick: (mode: "from" | "to", point: MapPoint) => void;
  onAnywhere: (point: MapPoint) => void;
  zoomSignal: number;
  zoomDir: 1 | -1;
  onZoom: (z: number) => void;
};

function labelOf(lat: number, lng: number) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(3)}°${ns}, ${Math.abs(lng).toFixed(3)}°${ew}`;
}

export function EarthMap({ active, focus, pins, you, pickMode, onPick, onAnywhere, zoomSignal, zoomDir, onZoom }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const pickRef = useRef(pickMode);
  const onPickRef = useRef(onPick);
  const onAnyRef = useRef(onAnywhere);
  const onZoomRef = useRef(onZoom);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const focusRef = useRef(focus);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    pickRef.current = pickMode;
  }, [pickMode]);
  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);
  useEffect(() => {
    onAnyRef.current = onAnywhere;
  }, [onAnywhere]);
  useEffect(() => {
    onZoomRef.current = onZoom;
  }, [onZoom]);
  useEffect(() => {
    focusRef.current = focus;
  }, [focus]);

  useEffect(() => {
    if (!active || !host.current || mapRef.current) return;
    let cancelled = false;
    void (async () => {
      const mod = (await import("leaflet")) as unknown as { default?: typeof import("leaflet") } & typeof import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !host.current || mapRef.current) return;
      const L = mod.default ?? mod;
      leafletRef.current = L;
      const start = focusRef.current;
      const map = L.map(host.current, {
        zoomControl: false,
        attributionControl: true,
        preferCanvas: true,
        fadeAnimation: false,
        zoomAnimation: true,
        markerZoomAnimation: false,
        inertia: true,
        worldCopyJump: true,
      });
      map.setView(start ? [start.lat, start.lng] : [20, 20], start ? 8 : 3, { animate: false });
      L.tileLayer(TILE, {
        maxZoom: 17,
        maxNativeZoom: 17,
        minZoom: 2,
        keepBuffer: 2,
        updateWhenIdle: false,
        updateWhenZooming: false,
        attribution: "© Esri",
      }).addTo(map);
      map.createPane("labels");
      const labelPane = map.getPane("labels");
      if (labelPane) {
        labelPane.style.zIndex = "450";
        labelPane.style.pointerEvents = "none";
      }
      L.tileLayer(LABELS, {
        maxZoom: 17,
        maxNativeZoom: 17,
        minZoom: 3,
        pane: "labels",
        attribution: "",
      }).addTo(map);
      const group = L.layerGroup().addTo(map);
      layerRef.current = group;
      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        const point: MapPoint = { lat: e.latlng.lat, lng: e.latlng.lng, label: labelOf(e.latlng.lat, e.latlng.lng) };
        const mode = pickRef.current;
        if (mode) onPickRef.current(mode, point);
        else onAnyRef.current(point);
      });
      map.on("zoomend", () => onZoomRef.current(map.getZoom()));
      mapRef.current = map;
      setReady(true);
      requestAnimationFrame(() => map.invalidateSize());
    })();
    return () => {
      cancelled = true;
    };
  }, [active]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !active) return;
    requestAnimationFrame(() => map.invalidateSize());
  }, [active]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !active || !focus) return;
    const z = map.getZoom();
    map.flyTo([focus.lat, focus.lng], z < 6 ? 8 : Math.min(12, z), { duration: 0.32, easeLinearity: 0.4 });
  }, [focus, active]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !active || zoomSignal === 0) return;
    if (zoomDir > 0) map.zoomIn(1);
    else map.zoomOut(1);
  }, [zoomSignal, zoomDir, active]);

  useEffect(() => {
    const group = layerRef.current;
    const L = leafletRef.current;
    if (!group || !L) return;
    group.clearLayers();
    for (const pin of pins) {
      const isFocus = !!focus && Math.abs(pin.lat - focus.lat) < 0.02 && Math.abs(pin.lng - focus.lng) < 0.02;
      const mark = L.circleMarker([pin.lat, pin.lng], {
        radius: isFocus ? 7 : pin.real ? 6 : 4,
        color: TEAL,
        weight: isFocus ? 2 : 1,
        fillColor: pin.real ? TEAL : TEAL_FILL,
        fillOpacity: pin.real ? 0.9 : 0.55,
        opacity: 0.9,
      });
      mark.bindTooltip(pin.city, { direction: "top", opacity: 0.9, className: "gx-map-tip", permanent: false });
      mark.on("click", (ev: { originalEvent?: Event }) => {
        L.DomEvent.stopPropagation(ev as never);
        const point: MapPoint = { lat: pin.lat, lng: pin.lng, label: pin.city };
        const mode = pickRef.current;
        if (mode) onPickRef.current(mode, point);
        else onAnyRef.current(point);
      });
      mark.addTo(group);
    }
    if (you) {
      L.circleMarker([you.lat, you.lng], {
        radius: 8,
        color: TEAL,
        weight: 2,
        fillColor: "#d5ecea",
        fillOpacity: 0.95,
      })
        .bindTooltip(you.label, { direction: "top", opacity: 0.9, className: "gx-map-tip" })
        .addTo(group);
    }
    if (focus) {
      L.circleMarker([focus.lat, focus.lng], {
        radius: 14,
        color: TEAL,
        weight: 1,
        fillColor: TEAL,
        fillOpacity: 0.12,
        opacity: 0.7,
      }).addTo(group);
    }
  }, [pins, you, active, ready, focus]);

  return <div ref={host} className="gx-map-host" aria-label="Спутниковая карта Земли" />;
}
