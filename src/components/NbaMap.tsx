"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useInput } from "@/lib/gamepad";
import clsx from "clsx";

// NBA teams - coordinates based on actual SVG state positions (viewBox 0 0 1000 589)
const NBA_TEAMS = [
  { id: 25, abbr: "POR", name: "Trail Blazers", city: "Portland", color: "#E03A3E", x: 140, y: 115, conference: "West", standing: 10, logo: "https://a.espncdn.com/i/teamlogos/nba/500/por.png" },
  { id: 10, abbr: "GSW", name: "Warriors", city: "Golden State", color: "#1D428A", x: 80, y: 245, conference: "West", standing: 4, logo: "https://a.espncdn.com/i/teamlogos/nba/500/gs.png" },
  { id: 26, abbr: "SAC", name: "Kings", city: "Sacramento", color: "#5A2D81", x: 95, y: 215, conference: "West", standing: 7, logo: "https://a.espncdn.com/i/teamlogos/nba/500/sac.png" },
  { id: 13, abbr: "LAC", name: "Clippers", city: "LA", color: "#C8102E", x: 115, y: 340, conference: "West", standing: 6, logo: "https://a.espncdn.com/i/teamlogos/nba/500/lac.png" },
  { id: 14, abbr: "LAL", name: "Lakers", city: "Los Angeles", color: "#552583", x: 105, y: 330, conference: "West", standing: 5, logo: "https://a.espncdn.com/i/teamlogos/nba/500/lal.png" },
  { id: 24, abbr: "PHX", name: "Suns", city: "Phoenix", color: "#1D1160", x: 220, y: 355, conference: "West", standing: 8, logo: "https://a.espncdn.com/i/teamlogos/nba/500/phx.png" },
  { id: 29, abbr: "UTA", name: "Jazz", city: "Utah", color: "#002B5C", x: 265, y: 235, conference: "West", standing: 12, logo: "https://a.espncdn.com/i/teamlogos/nba/500/utah.png" },
  { id: 8, abbr: "DEN", name: "Nuggets", city: "Denver", color: "#0E2240", x: 340, y: 270, conference: "West", standing: 1, logo: "https://a.espncdn.com/i/teamlogos/nba/500/den.png" },
  { id: 18, abbr: "MIN", name: "Timberwolves", city: "Minnesota", color: "#0C2340", x: 500, y: 145, conference: "West", standing: 3, logo: "https://a.espncdn.com/i/teamlogos/nba/500/min.png" },
  { id: 21, abbr: "OKC", name: "Thunder", city: "Oklahoma City", color: "#007AC1", x: 460, y: 340, conference: "West", standing: 2, logo: "https://a.espncdn.com/i/teamlogos/nba/500/okc.png" },
  { id: 7, abbr: "DAL", name: "Mavericks", city: "Dallas", color: "#00538C", x: 450, y: 400, conference: "West", standing: 9, logo: "https://a.espncdn.com/i/teamlogos/nba/500/dal.png" },
  { id: 27, abbr: "SAS", name: "Spurs", city: "San Antonio", color: "#C4CED4", x: 410, y: 455, conference: "West", standing: 14, logo: "https://a.espncdn.com/i/teamlogos/nba/500/sa.png" },
  { id: 11, abbr: "HOU", name: "Rockets", city: "Houston", color: "#CE1141", x: 485, y: 440, conference: "West", standing: 11, logo: "https://a.espncdn.com/i/teamlogos/nba/500/hou.png" },
  { id: 19, abbr: "NOP", name: "Pelicans", city: "New Orleans", color: "#0C2340", x: 565, y: 430, conference: "West", standing: 13, logo: "https://a.espncdn.com/i/teamlogos/nba/500/no.png" },
  { id: 15, abbr: "MEM", name: "Grizzlies", city: "Memphis", color: "#5D76A9", x: 580, y: 340, conference: "West", standing: 15, logo: "https://a.espncdn.com/i/teamlogos/nba/500/mem.png" },
  { id: 5, abbr: "CHI", name: "Bulls", city: "Chicago", color: "#CE1141", x: 605, y: 215, conference: "East", standing: 9, logo: "https://a.espncdn.com/i/teamlogos/nba/500/chi.png" },
  { id: 17, abbr: "MIL", name: "Bucks", city: "Milwaukee", color: "#00471B", x: 590, y: 175, conference: "East", standing: 3, logo: "https://a.espncdn.com/i/teamlogos/nba/500/mil.png" },
  { id: 12, abbr: "IND", name: "Pacers", city: "Indiana", color: "#002D62", x: 650, y: 250, conference: "East", standing: 6, logo: "https://a.espncdn.com/i/teamlogos/nba/500/ind.png" },
  { id: 9, abbr: "DET", name: "Pistons", city: "Detroit", color: "#C8102E", x: 680, y: 190, conference: "East", standing: 14, logo: "https://a.espncdn.com/i/teamlogos/nba/500/det.png" },
  { id: 6, abbr: "CLE", name: "Cavaliers", city: "Cleveland", color: "#860038", x: 720, y: 215, conference: "East", standing: 2, logo: "https://a.espncdn.com/i/teamlogos/nba/500/cle.png" },
  { id: 2, abbr: "BOS", name: "Celtics", city: "Boston", color: "#007A33", x: 920, y: 160, conference: "East", standing: 1, logo: "https://a.espncdn.com/i/teamlogos/nba/500/bos.png" },
  { id: 20, abbr: "NYK", name: "Knicks", city: "New York", color: "#F58426", x: 880, y: 190, conference: "East", standing: 4, logo: "https://a.espncdn.com/i/teamlogos/nba/500/ny.png" },
  { id: 3, abbr: "BKN", name: "Nets", city: "Brooklyn", color: "#000000", x: 890, y: 200, conference: "East", standing: 12, logo: "https://a.espncdn.com/i/teamlogos/nba/500/bkn.png" },
  { id: 23, abbr: "PHI", name: "76ers", city: "Philadelphia", color: "#006BB6", x: 865, y: 220, conference: "East", standing: 5, logo: "https://a.espncdn.com/i/teamlogos/nba/500/phi.png" },
  { id: 30, abbr: "WAS", name: "Wizards", city: "Washington", color: "#002B5C", x: 840, y: 255, conference: "East", standing: 15, logo: "https://a.espncdn.com/i/teamlogos/nba/500/wsh.png" },
  { id: 4, abbr: "CHA", name: "Hornets", city: "Charlotte", color: "#1D1160", x: 780, y: 315, conference: "East", standing: 13, logo: "https://a.espncdn.com/i/teamlogos/nba/500/cha.png" },
  { id: 1, abbr: "ATL", name: "Hawks", city: "Atlanta", color: "#E03A3E", x: 725, y: 360, conference: "East", standing: 8, logo: "https://a.espncdn.com/i/teamlogos/nba/500/atl.png" },
  { id: 22, abbr: "ORL", name: "Magic", city: "Orlando", color: "#0077C0", x: 785, y: 435, conference: "East", standing: 7, logo: "https://a.espncdn.com/i/teamlogos/nba/500/orl.png" },
  { id: 16, abbr: "MIA", name: "Heat", city: "Miami", color: "#98002E", x: 820, y: 500, conference: "East", standing: 10, logo: "https://a.espncdn.com/i/teamlogos/nba/500/mia.png" },
];

