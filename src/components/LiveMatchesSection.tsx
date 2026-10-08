import React, { useState, useEffect } from 'react';
import { LiveMatch, LeagueStandingRow } from '../types/client.ts';
import { RefreshCw, Radio, Trophy, Calendar, AlertTriangle } from 'lucide-react';
import { LeagueStandingsTable } from './LeagueStandingsTable.tsx';

interface LiveMatchesSectionProps {
  onSelectMatchForAnalysis: (match: LiveMatch) => void;
}

const LEAGUES = [
  { id: 'eng.1', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'esp.1', name: 'La Liga', flag: '🇪🇸' },
  { id: 'ita.1', name: 'Serie A', flag: '🇮🇹' },
  { id: 'ger.1', name: 'Bundesliga', flag: '🇩🇪' },
  { id: 'fra.1', name: 'Ligue 1', flag: '🇫🇷' },
  { id: 'uefa.champions', name: 'Champions League', flag: '🇪🇺' },
  { id: 'uefa.europa', name: 'Europa League', flag: '🇪🇺' },
];

export const LiveMatchesSection: React.FC<LiveMatchesSectionProps> = ({
  onSelectMatchForAnalysis,
}) => {
  const [selectedLeague, setSelectedLeague] = useState('eng.1');
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [standings, setStandings] = useState<LeagueStandingRow[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'matches' | 'table'>('matches');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchMatches = async (leagueId: string) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await fetch(`/api/football/matches?league=${leagueId}`);
      const data = await res.json();
      if (data.error) {
        setApiError(data.error);
        setMatches([]);
      } else {
        setMatches(data.matches || []);
      }
    } catch {
      setApiError('Data unavailable');
      setMatches([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStandings = async (leagueId: string) => {
    try {
      const res = await fetch(`/api/football/standings?league=${leagueId}`);
      const data = await res.json();
      if (!data.error) {
        setStandings(data.standings || []);
      } else {
        setStandings([]);
      }
    } catch {
      setStandings([]);
    }
  };

  useEffect(() => {
    fetchMatches(selectedLeague);
    fetchStandings(selectedLeague);
    // Poll updates every 45s for real-time live match scores
    const interval = setInterval(() => {
      fetchMatches(selectedLeague);
    }, 45000);
    return () => clearInterval(interval);
  }, [selectedLeague]);

  const liveCount = matches.filter(m => m.status === 'STATUS_IN_PROGRESS').length;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header & League Selector */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Radio className="h-4 w-4 animate-pulse text-rose-500" />
            <span>Official Sports Feed</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-400 font-medium normal-case">Direct from Verified Global Providers</span>
          </div>
          <h2 className="mt-1 font-heading text-2xl font-black text-white sm:text-3xl">
            Live Matches & Real-Time Scores
          </h2>
        </div>

        {/* View toggle (Matches vs League Table) + Manual refresh */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-zinc-900 rounded-lg border border-zinc-800">
            <button
              onClick={() => setActiveSubTab('matches')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeSubTab === 'matches' ? 'bg-emerald-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Fixtures & Results ({matches.length})
            </button>
            <button
              onClick={() => setActiveSubTab('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeSubTab === 'table' ? 'bg-emerald-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              League Table
            </button>
          </div>

          <button
            onClick={() => fetchMatches(selectedLeague)}
            disabled={isLoading}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white transition disabled:opacity-50"
            title="Refresh Live Data"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* League Filter Tabs */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {LEAGUES.map((l) => (
          <button
            key={l.id}
            onClick={() => setSelectedLeague(l.id)}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold whitespace-nowrap rounded-lg border transition ${
              selectedLeague === l.id
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                : 'border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <span>{l.flag}</span>
            <span>{l.name}</span>
          </button>
        ))}
      </div>

      {/* Live matches counter indicator */}
      {liveCount > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs text-rose-300">
          <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
          <span className="font-bold">{liveCount} live match{liveCount > 1 ? 'es' : ''} currently underway with real-time score updates!</span>
        </div>
      )}

      {/* CONTENT AREA: Matches vs Table */}
      {activeSubTab === 'matches' ? (
        <div className="mt-6">
          {isLoading && matches.length === 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-44 rounded-xl border border-zinc-800/60 bg-zinc-900/40 animate-pulse p-4" />
              ))}
            </div>
          ) : apiError ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-[#0B0F17] p-12 text-center">
              <AlertTriangle className="h-10 w-10 text-amber-400" />
              <h3 className="mt-3 text-lg font-bold text-white">Data unavailable</h3>
              <p className="mt-1 text-xs text-zinc-400 max-w-md">
                Sports data currently unavailable from official upstream feeds for this league. We never invent fake match records.
              </p>
              <button
                onClick={() => fetchMatches(selectedLeague)}
                className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-400 transition"
              >
                Retry Feed
              </button>
            </div>
          ) : matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-[#0B0F17] p-12 text-center">
              <Calendar className="h-10 w-10 text-zinc-600" />
              <h3 className="mt-3 text-lg font-bold text-white">No Fixtures Scheduled Today</h3>
              <p className="mt-1 text-xs text-zinc-400 max-w-md">
                There are no matches scheduled right now for this league. Switch leagues above to explore active competitions.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {matches.map((m) => {
                const isLive = m.status === 'STATUS_IN_PROGRESS';
                const isFinal = m.status === 'STATUS_FINAL';
                const hasScore = m.homeTeam.score !== undefined && m.awayTeam.score !== undefined;

                return (
                  <div
                    key={m.id}
                    className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-[#0B0F17] p-4 transition hover:border-zinc-700"
                  >
                    <div>
                      {/* Match Status & League Header */}
                      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 text-xs">
                        <span className="font-semibold text-zinc-400 truncate max-w-[140px]">
                          {m.league}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {isLive ? (
                            <span className="flex items-center gap-1 rounded bg-rose-500/20 px-2 py-0.5 font-bold text-rose-400 text-[10px]">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                              LIVE {m.minute || "45'"}
                            </span>
                          ) : isFinal ? (
                            <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                              FT / Finished
                            </span>
                          ) : (
                            <span className="font-mono text-[11px] text-zinc-400 tabular-nums">
                              {new Date(m.date).toLocaleDateString([], { month: 'short', day: 'numeric' })} ·{' '}
                              {new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Teams & Scores */}
                      <div className="mt-4 space-y-3">
                        {/* Home Team */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {m.homeTeam.logo ? (
                              <img
                                src={m.homeTeam.logo}
                                alt={m.homeTeam.name}
                                referrerPolicy="no-referrer"
                                className="h-6 w-6 object-contain shrink-0"
                              />
                            ) : (
                              <div className="flex h-6 w-6 items-center justify-center rounded bg-zinc-800 text-[10px] font-bold text-zinc-300 shrink-0">
                                {m.homeTeam.shortName.slice(0, 3)}
                              </div>
                            )}
                            <span className="truncate text-sm font-bold text-white">
                              {m.homeTeam.name}
                            </span>
                          </div>
                          {hasScore ? (
                            <span className="font-mono text-lg font-black text-white tabular-nums">
                              {m.homeTeam.score}
                            </span>
                          ) : (
                            <span className="font-mono text-xs text-zinc-600">-</span>
                          )}
                        </div>

                        {/* Away Team */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {m.awayTeam.logo ? (
                              <img
                                src={m.awayTeam.logo}
                                alt={m.awayTeam.name}
                                referrerPolicy="no-referrer"
                                className="h-6 w-6 object-contain shrink-0"
                              />
                            ) : (
                              <div className="flex h-6 w-6 items-center justify-center rounded bg-zinc-800 text-[10px] font-bold text-zinc-300 shrink-0">
                                {m.awayTeam.shortName.slice(0, 3)}
                              </div>
                            )}
                            <span className="truncate text-sm font-bold text-white">
                              {m.awayTeam.name}
                            </span>
                          </div>
                          {hasScore ? (
                            <span className="font-mono text-lg font-black text-white tabular-nums">
                              {m.awayTeam.score}
                            </span>
                          ) : (
                            <span className="font-mono text-xs text-zinc-600">-</span>
                          )}
                        </div>
                      </div>

                      {/* Live Stats Bar if in-progress */}
                      {m.stats?.possession && (
                        <div className="mt-3 pt-3 border-t border-zinc-800/80">
                          <div className="flex items-center justify-between text-[11px] text-zinc-400">
                            <span>Possession</span>
                            <span className="font-mono tabular-nums">
                              {m.stats.possession.home}% - {m.stats.possession.away}%
                            </span>
                          </div>
                          <div className="mt-1 flex h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                            <div
                              className="bg-emerald-500"
                              style={{ width: `${m.stats.possession.home}%` }}
                            />
                            <div
                              className="bg-zinc-600"
                              style={{ width: `${m.stats.possession.away}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Statistical Model Quick Peek */}
                      {m.predictionAnalysis && (
                        <div className="mt-3 rounded-lg bg-black/60 p-2.5 border border-zinc-900">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-zinc-400">Estimated Pick:</span>
                            <span className="font-bold text-emerald-400">
                              {m.predictionAnalysis.recommendedPick}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-500 font-mono tabular-nums">
                            <span>H: {m.predictionAnalysis.homeWinProb}%</span>
                            <span>D: {m.predictionAnalysis.drawProb}%</span>
                            <span>A: {m.predictionAnalysis.awayWinProb}%</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom CTA to Prediction Lab */}
                    <div className="mt-4 pt-3 border-t border-zinc-800/80">
                      <button
                        onClick={() => onSelectMatchForAnalysis(m)}
                        className="w-full rounded-lg bg-zinc-800/80 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-emerald-500 hover:text-black"
                      >
                        Deep Prediction Analysis & Stats →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6">
          <LeagueStandingsTable standings={standings} leagueName={LEAGUES.find(l => l.id === selectedLeague)?.name || 'League'} />
        </div>
      )}
    </section>
  );
};
