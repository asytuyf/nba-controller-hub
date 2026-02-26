"use client";

import { useInput } from "@/lib/gamepad";
import BackButton from "@/components/BackButton";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Clock, MapPin, Users, Calendar } from "lucide-react";
import {
  fetchTeamGames,
  fetchPlayersByTeam,
  formatGameDate,
  didTeamWin,
  getCurrentSeason,
} from "@/lib/nba-api";
import { getTeamById, getTeamLogo, type NbaGame, type NbaPlayer } from "@/types/nba";

type ViewMode = "games" | "roster";

interface TeamHubProps {
  teamId: number;
}

// Convert height from feet-inches to cm
function convertHeightToMetric(height: string): string {
  const match = height.match(/(\d+)-(\d+)/);
  if (!match) return height;
  const feet = parseInt(match[1]);
  const inches = parseInt(match[2]);
  const totalInches = feet * 12 + inches;
  const cm = Math.round(totalInches * 2.54);
  return `${cm} cm`;
}

export default function TeamHub({ teamId }: TeamHubProps) {
  const router = useRouter();
  const { input, vibrate } = useInput();
  const [viewMode, setViewMode] = useState<ViewMode>("games");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [games, setGames] = useState<NbaGame[]>([]);
  const [players, setPlayers] = useState<NbaPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastInputTime = useRef(0);
  const INPUT_DELAY = 150;

  const team = getTeamById(teamId);
  const season = getCurrentSeason();

  // Fetch team data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [gamesData, playersData] = await Promise.all([
          fetchTeamGames(teamId),
          fetchPlayersByTeam(teamId),
        ]);
        setGames(gamesData);
        setPlayers(playersData);
      } catch (err) {
        console.error("Failed to load team data:", err);
        setError("Failed to load team data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [teamId, season]);

  useEffect(() => {
    if (!input) return;

    const now = Date.now();
    if (now - lastInputTime.current < INPUT_DELAY) return;

    const { buttons, axes } = input;

    // Navigate up/down
    let direction = 0;
    if (buttons[12] || axes[1] < -0.5) direction = -1;
    if (buttons[13] || axes[1] > 0.5) direction = 1;

    const maxIndex = viewMode === "games" ? games.length - 1 : players.length - 1;

    if (direction !== 0) {
      setFocusedIndex((prev) => {
        let next = prev + direction;
        if (next < 0) next = maxIndex;
        if (next > maxIndex) next = 0;
        return next;
      });
      vibrate(30, 0.3, 0);
      lastInputTime.current = now;
    }

    // Switch tabs with L1/R1 (buttons 4/5)
    if ((buttons[4] || buttons[5]) && now - lastInputTime.current > 300) {
      setViewMode((prev) => (prev === "games" ? "roster" : "games"));
      setFocusedIndex(0);
      vibrate(50, 0.5, 0);
      lastInputTime.current = now;
    }

    // Circle button (button 1) - back to map
    if (buttons[1] && now - lastInputTime.current > 300) {
      vibrate(50, 0.4, 0);
      router.push("/nba");
      lastInputTime.current = now;
    }
  }, [input, viewMode, games.length, players.length, vibrate, router]);

  if (!team) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#030305] text-white">
        <p>Team not found</p>
      </div>
    );
  }

  const wins = games.filter((g) => didTeamWin(g, teamId)).length;
  const losses = games.length - wins;
  const focusedGame = games[focusedIndex];
  const focusedPlayer = players[focusedIndex];

  return (
    <div className="flex flex-col min-h-screen bg-[#030305] text-white overflow-hidden p-8 pt-24 relative">
      <BackButton />

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: team.color }}
        />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gray-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto w-full relative z-10">
        <div className="flex items-center gap-5">
          {/* Team Logo */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center p-2 border-2 shadow-xl"
            style={{
              backgroundColor: `${team.color}15`,
              borderColor: `${team.color}30`,
              boxShadow: `0 0 40px ${team.color}25`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={team.logo}
              alt={team.fullName}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1
              className="text-3xl font-bold bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${team.color}, #fff)`,
              }}
            >
              {team.fullName}
            </h1>
            <p className="text-gray-500 text-sm flex items-center gap-2">
              <span>{team.conference}ern Conference</span>
              <span className="text-gray-700">•</span>
              <span>{season}-{(season + 1).toString().slice(2)} Season</span>
            </p>
          </div>
        </div>

        {/* Record */}
        {!loading && games.length > 0 && (
          <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-800 rounded-full px-4 py-2 backdrop-blur-sm">
            <span className="text-emerald-400 font-bold">{wins}W</span>
            <span className="text-gray-600">-</span>
            <span className="text-red-400 font-bold">{losses}L</span>
          </div>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6 max-w-6xl mx-auto w-full relative z-10">
        <button
          onClick={() => {
            setViewMode("games");
            setFocusedIndex(0);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            viewMode === "games"
              ? "bg-gray-800 text-white"
              : "bg-gray-900/40 text-gray-500 hover:text-gray-300"
          }`}
        >
          <Calendar size={16} />
          <span className="text-sm font-medium">Games</span>
        </button>
        <button
          onClick={() => {
            setViewMode("roster");
            setFocusedIndex(0);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            viewMode === "roster"
              ? "bg-gray-800 text-white"
              : "bg-gray-900/40 text-gray-500 hover:text-gray-300"
          }`}
        >
          <Users size={16} />
          <span className="text-sm font-medium">Roster</span>
        </button>
        <div className="ml-auto text-xs text-gray-600 flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-gray-900 border border-gray-800 rounded">L1/R1</kbd>
          Switch tabs
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 relative z-10">
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: `${team.color}50`, borderTopColor: "transparent" }}
            />
            <p className="text-gray-500 text-sm">Loading {team.name} data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-20 relative z-10">
          <p className="text-red-400">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto relative z-10">
          {/* List */}
          <div className="lg:col-span-1 space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-800">
            <AnimatePresence mode="wait">
              {viewMode === "games" ? (
                <motion.div
                  key="games"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
                  {games.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-2">No games data available</p>
                      <p className="text-gray-600 text-xs">Add BALLDONTLIE_API_KEY to .env</p>
                    </div>
                  ) : (
                    games.map((game, index) => {
                      const isFocused = index === focusedIndex;
                      const isHome = game.home_team.id === teamId;
                      const opponent = isHome ? game.visitor_team : game.home_team;
                      const won = didTeamWin(game, teamId);
                      const teamScore = isHome ? game.home_team_score : game.visitor_team_score;
                      const oppScore = isHome ? game.visitor_team_score : game.home_team_score;

                      return (
                        <motion.div
                          key={game.id}
                          className={`p-4 rounded-xl border cursor-pointer relative transition-all duration-200
                            ${isFocused
                              ? "bg-gray-900/80 scale-[1.02]"
                              : "bg-gray-900/30 border-gray-800/50 opacity-50 hover:opacity-70"
                            }
                          `}
                          style={{
                            borderColor: isFocused ? `${team.color}50` : undefined,
                          }}
                          onClick={() => setFocusedIndex(index)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-800/50 flex items-center justify-center p-1.5 overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={getTeamLogo(opponent.abbreviation)}
                                  alt={opponent.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div>
                                <h3 className={`font-semibold text-sm ${isFocused ? "text-white" : "text-gray-400"}`}>
                                  {isHome ? "vs" : "@"} {opponent.name}
                                </h3>
                                <p className="text-xs text-gray-600">{formatGameDate(game.date)}</p>
                              </div>
                            </div>
                            {game.status === "Final" && (
                              <div className="text-right">
                                <div
                                  className={`text-sm font-bold px-2 py-1 rounded ${
                                    won ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                                  }`}
                                >
                                  {won ? "W" : "L"}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {teamScore}-{oppScore}
                                </p>
                              </div>
                            )}
                          </div>

                          {isFocused && (
                            <motion.div
                              layoutId="list-indicator"
                              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                              style={{ backgroundColor: team.color }}
                            />
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="roster"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-3"
                >
                  {players.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-2">No roster data available</p>
                      <p className="text-gray-600 text-xs">Add BALLDONTLIE_API_KEY to .env</p>
                    </div>
                  ) : (
                    players.map((player, index) => {
                      const isFocused = index === focusedIndex;
                      return (
                        <motion.div
                          key={player.id}
                          className={`p-4 rounded-xl border cursor-pointer relative transition-all duration-200
                            ${isFocused
                              ? "bg-gray-900/80 scale-[1.02]"
                              : "bg-gray-900/30 border-gray-800/50 opacity-50 hover:opacity-70"
                            }
                          `}
                          style={{
                            borderColor: isFocused ? `${team.color}50` : undefined,
                          }}
                          onClick={() => setFocusedIndex(index)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
                                style={{ backgroundColor: `${team.color}20`, color: team.color }}
                              >
                                {player.jersey_number || "—"}
                              </div>
                              <div>
                                <h3 className={`font-semibold text-sm ${isFocused ? "text-white" : "text-gray-400"}`}>
                                  {player.first_name} {player.last_name}
                                </h3>
                                <p className="text-xs text-gray-600">{player.position || "N/A"}</p>
                              </div>
                            </div>
                          </div>

                          {isFocused && (
                            <motion.div
                              layoutId="list-indicator"
                              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                              style={{ backgroundColor: team.color }}
                            />
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-2 bg-gray-900/40 rounded-2xl border border-gray-800/50 p-6 flex flex-col overflow-hidden relative backdrop-blur-sm">
            <AnimatePresence mode="wait">
              {viewMode === "games" && focusedGame ? (
                <motion.div
                  key={`game-${focusedGame.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col"
                >
                  {(() => {
                    const isHome = focusedGame.home_team.id === teamId;
                    const opponent = isHome ? focusedGame.visitor_team : focusedGame.home_team;
                    const won = didTeamWin(focusedGame, teamId);
                    const teamScore = isHome ? focusedGame.home_team_score : focusedGame.visitor_team_score;
                    const oppScore = isHome ? focusedGame.visitor_team_score : focusedGame.home_team_score;

                    return (
                      <>
                        {/* Score */}
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-6">
                            {/* Team */}
                            <div className="flex items-center gap-4">
                              <div
                                className="w-16 h-16 rounded-xl flex items-center justify-center p-2"
                                style={{ backgroundColor: `${team.color}15` }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
                              </div>
                              <div className="text-center">
                                <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">{team.abbr}</p>
                                <div className="text-5xl font-bold" style={{ color: team.color }}>
                                  {teamScore}
                                </div>
                              </div>
                            </div>
                            <div className="text-gray-700 text-2xl font-light">—</div>
                            {/* Opponent */}
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">{opponent.abbreviation}</p>
                                <div className="text-5xl font-bold text-white">{oppScore}</div>
                              </div>
                              <div className="w-16 h-16 rounded-xl flex items-center justify-center p-2 bg-gray-800/50">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={getTeamLogo(opponent.abbreviation)} alt={opponent.name} className="w-full h-full object-contain" />
                              </div>
                            </div>
                          </div>
                          {focusedGame.status === "Final" && (
                            <div
                              className={`px-3 py-1.5 rounded-full font-semibold text-xs flex items-center gap-1.5
                              ${won ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}
                            `}
                            >
                              {won ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                              {won ? "WIN" : "LOSS"}
                            </div>
                          )}
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-gray-950/50 p-4 rounded-xl border border-gray-800/50">
                            <div className="flex items-center gap-2 mb-2" style={{ color: team.color }}>
                              <Clock size={16} />
                              <span className="text-xs font-medium uppercase tracking-wider">Date</span>
                            </div>
                            <p className="text-lg font-semibold">{formatGameDate(focusedGame.date)}</p>
                            <p className="text-gray-600 text-xs">{focusedGame.status}</p>
                          </div>

                          <div className="bg-gray-950/50 p-4 rounded-xl border border-gray-800/50">
                            <div className="flex items-center gap-2 mb-2 text-cyan-400">
                              <MapPin size={16} />
                              <span className="text-xs font-medium uppercase tracking-wider">Venue</span>
                            </div>
                            <p className="text-lg font-semibold">{isHome ? "Home" : "Away"}</p>
                            <p className="text-gray-600 text-xs">
                              {isHome ? team.city : opponent.city}
                            </p>
                          </div>
                        </div>

                        {/* Season indicator */}
                        <div
                          className="mt-auto p-4 rounded-xl border"
                          style={{
                            backgroundColor: `${team.color}10`,
                            borderColor: `${team.color}20`,
                          }}
                        >
                          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: team.color }}>
                            Season {focusedGame.season}
                          </p>
                          <div className="text-lg font-bold text-white">
                            {focusedGame.postseason ? "Playoffs" : "Regular Season"}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              ) : viewMode === "roster" && focusedPlayer ? (
                <motion.div
                  key={`player-${focusedPlayer.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col"
                >
                  {/* Player Header */}
                  <div className="flex items-center gap-6 mb-6">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold"
                      style={{ backgroundColor: `${team.color}20`, color: team.color }}
                    >
                      {focusedPlayer.jersey_number || "—"}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {focusedPlayer.first_name} {focusedPlayer.last_name}
                      </h2>
                      <p className="text-gray-500">{focusedPlayer.position || "Position N/A"}</p>
                    </div>
                  </div>

                  {/* Player Info Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-950/50 p-4 rounded-xl border border-gray-800/50">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Height</p>
                      <p className="text-lg font-semibold">{focusedPlayer.height ? convertHeightToMetric(focusedPlayer.height) : "N/A"}</p>
                    </div>
                    <div className="bg-gray-950/50 p-4 rounded-xl border border-gray-800/50">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Weight</p>
                      <p className="text-lg font-semibold">{focusedPlayer.weight ? `${Math.round(parseInt(focusedPlayer.weight) / 2.205)} kg` : "N/A"}</p>
                    </div>
                    <div className="bg-gray-950/50 p-4 rounded-xl border border-gray-800/50 col-span-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Country</p>
                      <p className="text-lg font-semibold">{focusedPlayer.country || "N/A"}</p>
                    </div>
                  </div>

                  {/* Draft Info */}
                  {focusedPlayer.draft_year && (
                    <div
                      className="mt-auto p-4 rounded-xl border"
                      style={{
                        backgroundColor: `${team.color}10`,
                        borderColor: `${team.color}20`,
                      }}
                    >
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: team.color }}>
                        Draft
                      </p>
                      <div className="text-lg font-bold text-white">
                        {focusedPlayer.draft_year} - Round {focusedPlayer.draft_round}, Pick{" "}
                        {focusedPlayer.draft_number}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Select an item to view details
                </div>
              )}
            </AnimatePresence>

            {/* Background glow */}
            <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-10"
              style={{ backgroundColor: team.color }}
            />
          </div>
        </div>
      )}

      {/* Controller hint */}
      <div className="flex justify-center mt-8 relative z-10">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1.5">
            <kbd
              className="px-2 py-1 bg-gray-900 border border-gray-800 rounded font-mono text-[10px]"
              style={{ color: team.color }}
            >
              ↑↓
            </kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 bg-gray-900 border border-gray-800 rounded text-gray-400 font-mono text-[10px]">
              L1/R1
            </kbd>
            Switch tabs
          </span>
        </div>
      </div>
    </div>
  );
}
