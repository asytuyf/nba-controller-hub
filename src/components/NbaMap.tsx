"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useInput } from "@/lib/gamepad";
import clsx from "clsx";

// NBA teams - coordinates shifted right to be on land (viewBox 0 0 1000 589)
const NBA_TEAMS = [
  { id: 25, abbr: "POR", name: "Trail Blazers", city: "Portland", color: "#E03A3E", x: 195, y: 95, conference: "West", standing: 10, logo: "https://a.espncdn.com/i/teamlogos/nba/500/por.png" },
  { id: 10, abbr: "GSW", name: "Warriors", city: "Golden State", color: "#1D428A", x: 178, y: 220, conference: "West", standing: 4, logo: "https://a.espncdn.com/i/teamlogos/nba/500/gs.png" },
  { id: 26, abbr: "SAC", name: "Kings", city: "Sacramento", color: "#5A2D81", x: 185, y: 200, conference: "West", standing: 7, logo: "https://a.espncdn.com/i/teamlogos/nba/500/sac.png" },
  { id: 13, abbr: "LAC", name: "Clippers", city: "LA", color: "#C8102E", x: 192, y: 325, conference: "West", standing: 6, logo: "https://a.espncdn.com/i/teamlogos/nba/500/lac.png" },
  { id: 14, abbr: "LAL", name: "Lakers", city: "Los Angeles", color: "#552583", x: 182, y: 315, conference: "West", standing: 5, logo: "https://a.espncdn.com/i/teamlogos/nba/500/lal.png" },
  { id: 24, abbr: "PHX", name: "Suns", city: "Phoenix", color: "#1D1160", x: 275, y: 355, conference: "West", standing: 8, logo: "https://a.espncdn.com/i/teamlogos/nba/500/phx.png" },
  { id: 29, abbr: "UTA", name: "Jazz", city: "Utah", color: "#002B5C", x: 310, y: 240, conference: "West", standing: 12, logo: "https://a.espncdn.com/i/teamlogos/nba/500/utah.png" },
  { id: 8, abbr: "DEN", name: "Nuggets", city: "Denver", color: "#0E2240", x: 395, y: 275, conference: "West", standing: 1, logo: "https://a.espncdn.com/i/teamlogos/nba/500/den.png" },
  { id: 18, abbr: "MIN", name: "Timberwolves", city: "Minnesota", color: "#0C2340", x: 545, y: 130, conference: "West", standing: 3, logo: "https://a.espncdn.com/i/teamlogos/nba/500/min.png" },
  { id: 21, abbr: "OKC", name: "Thunder", city: "Oklahoma City", color: "#007AC1", x: 495, y: 340, conference: "West", standing: 2, logo: "https://a.espncdn.com/i/teamlogos/nba/500/okc.png" },
  { id: 7, abbr: "DAL", name: "Mavericks", city: "Dallas", color: "#00538C", x: 515, y: 385, conference: "West", standing: 9, logo: "https://a.espncdn.com/i/teamlogos/nba/500/dal.png" },
  { id: 27, abbr: "SAS", name: "Spurs", city: "San Antonio", color: "#C4CED4", x: 485, y: 445, conference: "West", standing: 14, logo: "https://a.espncdn.com/i/teamlogos/nba/500/sa.png" },
  { id: 11, abbr: "HOU", name: "Rockets", city: "Houston", color: "#CE1141", x: 550, y: 430, conference: "West", standing: 11, logo: "https://a.espncdn.com/i/teamlogos/nba/500/hou.png" },
  { id: 19, abbr: "NOP", name: "Pelicans", city: "New Orleans", color: "#0C2340", x: 615, y: 415, conference: "West", standing: 13, logo: "https://a.espncdn.com/i/teamlogos/nba/500/no.png" },
  { id: 15, abbr: "MEM", name: "Grizzlies", city: "Memphis", color: "#5D76A9", x: 645, y: 335, conference: "West", standing: 15, logo: "https://a.espncdn.com/i/teamlogos/nba/500/mem.png" },
  { id: 5, abbr: "CHI", name: "Bulls", city: "Chicago", color: "#CE1141", x: 640, y: 210, conference: "East", standing: 9, logo: "https://a.espncdn.com/i/teamlogos/nba/500/chi.png" },
  { id: 17, abbr: "MIL", name: "Bucks", city: "Milwaukee", color: "#00471B", x: 630, y: 175, conference: "East", standing: 3, logo: "https://a.espncdn.com/i/teamlogos/nba/500/mil.png" },
  { id: 12, abbr: "IND", name: "Pacers", city: "Indiana", color: "#002D62", x: 690, y: 250, conference: "East", standing: 6, logo: "https://a.espncdn.com/i/teamlogos/nba/500/ind.png" },
  { id: 9, abbr: "DET", name: "Pistons", city: "Detroit", color: "#C8102E", x: 725, y: 185, conference: "East", standing: 14, logo: "https://a.espncdn.com/i/teamlogos/nba/500/det.png" },
  { id: 6, abbr: "CLE", name: "Cavaliers", city: "Cleveland", color: "#860038", x: 765, y: 210, conference: "East", standing: 2, logo: "https://a.espncdn.com/i/teamlogos/nba/500/cle.png" },
  { id: 2, abbr: "BOS", name: "Celtics", city: "Boston", color: "#007A33", x: 940, y: 145, conference: "East", standing: 1, logo: "https://a.espncdn.com/i/teamlogos/nba/500/bos.png" },
  { id: 20, abbr: "NYK", name: "Knicks", city: "New York", color: "#F58426", x: 900, y: 170, conference: "East", standing: 4, logo: "https://a.espncdn.com/i/teamlogos/nba/500/ny.png" },
  { id: 3, abbr: "BKN", name: "Nets", city: "Brooklyn", color: "#000000", x: 910, y: 180, conference: "East", standing: 12, logo: "https://a.espncdn.com/i/teamlogos/nba/500/bkn.png" },
  { id: 23, abbr: "PHI", name: "76ers", city: "Philadelphia", color: "#006BB6", x: 880, y: 200, conference: "East", standing: 5, logo: "https://a.espncdn.com/i/teamlogos/nba/500/phi.png" },
  { id: 30, abbr: "WAS", name: "Wizards", city: "Washington", color: "#002B5C", x: 855, y: 240, conference: "East", standing: 15, logo: "https://a.espncdn.com/i/teamlogos/nba/500/wsh.png" },
  { id: 4, abbr: "CHA", name: "Hornets", city: "Charlotte", color: "#1D1160", x: 815, y: 300, conference: "East", standing: 13, logo: "https://a.espncdn.com/i/teamlogos/nba/500/cha.png" },
  { id: 1, abbr: "ATL", name: "Hawks", city: "Atlanta", color: "#E03A3E", x: 775, y: 350, conference: "East", standing: 8, logo: "https://a.espncdn.com/i/teamlogos/nba/500/atl.png" },
  { id: 22, abbr: "ORL", name: "Magic", city: "Orlando", color: "#0077C0", x: 810, y: 430, conference: "East", standing: 7, logo: "https://a.espncdn.com/i/teamlogos/nba/500/orl.png" },
  { id: 16, abbr: "MIA", name: "Heat", city: "Miami", color: "#98002E", x: 845, y: 500, conference: "East", standing: 10, logo: "https://a.espncdn.com/i/teamlogos/nba/500/mia.png" },
];