export default function NbaMap() {
  const router = useRouter();
  const { input, vibrate } = useInput();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const lastInputTime = useRef(0);

  // Admin mode (Square button / button 2) - hidden feature
  const [adminMode, setAdminMode] = useState(false);
  const [teamPositions, setTeamPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [dragging, setDragging] = useState<string | null>(null);

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const targetPan = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number>(0);

  // Map is HUGE - goes way off screen
  const MAP_SIZE = 350; // vw - massive
  const PAN_RANGE = 40; // % - can pan a lot to explore

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

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    targetPan.current = { x: -mouseX * PAN_RANGE, y: -mouseY * PAN_RANGE };
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

    // Square button (button 2) for admin mode - secret
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

    // Circle button (button 1) - back to home
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
      className="fixed inset-0 w-screen h-screen overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
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
        <div
          className="absolute inset-0 opacity-8"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 15 Q30 3 60 15 T120 15' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundSize: "120px 30px",
            animation: "waveShift 12s linear infinite reverse",
          }}
        />
      </div>

      {/* Massive map that goes off screen - 2D pannable */}
      <div
        className="absolute"
        style={{
          width: `${MAP_SIZE}vw`,
          height: `${MAP_SIZE * 0.589}vw`,
          left: "50%",
          top: "50%",
          marginLeft: `-${MAP_SIZE / 2}vw`,
          marginTop: `-${(MAP_SIZE * 0.589) / 2}vw`,
          transform: `translate(${pan.x}%, ${pan.y}%)`,
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

            {/* Pins */}
            {NBA_TEAMS.map((team, index) => {
              const isFocused = focusedIndex === index;
              const pos = getTeamPos(team);
              const r = isFocused ? 16 : 12;

              return (
                <g
                  key={team.id}
                  className={adminMode ? "cursor-grab" : "cursor-pointer"}
                  onClick={() => !adminMode && router.push(`/team/${team.id}`)}
                  onMouseEnter={() => !adminMode && setFocusedIndex(index)}
                  onMouseDown={() => adminMode && setDragging(team.abbr)}
                >
                  {isFocused && (
                    <circle cx={pos.x} cy={pos.y} r={r + 8} fill={team.color} opacity={0.4} />
                  )}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={r}
                    fill={team.color}
                    stroke="white"
                    strokeWidth={isFocused ? 3 : 2}
                    style={{
                      filter: isFocused
                        ? `drop-shadow(0 0 12px ${team.color})`
                        : "drop-shadow(0 2px 6px rgba(0,0,0,0.5))",
                    }}
                  />
                  <image
                    href={team.logo}
                    x={pos.x - (isFocused ? 10 : 7)}
                    y={pos.y - (isFocused ? 10 : 7)}
                    width={isFocused ? 20 : 14}
                    height={isFocused ? 20 : 14}
                    style={{ pointerEvents: "none" }}
                  />
                  {(isFocused || adminMode) && (
                    <>
                      <rect
                        x={pos.x - 35}
                        y={pos.y + r + 6}
                        width={70}
                        height={20}
                        rx={6}
                        fill={team.color}
                      />
                      <text
                        x={pos.x}
                        y={pos.y + r + 19}
                        textAnchor="middle"
                        fill="white"
                        fontSize="11"
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

      {/* Vignette for lens effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 70% at center, transparent 20%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* Info panel */}
      <div className="absolute top-6 left-6 bg-black/85 backdrop-blur-xl rounded-2xl p-5 border border-white/10 min-w-[280px] z-50">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center p-2"
            style={{ backgroundColor: `${focusedTeam.color}30`, boxShadow: `0 0 25px ${focusedTeam.color}50` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={focusedTeam.logo} alt="" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{focusedTeam.city} {focusedTeam.name}</p>
            <p className="text-sm text-white/50">{focusedTeam.conference}ern Conference</p>
            <p className="text-sm font-bold" style={{ color: focusedTeam.color }}>
              #{focusedTeam.standing} in {focusedTeam.conference}
            </p>
          </div>
        </div>
      </div>

      {/* Admin panel - only shows in admin mode */}
      {adminMode && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-900/90 backdrop-blur-xl rounded-xl px-5 py-3 border border-red-500/50 z-50 flex items-center gap-4">
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
        className="absolute top-6 right-6 bg-black/85 rounded-full px-4 py-2 border border-white/10 text-white text-sm hover:bg-white/20 transition-colors z-50"
      >
        ← Back
      </button>

      {/* Controls - no admin mention */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/85 px-5 py-2.5 rounded-full border border-white/10 text-sm text-white/60 z-50 flex items-center gap-3">
        <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">D-Pad</kbd> Navigate</span>
        <span className="text-white/30">|</span>
        <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">✕</kbd> Select Team</span>
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
