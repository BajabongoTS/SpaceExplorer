"use client";

import { useState, useCallback, useRef, useEffect } from "react";

// ═══════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════
interface SatelliteResult {
  orbitalSpeed: number;
  orbitalPeriod: number;
  altitudeKm: number;
}
interface Preset { name: string; altitude: number; description: string; }
interface Planet {
  id: string; name: string; symbol: string;
  color: string; glowColor: string; ringColor?: string;
  radius: number; orbitRadius: number; speed: number;
  distanceAU: number; diameterKm: number; massKg: number;
  orbitalPeriodDays: number; orbitalSpeedKms: number;
  moons: number; tempMin: number; tempMax: number;
  description: string; funFact: string; gradient: string;
}

// ═══════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═══════════════════════════════════════════════
const G = 6.674e-11;
const M_EARTH = 5.972e24;
const R_EARTH = 6371;

const PRESETS: Preset[] = [
  { name: "ISS",            altitude: 408,   description: "Miedzynarodowa Stacja Kosmiczna" },
  { name: "GPS",            altitude: 20200, description: "Satelity GPS — MEO" },
  { name: "GEO",            altitude: 35786, description: "Orbita geostacjonarna" },
  { name: "Starlink",       altitude: 550,   description: "Konstelacja Starlink — LEO" },
  { name: "Hubble",         altitude: 547,   description: "Kosmiczny Teleskop Hubble" },
];