// State stamps/decorations - shifted to match land
const STATE_STAMPS = [
  { x: 205, y: 55, text: "☔", title: "Seattle" },
  { x: 175, y: 265, text: "🌉", title: "Bay Area" },
  { x: 200, y: 355, text: "🎬", title: "Hollywood" },
  { x: 260, y: 310, text: "🌵", title: "Desert" },
  { x: 350, y: 220, text: "🏔️", title: "Rockies" },
  { x: 540, y: 400, text: "🤠", title: "Texas" },
  { x: 665, y: 375, text: "🎺", title: "Jazz" },
  { x: 580, y: 160, text: "🌽", title: "Midwest" },
  { x: 715, y: 145, text: "🏭", title: "Motor City" },
  { x: 870, y: 145, text: "🗽", title: "NYC" },
  { x: 925, y: 125, text: "🦞", title: "Boston" },
  { x: 835, y: 475, text: "🏖️", title: "Miami Beach" },
  { x: 770, y: 385, text: "🍑", title: "Georgia" },
];

export default function NbaMap() {
  const router = useRouter();
  const { input, vibrate } = useInput();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const lastInputTime = useRef(0);

  // Admin mode (Square button) - hidden
  const [adminMode, setAdminMode] = useState(false);
  const [teamPositions, setTeamPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [dragging, setDragging] = useState<string | null>(null);

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const targetPan = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number>(0);

  const MAP_SIZE = 350;
  const PAN_RANGE = 40;

  const getTeamPos = (team: (typeof NBA_TEAMS)[0]) => {
    return teamPositions[team.abbr] || { x: team.x, y: team.y };
  };

  // Smooth animation
  useEffect(() => {
    const animate = () => {
      setPan((current) => ({
        x: current.x + (targetPan.current.x - current.x) * 0.04,
        y: current.y + (targetPan.current.y - current.y) * 0.04,
      }));
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Mouse/touch handler
  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = ((clientX - rect.left) / rect.width - 0.5) * 2;
    const mouseY = ((clientY - rect.top) / rect.height - 0.5) * 2;
    targetPan.current = { x: -mouseX * PAN_RANGE, y: -mouseY * PAN_RANGE };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (adminMode && dragging && svgRef.current) {
      const svg = svgRef.current;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
      setTeamPositions((prev) => ({
        ...prev,
        [dragging]: { x: Math.round(svgP.x), y: Math.round(svgP.y) },
      }));
      return;
    }
    handlePointerMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleMouseUp = () => {
    if (dragging) {
      const pos = teamPositions[dragging];
      if (pos) console.log(`${dragging}: x: ${pos.x}, y: ${pos.y}`);
      setDragging(null);
    }
  };

  const exportPositions = () => {
    const output = NBA_TEAMS.map((team) => {
      const pos = getTeamPos(team);
      return `  { id: ${team.id}, abbr: "${team.abbr}", name: "${team.name}", city: "${team.city}", color: "${team.color}", x: ${pos.x}, y: ${pos.y}, conference: "${team.conference}", standing: ${team.standing}, logo: "${team.logo}" },`;
    });
    console.log("const NBA_TEAMS = [\n" + output.join("\n") + "\n];");
  };

  // Gamepad controls
  useEffect(() => {
    if (!input) return;
    const now = Date.now();

    // Square button (button 2) for admin mode
    if (input.buttons[2] && now - lastInputTime.current >= 500) {
      setAdminMode((prev) => !prev);
      vibrate?.(100);
      lastInputTime.current = now;
      return;
    }

    if (adminMode) return;
    if (now - lastInputTime.current < 180) return;

    const axes = input.axes || [0, 0, 0, 0];
    const threshold = 0.5;
    const currentTeam = NBA_TEAMS[focusedIndex];
    const currentPos = getTeamPos(currentTeam);

    if (input.buttons[15] || axes[0] > threshold) {
      const t = NBA_TEAMS.map((t, i) => ({ ...t, i, pos: getTeamPos(t) }))
        .filter((t) => t.pos.x > currentPos.x + 20)
        .sort((a, b) => Math.abs(a.pos.y - currentPos.y) - Math.abs(b.pos.y - currentPos.y));
      if (t.length > 0) { setFocusedIndex(t[0].i); vibrate?.(30); lastInputTime.current = now; }
    } else if (input.buttons[14] || axes[0] < -threshold) {
      const t = NBA_TEAMS.map((t, i) => ({ ...t, i, pos: getTeamPos(t) }))
        .filter((t) => t.pos.x < currentPos.x - 20)
        .sort((a, b) => Math.abs(a.pos.y - currentPos.y) - Math.abs(b.pos.y - currentPos.y));
      if (t.length > 0) { setFocusedIndex(t[0].i); vibrate?.(30); lastInputTime.current = now; }
    } else if (input.buttons[13] || axes[1] > threshold) {
      const t = NBA_TEAMS.map((t, i) => ({ ...t, i, pos: getTeamPos(t) }))
        .filter((t) => t.pos.y > currentPos.y + 20)
        .sort((a, b) => Math.abs(a.pos.x - currentPos.x) - Math.abs(b.pos.x - currentPos.x));
      if (t.length > 0) { setFocusedIndex(t[0].i); vibrate?.(30); lastInputTime.current = now; }
    } else if (input.buttons[12] || axes[1] < -threshold) {
      const t = NBA_TEAMS.map((t, i) => ({ ...t, i, pos: getTeamPos(t) }))
        .filter((t) => t.pos.y < currentPos.y - 20)
        .sort((a, b) => Math.abs(a.pos.x - currentPos.x) - Math.abs(b.pos.x - currentPos.x));
      if (t.length > 0) { setFocusedIndex(t[0].i); vibrate?.(30); lastInputTime.current = now; }
    }

    if (input.buttons[0] && now - lastInputTime.current >= 300) {
      vibrate?.(80);
      router.push(`/team/${NBA_TEAMS[focusedIndex].id}`);
      lastInputTime.current = now;
    }

    // Circle button - back to home
    if (input.buttons[1] && now - lastInputTime.current >= 300) {
      vibrate?.(50);
      router.push("/");
      lastInputTime.current = now;
    }
  }, [input, focusedIndex, router, vibrate, adminMode, teamPositions]);

  const focusedTeam = NBA_TEAMS[focusedIndex];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden touch-none"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchEnd={handleMouseUp}
      style={{
        background: "radial-gradient(ellipse at center, #0a3d5f 0%, #052035 60%, #020d18 100%)",
      }}
    >
      {/* Ocean waves */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 25 Q50 5 100 25 T200 25' fill='none' stroke='white' stroke-width='2'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 50px",
            animation: "waveShift 8s linear infinite",
          }}
        />
      </div>

      {/* Globe curvature container */}
      <div
        className="absolute inset-0"
        style={{
          perspective: "1200px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        {/* Curved map surface - like Earth's curvature */}
        <div
          className="absolute"
          style={{
            width: `${MAP_SIZE}vw`,
            height: `${MAP_SIZE * 0.589}vw`,
            left: "50%",
            top: "50%",
            marginLeft: `-${MAP_SIZE / 2}vw`,
            marginTop: `-${(MAP_SIZE * 0.589) / 2}vw`,
            transform: `translate(${pan.x}%, ${pan.y}%) rotateX(25deg)`,
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
        {/* USA Map */}
        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox="0 0 1000 589"
          preserveAspectRatio="xMidYMid meet"
          style={{ filter: "drop-shadow(0 15px 60px rgba(0,0,0,0.7))" }}
        >
          <image href="/us-map.svg" x="0" y="0" width="1000" height="589" />

          {/* State stamps */}
          {STATE_STAMPS.map((stamp, i) => (
            <g key={i} opacity={0.6}>
              <text
                x={stamp.x}
                y={stamp.y}
                fontSize="24"
                textAnchor="middle"
                style={{ pointerEvents: "none" }}
              >
                {stamp.text}
              </text>
            </g>
          ))}

          {/* Pins */}
          {NBA_TEAMS.map((team, index) => {
            const isFocused = focusedIndex === index;
            const pos = getTeamPos(team);
            const r = isFocused ? 14 : 10;

            return (
              <g
                key={team.id}
                className={adminMode ? "cursor-grab" : "cursor-pointer"}
                onClick={() => !adminMode && router.push(`/team/${team.id}`)}
                onMouseEnter={() => !adminMode && setFocusedIndex(index)}
                onMouseDown={() => adminMode && setDragging(team.abbr)}
              >
                {isFocused && (
                  <circle cx={pos.x} cy={pos.y} r={r + 6} fill={team.color} opacity={0.4} />
                )}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={r}
                  fill={team.color}
                  stroke="white"
                  strokeWidth={isFocused ? 2.5 : 1.5}
                  style={{
                    filter: isFocused
                      ? `drop-shadow(0 0 10px ${team.color})`
                      : "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                  }}
                />
                <image
                  href={team.logo}
                  x={pos.x - (isFocused ? 9 : 6)}
                  y={pos.y - (isFocused ? 9 : 6)}
                  width={isFocused ? 18 : 12}
                  height={isFocused ? 18 : 12}
                  style={{ pointerEvents: "none" }}
                />
                {(isFocused || adminMode) && (
                  <>
                    <rect
                      x={pos.x - 30}
                      y={pos.y + r + 5}
                      width={60}
                      height={16}
                      rx={4}
                      fill={team.color}
                    />
                    <text
                      x={pos.x}
                      y={pos.y + r + 16}
                      textAnchor="middle"
                      fill="white"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="system-ui"
                      style={{ pointerEvents: "none" }}
                    >
                      {adminMode ? `${team.abbr} (${pos.x},${pos.y})` : team.city}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
        </div>
      </div>

      {/* Subtle edge fade - helps globe effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 80% at center, transparent 40%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {/* Info panel */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-black/85 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/10 min-w-[220px] sm:min-w-[280px] z-50">
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center p-2"
            style={{ backgroundColor: `${focusedTeam.color}30`, boxShadow: `0 0 25px ${focusedTeam.color}50` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={focusedTeam.logo} alt="" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-base sm:text-lg font-bold text-white">{focusedTeam.city} {focusedTeam.name}</p>
            <p className="text-xs sm:text-sm text-white/50">{focusedTeam.conference}ern Conference</p>
            <p className="text-xs sm:text-sm font-bold" style={{ color: focusedTeam.color }}>
              #{focusedTeam.standing} in {focusedTeam.conference}
            </p>
          </div>
        </div>
      </div>

      {/* Admin panel */}
      {adminMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-900/90 backdrop-blur-xl rounded-xl px-5 py-3 border border-red-500/50 z-50 flex items-center gap-4">
          <span className="text-red-200 text-sm font-bold">ADMIN</span>
          <span className="text-red-300/70 text-xs">Drag pins</span>
          <button
            onClick={exportPositions}
            className="bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded text-white text-xs font-bold"
          >
            Export
          </button>
        </div>
      )}

      {/* Back */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-black/85 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-white/10 text-white text-xs sm:text-sm hover:bg-white/20 transition-colors z-50"
      >
        ← Back
      </button>

      {/* Controls - hide on mobile */}
      <div className="hidden sm:flex absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/85 px-5 py-2.5 rounded-full border border-white/10 text-sm text-white/60 z-50 items-center gap-3">
        <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">D-Pad</kbd> Navigate</span>
        <span className="text-white/30">|</span>
        <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">✕</kbd> Select</span>
        <span className="text-white/30">|</span>
        <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">○</kbd> Back</span>
      </div>

      {/* Mobile hint */}
      <div className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/85 px-4 py-2 rounded-full border border-white/10 text-xs text-white/60 z-50">
        Drag to explore • Tap team to select
      </div>

      <style jsx>{`
        @keyframes waveShift {
          0% { background-position-x: 0; }
          100% { background-position-x: 200px; }
        }
      `}</style>
    </div>
  );
}
