import React from 'react';
import { LeagueStandingRow } from '../types/client.ts';
import { AlertCircle } from 'lucide-react';

interface LeagueStandingsTableProps {
  standings: LeagueStandingRow[];
  leagueName: string;
}

export const LeagueStandingsTable: React.FC<LeagueStandingsTableProps> = ({
  standings,
  leagueName,
}) => {
  if (standings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-[#0B0F17] p-12 text-center">
        <AlertCircle className="h-10 w-10 text-zinc-600" />
        <h3 className="mt-3 text-lg font-bold text-white">Standings Data Unavailable</h3>
        <p className="mt-1 text-xs text-zinc-400 max-w-md">
          Official table standings for {leagueName} are currently processing or unavailable from the data feed.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#0B0F17]">
      <div className="border-b border-zinc-800/80 px-4 py-3 bg-zinc-950/60 flex items-center justify-between">
        <span className="font-heading text-sm font-bold text-white">{leagueName} Official Standings</span>
        <span className="text-[11px] text-zinc-400">All data verified live</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-zinc-800 bg-black/40 text-zinc-400 uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-3 py-2.5 text-center w-10">#</th>
              <th className="px-4 py-2.5">Club</th>
              <th className="px-3 py-2.5 text-center">PL</th>
              <th className="px-3 py-2.5 text-center">W</th>
              <th className="px-3 py-2.5 text-center">D</th>
              <th className="px-3 py-2.5 text-center">L</th>
              <th className="px-3 py-2.5 text-center">GF</th>
              <th className="px-3 py-2.5 text-center">GA</th>
              <th className="px-3 py-2.5 text-center">GD</th>
              <th className="px-4 py-2.5 text-center font-bold text-emerald-400">PTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-mono tabular-nums">
            {standings.map((row) => (
              <tr
                key={row.rank}
                className="transition-colors hover:bg-zinc-800/30"
              >
                <td className="px-3 py-3 text-center text-zinc-400 font-bold">
                  {row.rank <= 4 ? (
                    <span className="text-emerald-400 font-bold">{row.rank}</span>
                  ) : (
                    row.rank
                  )}
                </td>
                <td className="px-4 py-3 font-sans font-medium text-white">
                  <div className="flex items-center gap-2.5">
                    {row.teamLogo && (
                      <img
                        src={row.teamLogo}
                        alt={row.team}
                        referrerPolicy="no-referrer"
                        className="h-4 w-4 object-contain"
                      />
                    )}
                    <span className="truncate max-w-[160px] sm:max-w-none">{row.team}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-center text-zinc-400">{row.played}</td>
                <td className="px-3 py-3 text-center text-zinc-300">{row.wins}</td>
                <td className="px-3 py-3 text-center text-zinc-400">{row.draws}</td>
                <td className="px-3 py-3 text-center text-zinc-400">{row.losses}</td>
                <td className="px-3 py-3 text-center text-zinc-400">{row.goalsFor}</td>
                <td className="px-3 py-3 text-center text-zinc-400">{row.goalsAgainst}</td>
                <td className="px-3 py-3 text-center text-zinc-300">
                  {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                </td>
                <td className="px-4 py-3 text-center font-bold text-white bg-zinc-900/40">
                  {row.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