const PLANETS: Planet[] = [
  {
    id: "mercury", name: "Merkury", symbol: "☿",
    color: "#a8a8b3", glowColor: "#d0d0dc",
    radius: 4, orbitRadius: 62, speed: 4.74,
    distanceAU: 0.387, diameterKm: 4879, massKg: 3.285e23,
    orbitalPeriodDays: 88, orbitalSpeedKms: 47.9,
    moons: 0, tempMin: -180, tempMax: 430,
    gradient: "radial-gradient(circle at 38% 32%, #e0dfe8, #9090a0, #505060)",
    description: "Najmniejsza planeta Ukladu Slonecznego, pozbawiona atmosfery. Powierzchnia usiana kraterami przypomina Ksiezyc.",
    funFact: "Rok trwa tu 88 dni, ale jeden dzien sloneczny az 176 — doby sa dluzsze niz lata.",
  },
  {
    id: "venus", name: "Wenus", symbol: "♀",
    color: "#e8c060", glowColor: "#f5d878",
    radius: 6, orbitRadius: 92, speed: 3.50,
    distanceAU: 0.723, diameterKm: 12104, massKg: 4.867e24,
    orbitalPeriodDays: 225, orbitalSpeedKms: 35.0,
    moons: 0, tempMin: 462, tempMax: 462,
    gradient: "radial-gradient(circle at 38% 32%, #f8e898, #d4a030, #906010)",
    description: "Najgoretsze miejsce w Ukladzie, pomimo ze nie jest najblizej Slonca. Efekt cieplarniany napedzany gestymi chmurami CO2.",
    funFact: "Wenus obraca sie w odwrotnym kierunku — Slonce wschodzi tam na zachodzie.",
  },
  {
    id: "earth", name: "Ziemia", symbol: "♁",
    color: "#3a8fef", glowColor: "#60b4ff",
    radius: 7, orbitRadius: 122, speed: 2.98,
    distanceAU: 1.0, diameterKm: 12742, massKg: 5.972e24,
    orbitalPeriodDays: 365, orbitalSpeedKms: 29.8,
    moons: 1, tempMin: -88, tempMax: 58,
    gradient: "radial-gradient(circle at 38% 32%, #80c8ff, #2070d8, #103090)",
    description: "Jedyna znana planeta z zyciem. Unikalna kombinacja wody, atmosfery azotowo-tlenowej i pola magnetycznego tworzy idealne warunki.",
    funFact: "Ziemia jest najgestsza planeta w Ukladzie — jej srednia gestosc to 5,5 g/cm³.",
  },
  {
    id: "mars", name: "Mars", symbol: "♂",
    color: "#d86040", glowColor: "#f08060",
    radius: 5, orbitRadius: 152, speed: 2.41,
    distanceAU: 1.524, diameterKm: 6779, massKg: 6.39e23,
    orbitalPeriodDays: 687, orbitalSpeedKms: 24.1,
    moons: 2, tempMin: -125, tempMax: 20,
    gradient: "radial-gradient(circle at 38% 32%, #f09070, #c84018, #802010)",
    description: "Czerwona barwa pochodzi od tlenku zelaza. Dom najwyzszego wulkanu w ukladzie — Olympus Mons (21 km).",
    funFact: "Dzien na Marsie trwa 24 godz. 37 min — niemal identycznie jak ziemski.",
  },
  {
    id: "jupiter", name: "Jowisz", symbol: "♃",
    color: "#c8906a", glowColor: "#e0a880",
    radius: 14, orbitRadius: 200, speed: 1.31,
    distanceAU: 5.203, diameterKm: 139820, massKg: 1.898e27,
    orbitalPeriodDays: 4333, orbitalSpeedKms: 13.1,
    moons: 95, tempMin: -145, tempMax: -108,
    gradient: "radial-gradient(circle at 38% 32%, #e8b888, #a86830, #704020)",
    description: "Koloss — masa Jowisza przewyzsza 2,5-krotnie sumaryczna mase wszystkich pozostalych planet. Wielka Czerwona Plama to burza starsza niz 350 lat.",
    funFact: "Jowisz jest kosmicznym tarczem — jego grawitacja przyciaga komety, chroniac wewnetrzne planety.",
  },
  {
    id: "saturn", name: "Saturn", symbol: "♄",
    color: "#d8c878", glowColor: "#ece090",
    ringColor: "rgba(220,200,120,0.5)",
    radius: 12, orbitRadius: 252, speed: 0.97,
    distanceAU: 9.537, diameterKm: 116460, massKg: 5.683e26,
    orbitalPeriodDays: 10759, orbitalSpeedKms: 9.7,
    moons: 146, tempMin: -178, tempMax: -178,
    gradient: "radial-gradient(circle at 38% 32%, #f0e898, #c0a840, #807010)",
    description: "Krol pierscieni. Jego gestost jest mniejsza niz wody — gdyby istnial odpowiednio wielki ocean, Saturn by na nim plynal.",
    funFact: "Saturn ma 146 znanych ksiezyców. Tytan ma gesta atmosfere i jeziora ciekłego metanu.",
  },
  {
    id: "uranus", name: "Uran", symbol: "⛢",
    color: "#60d8d8", glowColor: "#80f0f0",
    radius: 9, orbitRadius: 303, speed: 0.68,
    distanceAU: 19.19, diameterKm: 50724, massKg: 8.681e25,
    orbitalPeriodDays: 30687, orbitalSpeedKms: 6.8,
    moons: 28, tempMin: -224, tempMax: -195,
    gradient: "radial-gradient(circle at 38% 32%, #a0f8f8, #30b8b8, #207070)",
    description: "Planeta lezaca 'na boku' — os nachylenia 98°. Kazdy biegun przez dekady swieci w pelnym blasku Slonca, po czym zapada w wieloletnia ciemnosc.",
    funFact: "Uran jest najzimniejsza planeta — temperatura spada do -224°C, nizej niz u dalszego Neptuna.",
  },
  {
    id: "neptune", name: "Neptun", symbol: "♆",
    color: "#4060e0", glowColor: "#6080ff",
    radius: 9, orbitRadius: 348, speed: 0.54,
    distanceAU: 30.07, diameterKm: 49244, massKg: 1.024e26,
    orbitalPeriodDays: 60190, orbitalSpeedKms: 5.4,
    moons: 16, tempMin: -218, tempMax: -200,
    gradient: "radial-gradient(circle at 38% 32%, #7898ff, #2038c0, #101878)",
    description: "Planetarny wichrowiec — wiatry przekraczaja 2100 km/h, rekord Ukladu Slonecznego. Odkryty dzieki obliczeniom matematycznym, zanim ktokolwiek go zobaczyl.",
    funFact: "Od odkrycia w 1846 r. do 2011 r. Neptun ukonczyl zaledwie jedna pelna orbite wokol Slonca.",
  },
];

