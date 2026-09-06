import { useEffect, useMemo, useRef, useState } from "react";
import { MeshPhongMaterial } from "three";
import { useNavigate } from "@tanstack/react-router";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { MousePointerClick } from "lucide-react";
import { currencyForCountry } from "@/lib/country-currency";
import { currency, type TokenView } from "@/lib/market";

type Feature = {
  properties: { iso: string | null; name: string };
  geometry: unknown;
};

export function CurrencyGlobe({ tokens }: { tokens: TokenView[] }) {
  const navigate = useNavigate();
  const wrap = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [size, setSize] = useState({ w: 600, h: 600 });
  const [features, setFeatures] = useState<Feature[]>([]);
  const [hovered, setHovered] = useState<Feature | null>(null);

  const globeMaterial = useMemo(
    () => new MeshPhongMaterial({ color: "#04140b", transparent: true, opacity: 0.92 }),
    [],
  );

  const liveByPair = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of tokens) map[t.pair] = (map[t.pair] ?? 0) + 1;
    return map;
  }, [tokens]);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setSize({ w: Math.max(320, r.width), h: Math.max(320, r.height) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let alive = true;
    fetch("/world-countries.geojson")
      .then((r) => r.json())
      .then((d: { features: Feature[] }) => {
        if (alive) setFeatures(d.features);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    const controls = g.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    controls.enableZoom = false;
    g.pointOfView({ lat: 12, lng: 8, altitude: 2.4 });
  }, [features.length]);

  const supported = (f: Feature | null) => currencyForCountry(f?.properties.iso);
  const hoveredCode = supported(hovered);

  return (
    <div ref={wrap} className="absolute inset-0 overflow-hidden">
      <div className="pointer-events-auto absolute inset-0 flex items-center justify-center">
        <Globe
          ref={globeRef}
          width={size.w}
          height={size.h}
          backgroundColor="rgba(0,0,0,0)"
          showGlobe
          showAtmosphere
          atmosphereColor="#22c55e"
          atmosphereAltitude={0.18}
          globeMaterial={globeMaterial as never}
          polygonsData={features}
          polygonAltitude={(d) => (d === hovered ? 0.07 : supported(d as Feature) ? 0.018 : 0.008)}
          polygonCapColor={(d) => {
            const f = d as Feature;
            if (f === hovered) return "rgba(74, 222, 128, 0.95)";
            return supported(f) ? "rgba(34, 197, 94, 0.55)" : "rgba(120, 140, 128, 0.18)";
          }}
          polygonSideColor={() => "rgba(34, 197, 94, 0.25)"}
          polygonStrokeColor={() => "rgba(134, 239, 172, 0.45)"}
          polygonsTransitionDuration={220}
          onPolygonHover={(d) => {
            setHovered((d as Feature) ?? null);
            const controls = globeRef.current?.controls();
            if (controls) controls.autoRotate = !d;
            if (wrap.current) wrap.current.style.cursor = supported(d as Feature) ? "pointer" : "grab";
          }}
          onPolygonClick={(d) => {
            const f = d as Feature;
            const code = supported(f);
            if (!code) return;
            const live = liveByPair[code] ?? 0;
            if (live > 0) navigate({ to: "/explore", search: { currency: code } });
            else navigate({ to: "/launch", search: { pair: code } });
          }}
          polygonLabel={(d) => {
            const f = d as Feature;
            const code = supported(f);
            if (!code) {
              return `<div style="font-family:Inter,sans-serif;background:rgba(4,10,6,.9);border:1px solid rgba(134,239,172,.25);border-radius:12px;padding:8px 12px;color:#cbd5c8;font-size:12px">
                ${f.properties.name}<br/><span style="opacity:.6">No currency pair yet</span></div>`;
            }
            const c = currency(code);
            const live = liveByPair[code] ?? 0;
            return `<div style="font-family:Inter,sans-serif;background:rgba(4,10,6,.92);border:1px solid rgba(34,197,94,.45);border-radius:14px;padding:10px 14px;color:#eafff0;box-shadow:0 12px 40px rgba(0,0,0,.5)">
              <div style="font-size:34px;line-height:1">${c.flag}</div>
              <div style="font-weight:700;margin-top:4px">${f.properties.name}</div>
              <div style="font-family:ui-monospace,monospace;color:#4ade80;font-size:13px">${code} ${c.symbol} pair</div>
              <div style="font-size:11px;opacity:.75;margin-top:4px">${
                live > 0
                  ? `${live} coin${live === 1 ? "" : "s"} live, click to view them`
                  : "No coins yet, click to launch the first"
              }</div>
            </div>`;
          }}
        />
      </div>

      {hoveredCode && (
        <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-3 rounded-2xl border border-primary/40 bg-background/80 px-4 py-3 shadow-[var(--shadow-glow)] backdrop-blur-xl sm:left-8 sm:top-8">
          <span className="text-4xl leading-none">{currency(hoveredCode).flag}</span>
          <div className="text-left">
            <p className="text-sm font-semibold">{hovered?.properties.name}</p>
            <p className="num text-xs text-primary">
              {hoveredCode} {currency(hoveredCode).symbol} pair
            </p>
            <p className="text-[11px] text-muted-foreground">
              {(liveByPair[hoveredCode] ?? 0) > 0
                ? `${liveByPair[hoveredCode]} live, click to view`
                : "Click to launch the first coin"}
            </p>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4 sm:bottom-6">
        <div className="glass-panel inline-flex animate-pulse items-center gap-2 rounded-full border border-primary/30 px-4 py-2 text-sm font-medium text-primary shadow-[var(--shadow-glow)]">
          <MousePointerClick className="size-4" />
          <span>Click any country to launch or explore its pair</span>
        </div>
      </div>
    </div>
  );
}

export default CurrencyGlobe;