// ═══════════════════════════════════════════════
// CALC
// ═══════════════════════════════════════════════
function calcSatellite(alt: number): SatelliteResult {
  const r = (R_EARTH + alt) * 1000;
  const v = Math.sqrt((G * M_EARTH) / r) / 1000;
  const T = (2 * Math.PI * r) / (v * 1000) / 60;
  return { orbitalSpeed: v, orbitalPeriod: T, altitudeKm: alt };
}

function formatPeriod(min: number): string {
  if (min < 60) return `${min.toFixed(1)}m`;
  const h = Math.floor(min / 60), m = Math.round(min % 60);
  if (h < 24) return `${h}h ${m}m`;
  const d = Math.floor(h / 24), rh = h % 24;
  if (d < 365) return `${d}d ${rh}h`;
  const y = Math.floor(d / 365), rd = d % 365;
  return `${y}y ${rd}d`;
}

// ═══════════════════════════════════════════════
// SOLAR SYSTEM CANVAS
// ═══════════════════════════════════════════════
function SolarCanvas({ onSelect, selectedId }: {
  onSelect: (p: Planet | null) => void;
  selectedId: string | null;
}) {
  const ref    = useRef<HTMLCanvasElement>(null);
  const animId = useRef(0);
  const angles    = useRef(PLANETS.map(() => Math.random() * Math.PI * 2));
  const moonAngle = useRef(Math.random() * Math.PI * 2);
  const hov       = useRef<string | null>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx    = canvas.getContext("2d")!;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    let last = performance.now();

    // Stars
    const stars = Array.from({ length: 200 }, (_, i) => ({
      x: (i * 139.5 + 7) % W,
      y: (i * 93.7 + 13) % H,
      r: i % 7 === 0 ? 1.5 : i % 3 === 0 ? 1.0 : 0.6,
      o: 0.3 + (i % 10) * 0.07,
    }));

    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, W, H);

      // Deep space background
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.7);
      bg.addColorStop(0,   "rgba(8,10,28,1)");
      bg.addColorStop(0.5, "rgba(4,6,16,1)");
      bg.addColorStop(1,   "rgba(2,3,10,1)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Stars
      stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.o})`;
        ctx.fill();
      });

      // Sun
      const t = now * 0.001;
      const pulse = 1 + 0.04 * Math.sin(t * 2.1);
      for (let i = 3; i >= 0; i--) {
        const sr = (22 + i * 14) * pulse;
        const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, sr);
        if (i === 0) {
          sg.addColorStop(0,   "#fff9e8");
          sg.addColorStop(0.4, "#ffe060");
          sg.addColorStop(1,   "rgba(255,160,0,0)");
        } else {
          const a = [0.18, 0.10, 0.05][i - 1];
          sg.addColorStop(0,   `rgba(255,180,0,${a})`);
          sg.addColorStop(1,   "transparent");
        }
        ctx.beginPath();
        ctx.arc(cx, cy, sr, 0, Math.PI * 2);
        ctx.fillStyle = sg;
        ctx.fill();
      }

      PLANETS.forEach((p, i) => {
        angles.current[i] += p.speed * 0.006 * dt;
        const px = cx + Math.cos(angles.current[i]) * p.orbitRadius;
        const py = cy + Math.sin(angles.current[i]) * p.orbitRadius;
        const isSel = p.id === selectedId;
        const isHov = p.id === hov.current;

        // Orbit ring
        ctx.beginPath();
        ctx.arc(cx, cy, p.orbitRadius, 0, Math.PI * 2);
        ctx.strokeStyle = isSel
          ? `rgba(100,180,255,0.45)`
          : `rgba(255,255,255,0.06)`;
        ctx.lineWidth = isSel ? 1.5 : 0.8;
        ctx.setLineDash(isSel ? [] : [2, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Outer glow
        if (isSel || isHov) {
          const gr = p.radius * 3.5;
          const g = ctx.createRadialGradient(px, py, 0, px, py, gr);
          g.addColorStop(0,   p.glowColor + "50");
          g.addColorStop(0.5, p.glowColor + "20");
          g.addColorStop(1,   "transparent");
          ctx.beginPath();
          ctx.arc(px, py, gr, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }

        // Saturn rings (behind planet)
        if (p.id === "saturn") {
          ctx.save();
          ctx.translate(px, py);
          ctx.scale(1, 0.30);
          for (let ri = 0; ri < 3; ri++) {
            const rr = p.radius + 7 + ri * 4;
            const ro = [0.55, 0.35, 0.20][ri];
            ctx.beginPath();
            ctx.arc(0, 0, rr, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(210,190,100,${ro})`;
            ctx.lineWidth = ri === 0 ? 4 : 2.5;
            ctx.stroke();
          }
          ctx.restore();
        }

        // Planet sphere
        const pg = ctx.createRadialGradient(
          px - p.radius * 0.35, py - p.radius * 0.35, p.radius * 0.05,
          px, py, p.radius
        );
        pg.addColorStop(0,   p.glowColor);
        pg.addColorStop(0.5, p.color);
        pg.addColorStop(1,   p.color + "55");
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = pg;
        ctx.fill();

        // Specular highlight
        const hl = ctx.createRadialGradient(
          px - p.radius * 0.3, py - p.radius * 0.3, 0,
          px - p.radius * 0.3, py - p.radius * 0.3, p.radius * 0.5
        );
        hl.addColorStop(0,   "rgba(255,255,255,0.30)");
        hl.addColorStop(1,   "transparent");
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = hl;
        ctx.fill();

        // Selection ring
        if (isSel) {
          ctx.beginPath();
          ctx.arc(px, py, p.radius + 5, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(100,200,255,0.9)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Moon (orbits Earth)
        if (p.id === "earth") {
          const MOON_ORBIT = 18;
          moonAngle.current += 2.2 * 0.006 * dt;
          const mx = px + Math.cos(moonAngle.current) * MOON_ORBIT;
          const my = py + Math.sin(moonAngle.current) * MOON_ORBIT;

          // Moon orbit ring
          ctx.beginPath();
          ctx.arc(px, py, MOON_ORBIT, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255,255,255,0.12)";
          ctx.lineWidth = 0.7;
          ctx.setLineDash([1, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Moon body
          const mg = ctx.createRadialGradient(mx - 1, my - 1, 0, mx, my, 3);
          mg.addColorStop(0, "#e8e8f0");
          mg.addColorStop(0.6, "#b0b0be");
          mg.addColorStop(1, "#808090");
          ctx.beginPath();
          ctx.arc(mx, my, 3, 0, Math.PI * 2);
          ctx.fillStyle = mg;
          ctx.fill();

          // Moon label
          ctx.font = "8px system-ui";
          ctx.textAlign = "center";
          ctx.fillStyle = "rgba(180,190,210,0.45)";
          ctx.fillText("KSIEZYC", mx, my - 7);
        }

        // Label
        const bright = isSel || isHov;
        ctx.font      = bright ? "bold 10px system-ui" : "10px system-ui";
        ctx.textAlign = "center";
        ctx.fillStyle = bright
          ? "rgba(230,240,255,0.95)"
          : "rgba(150,165,190,0.55)";
        ctx.fillText(p.name.toUpperCase(), px, py - p.radius - 7);
      });

      animId.current = requestAnimationFrame(frame);
    }

    animId.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId.current);
  }, [selectedId]);

  function hitTest(e: React.MouseEvent<HTMLCanvasElement>): Planet | null {
    const c    = ref.current!;
    const rect = c.getBoundingClientRect();
    const mx   = (e.clientX - rect.left) * (c.width / rect.width);
    const my   = (e.clientY - rect.top)  * (c.height / rect.height);
    const cx   = c.width / 2, cy = c.height / 2;
    return PLANETS.find((p, i) => {
      const px = cx + Math.cos(angles.current[i]) * p.orbitRadius;
      const py = cy + Math.sin(angles.current[i]) * p.orbitRadius;
      return Math.hypot(mx - px, my - py) <= p.radius + 10;
    }) ?? null;
  }

  return (
    <canvas
      ref={ref}
      width={760} height={760}
      onClick={(e) => { const p = hitTest(e); onSelect(p?.id === selectedId ? null : p); }}
      onMouseMove={(e) => {
        const p = hitTest(e);
        hov.current = p?.id ?? null;
        (e.currentTarget as HTMLCanvasElement).style.cursor = p ? "pointer" : "default";
      }}
      style={{ width: "100%", height: "auto", display: "block" }}
    />
  );
}

// ═══════════════════════════════════════════════
// PLANET CARD
// ═══════════════════════════════════════════════
function PlanetCard({ planet, onClose }: { planet: Planet; onClose: () => void }) {
  return (
    <div style={{
      marginTop: 16,
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: `1px solid ${planet.glowColor}30`,
      borderRadius: 20,
      padding: "28px 28px 24px",
      boxShadow: `0 0 60px ${planet.glowColor}15, inset 0 1px 0 rgba(255,255,255,0.08)`,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: planet.gradient,
            boxShadow: `0 0 30px ${planet.glowColor}60`,
            flexShrink: 0,
          }} />
          <div>
            <div style={{ fontSize: 11, color: planet.glowColor, letterSpacing: "0.2em", marginBottom: 4, fontWeight: 500 }}>
              PLANETA · {planet.distanceAU} AU
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>
              {planet.name}
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.5)", borderRadius: 10, width: 36, height: 36,
          cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
        }}>✕</button>
      </div>

      {/* Description */}
      <p style={{ fontSize: 14, color: "rgba(200,215,240,0.8)", lineHeight: 1.75, margin: "0 0 20px" }}>
        {planet.description}
      </p>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginBottom: 16 }}>
        {[
          ["Odleglosc",       `${planet.distanceAU} AU`],
          ["Srednica",        `${planet.diameterKm.toLocaleString("pl-PL")} km`],
          ["Rok",             formatPeriod(planet.orbitalPeriodDays * 24 * 60)],
          ["Predkosc",        `${planet.orbitalSpeedKms} km/s`, true],
          ["Ksiezyce",        String(planet.moons)],
          ["Temperatura",     `${planet.tempMin} / ${planet.tempMax} °C`],
        ].map(([label, val, accent]) => (
          <div key={label as string} style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12, padding: "12px 14px",
          }}>
            <div style={{ fontSize: 10, color: "rgba(160,175,200,0.6)", letterSpacing: "0.15em", marginBottom: 5, textTransform: "uppercase" as const }}>
              {label}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: accent ? planet.glowColor : "#fff" }}>
              {val}
            </div>
          </div>
        ))}
      </div>

      {/* Fun fact */}
      <div style={{
        background: `linear-gradient(135deg, ${planet.glowColor}10, transparent)`,
        border: `1px solid ${planet.glowColor}25`,
        borderRadius: 12, padding: "14px 16px",
      }}>
        <div style={{ fontSize: 10, color: planet.glowColor, letterSpacing: "0.2em", marginBottom: 6, fontWeight: 600 }}>
          CIEKAWOSTKA
        </div>
        <div style={{ fontSize: 13, color: "rgba(210,225,245,0.85)", lineHeight: 1.65 }}>
          {planet.funFact}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════
export default function Page() {
  const [altitude, setAltitude]         = useState("408");
  const [result, setResult]             = useState<SatelliteResult | null>(calcSatellite(408));
  const [error, setError]               = useState("");
  const [activePreset, setActivePreset] = useState("ISS");
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [tab, setTab]                   = useState<"sat" | "solar">("sat");

  const calc = useCallback((val: string) => {
    const n = parseFloat(val);
    if (isNaN(n) || n < 0)  { setError("Podaj wysokosc >= 0 km"); setResult(null); return; }
    if (n > 400000)          { setError("Max 400 000 km"); setResult(null); return; }
    setError(""); setResult(calcSatellite(n));
  }, []);

  return (
    <main style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse 120% 80% at 50% -10%, rgba(20,30,80,0.9) 0%, #04050f 55%)",
      color: "#e0e8ff",
      fontFamily: "'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient blobs */}
      <div style={{
        position: "fixed", top: "-20%", left: "-10%",
        width: "60%", height: "60%", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(30,60,180,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: "-20%", right: "-10%",
        width: "50%", height: "50%", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,150,200,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", maxWidth: 780, margin: "0 auto", padding: "64px 28px 100px" }}>

        {/* HEADER */}
        <header style={{ marginBottom: 52 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(80,140,255,0.10)", border: "1px solid rgba(80,140,255,0.25)",
            borderRadius: 100, padding: "5px 14px", marginBottom: 24,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#60b4ff",
              boxShadow: "0 0 8px #60b4ff", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 11, color: "#80c0ff", letterSpacing: "0.18em", fontWeight: 500 }}>
              ORBITAL MECHANICS
            </span>
          </div>

          <h1 style={{
            fontSize: "clamp(48px, 9vw, 84px)",
            fontWeight: 900,
            lineHeight: 0.92,
            letterSpacing: "-0.04em",
            margin: "0 0 16px",
            background: "linear-gradient(135deg, #ffffff 30%, #80b8ff 70%, #40e0ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Space<br />Explorer
          </h1>
          <p style={{ fontSize: 15, color: "rgba(160,185,230,0.7)", letterSpacing: "0.02em", margin: 0, fontWeight: 400 }}>
            Kalkulator predkosci satelity & interaktywny model Ukladu Slonecznego
          </p>
        </header>

        {/* TABS */}
        <div style={{
          display: "flex", gap: 4, marginBottom: 36,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16, padding: 4,
        }}>
          {([["sat", "Satelita"], ["solar", "Uklad Sloneczny"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: "12px 16px",
              background: tab === key
                ? "linear-gradient(135deg, rgba(60,120,255,0.35), rgba(0,180,220,0.25))"
                : "transparent",
              border: tab === key ? "1px solid rgba(80,160,255,0.35)" : "1px solid transparent",
              borderRadius: 12,
              color: tab === key ? "#a0d4ff" : "rgba(160,185,220,0.45)",
              fontSize: 13, fontWeight: tab === key ? 600 : 400,
              letterSpacing: "0.06em", cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: tab === key ? "0 0 20px rgba(60,120,255,0.15)" : "none",
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* ─── SATELLITE TAB ─── */}
        {tab === "sat" && (
          <div>
            {/* Presets */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, color: "rgba(160,185,220,0.5)", letterSpacing: "0.18em",
                textTransform: "uppercase", marginBottom: 12 }}>
                Szybki wybor
              </div>
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
                {PRESETS.map((p) => (
                  <button key={p.name} onClick={() => {
                    setAltitude(String(p.altitude)); setActivePreset(p.name);
                    setError(""); setResult(calcSatellite(p.altitude));
                  }} title={p.description} style={{
                    background: activePreset === p.name
                      ? "rgba(60,140,255,0.20)"
                      : "rgba(255,255,255,0.04)",
                    border: activePreset === p.name
                      ? "1px solid rgba(80,160,255,0.5)"
                      : "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10, color: activePreset === p.name ? "#80c0ff" : "rgba(180,200,230,0.5)",
                    padding: "8px 18px", fontSize: 12, fontWeight: 500,
                    letterSpacing: "0.06em", cursor: "pointer", transition: "all 0.15s",
                  }}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ fontSize: 11, color: "rgba(160,185,220,0.5)", letterSpacing: "0.18em",
                textTransform: "uppercase", display: "block", marginBottom: 12 }}>
                Wysokosc nad powierzchnia Ziemi
              </label>
              <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
                <input
                  type="number" min={0} value={altitude}
                  onChange={(e) => { setAltitude(e.target.value); setActivePreset(""); calc(e.target.value); }}
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRight: "none",
                    borderRadius: "14px 0 0 14px",
                    color: "#fff", fontSize: 32, fontWeight: 700,
                    padding: "18px 24px", outline: "none",
                    fontFamily: "inherit", letterSpacing: "-0.02em",
                    boxSizing: "border-box" as const,
                  }}
                  placeholder="408"
                />
                <div style={{
                  background: "rgba(60,120,255,0.15)",
                  border: "1px solid rgba(80,160,255,0.25)",
                  borderLeft: "none",
                  borderRadius: "0 14px 14px 0",
                  padding: "0 24px",
                  fontSize: 18, fontWeight: 600, color: "#6090ff",
                  letterSpacing: "0.06em",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  whiteSpace: "nowrap" as const,
                }}>
                  KM
                </div>
              </div>
              {error && <p style={{ color: "#ff8060", fontSize: 13, marginTop: 10, letterSpacing: "0.04em" }}>{error}</p>}
            </div>

            {/* Results */}
            {result && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
                {/* Speed card */}
                <div style={{
                  background: "linear-gradient(135deg, rgba(0,180,220,0.12), rgba(0,100,180,0.08))",
                  border: "1px solid rgba(0,200,240,0.25)",
                  borderRadius: 20, padding: "28px 26px",
                  boxShadow: "0 0 40px rgba(0,200,240,0.08), inset 0 1px 0 rgba(255,255,255,0.07)",
                }}>
                  <div style={{ fontSize: 11, color: "rgba(0,220,255,0.6)", letterSpacing: "0.18em",
                    textTransform: "uppercase", marginBottom: 12 }}>
                    Predkosc orbitalna
                  </div>
                  <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1 }}>
                    {result.orbitalSpeed.toFixed(3)}
                    <span style={{ fontSize: 16, color: "rgba(0,220,255,0.7)", fontWeight: 500, marginLeft: 6 }}>km/s</span>
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(160,210,240,0.55)", marginTop: 10 }}>
                    ≈ {(result.orbitalSpeed * 3600).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} km/h
                  </div>
                </div>

                {/* Period card */}
                <div style={{
                  background: "linear-gradient(135deg, rgba(80,60,220,0.12), rgba(40,20,140,0.08))",
                  border: "1px solid rgba(120,100,255,0.25)",
                  borderRadius: 20, padding: "28px 26px",
                  boxShadow: "0 0 40px rgba(100,80,255,0.08), inset 0 1px 0 rgba(255,255,255,0.07)",
                }}>
                  <div style={{ fontSize: 11, color: "rgba(160,140,255,0.7)", letterSpacing: "0.18em",
                    textTransform: "uppercase", marginBottom: 12 }}>
                    Okres orbity
                  </div>
                  <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1 }}>
                    {formatPeriod(result.orbitalPeriod)}
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(180,170,255,0.5)", marginTop: 10 }}>
                    {(result.orbitalPeriod * 60).toFixed(0)} sekund
                  </div>
                </div>
              </div>
            )}

            {/* Formula accordion */}
            <details style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, overflow: "hidden",
            }}>
              <summary style={{
                padding: "16px 22px", cursor: "pointer", fontSize: 12,
                color: "rgba(160,185,220,0.5)", letterSpacing: "0.15em",
                userSelect: "none" as const, textTransform: "uppercase" as const,
                listStyle: "none",
              }}>
                Wzory i metodologia
              </summary>
              <div style={{ padding: "4px 22px 20px", display: "flex", flexDirection: "column" as const, gap: 12 }}>
                {[
                  ["Predkosc orbitalna", "v = √(GM / r)"],
                  ["Okres orbity",       "T = 2π·r / v"],
                ].map(([lbl, eq]) => (
                  <div key={lbl} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12,
                  }}>
                    <span style={{ fontSize: 12, color: "rgba(160,185,220,0.45)" }}>{lbl}</span>
                    <code style={{ fontSize: 14, color: "#60c8ff", fontFamily: "'SF Mono', monospace" }}>{eq}</code>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12,
                  fontSize: 11, color: "rgba(140,165,200,0.4)", letterSpacing: "0.04em" }}>
                  G = 6.674×10⁻¹¹ m³kg⁻¹s⁻² &nbsp;|&nbsp; M⊕ = 5.972×10²⁴ kg &nbsp;|&nbsp; R⊕ = 6 371 km
                </div>
              </div>
            </details>
          </div>
        )}

        {/* ─── SOLAR SYSTEM TAB ─── */}
        {tab === "solar" && (
          <div>
            <p style={{ fontSize: 12, color: "rgba(140,165,200,0.45)", letterSpacing: "0.15em",
              textTransform: "uppercase", textAlign: "center", marginBottom: 16 }}>
              Kliknij planete, aby zobaczyc szczegoly
            </p>

            {/* Planet quick-select pills */}
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, justifyContent: "center", marginBottom: 16 }}>
              {PLANETS.map((p) => {
                const active = selectedPlanet?.id === p.id;
                return (
                  <button key={p.id} onClick={() => setSelectedPlanet(active ? null : p)} style={{
                    display: "flex", alignItems: "center", gap: 7,
                    background: active ? `${p.glowColor}18` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${active ? p.glowColor + "50" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 100, padding: "6px 14px 6px 8px",
                    cursor: "pointer", transition: "all 0.15s",
                  }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: p.color,
                      boxShadow: active ? `0 0 8px ${p.glowColor}` : "none",
                    }} />
                    <span style={{ fontSize: 11, fontWeight: 500,
                      color: active ? p.glowColor : "rgba(180,200,230,0.45)",
                      letterSpacing: "0.06em" }}>
                      {p.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Canvas */}
            <div style={{
              borderRadius: 20, overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 0 80px rgba(0,40,120,0.3)",
            }}>
              <SolarCanvas
                onSelect={(p) => setSelectedPlanet(p?.id === selectedPlanet?.id ? null : p)}
                selectedId={selectedPlanet?.id ?? null}
              />
            </div>

            {/* Planet detail */}
            {selectedPlanet ? (
              <PlanetCard planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(88px,1fr))", gap: 8, marginTop: 16 }}>
                {PLANETS.map((p) => (
                  <button key={p.id} onClick={() => setSelectedPlanet(p)} style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 14, padding: "16px 8px 14px",
                    cursor: "pointer", display: "flex", flexDirection: "column" as const,
                    alignItems: "center", gap: 6, transition: "all 0.15s",
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: p.gradient,
                      boxShadow: `0 0 16px ${p.glowColor}40`,
                    }} />
                    <div style={{ fontSize: 11, color: "rgba(210,225,245,0.8)", fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: "rgba(140,165,200,0.45)" }}>{p.orbitalSpeedKms} km/s</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        details > summary::-webkit-details-marker { display: none; }
      `}</style>
    </main>
  );
}