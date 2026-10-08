import React from 'react';
import { MatchPredictionAnalysis, LiveMatch } from '../types/client.ts';
import { X, AlertCircle, ShieldAlert, TrendingUp } from 'lucide-react';

interface PredictionAnalysisModalProps {
  analysis: MatchPredictionAnalysis | null;
  match?: LiveMatch | null;
  onClose: () => void;
}

export const PredictionAnalysisModal: React.FC<PredictionAnalysisModalProps> = ({
  analysis,
  match,
  onClose,
}) => {
  if (!analysis) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-zinc-800 bg-[#0B0F17] shadow-2xl p-6 my-8 text-white">
        
        {/* Modal Top Header */}
        <div className="flex items-start justify-between border-b border-zinc-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <TrendingUp className="h-4 w-4" />
              <span>Quantitative Sports Modeling Lab</span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-400 font-medium normal-case">{analysis.league}</span>
            </div>
            <h2 className="mt-1 font-heading text-2xl font-black text-white">
              {analysis.homeTeam} vs {analysis.awayTeam}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* PRIMARY PROBABILITY SPECTRUM */}
        <div className="mt-6 rounded-xl border border-emerald-500/30 bg-zinc-950/80 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Estimated Win / Draw / Loss Probabilities
            </span>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
              Score Prediction: {analysis.predictedScore}
            </span>
          </div>

          {/* Probability Bars */}
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-zinc-900/90 p-3 border border-zinc-800">
              <p className="text-[11px] text-zinc-400 uppercase truncate font-medium">Home Win ({analysis.homeTeam})</p>
              <p className="font-mono text-2xl font-black text-white tabular-nums mt-1">
                {analysis.homeWinProb}%
              </p>
            </div>
            <div className="rounded-lg bg-zinc-900/90 p-3 border border-zinc-800">
              <p className="text-[11px] text-zinc-400 uppercase font-medium">Draw (X)</p>
              <p className="font-mono text-2xl font-black text-white tabular-nums mt-1">
                {analysis.drawProb}%
              </p>
            </div>
            <div className="rounded-lg bg-zinc-900/90 p-3 border border-zinc-800">
              <p className="text-[11px] text-zinc-400 uppercase truncate font-medium">Away Win ({analysis.awayTeam})</p>
              <p className="font-mono text-2xl font-black text-white tabular-nums mt-1">
                {analysis.awayWinProb}%
              </p>
            </div>
          </div>

          {/* Visual Percentage Bar */}
          <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-zinc-900">
            <div className="bg-emerald-500" style={{ width: `${analysis.homeWinProb}%` }} />
            <div className="bg-zinc-500" style={{ width: `${analysis.drawProb}%` }} />
            <div className="bg-blue-500" style={{ width: `${analysis.awayWinProb}%` }} />
          </div>

          {/* Recommended Safe Selection */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-black/60 p-3 border border-zinc-900">
            <div>
              <p className="text-[11px] text-zinc-400">Algorithmic Safe Pick</p>
              <p className="text-sm font-black text-emerald-400">{analysis.recommendedPick}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-zinc-400">Confidence Rating</p>
              <p className="font-mono text-sm font-bold text-white tabular-nums">{analysis.confidenceScore}%</p>
            </div>
          </div>
        </div>

        {/* RECENT PERFORMANCE & GOAL METRICS */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Home Stats */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {analysis.homeTeam} (Home Form)
            </h4>
            
            <div className="mt-3 flex items-center gap-1.5">
              <span className="text-xs text-zinc-400">Recent 5 Form:</span>
              <div className="flex gap-1">
                {analysis.homeRecentForm.map((res, i) => (
                  <span
                    key={i}
                    className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${
                      res === 'W' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      res === 'D' ? 'bg-zinc-800 text-zinc-300' : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {res}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-3 space-y-2 border-t border-zinc-800/80 pt-3 text-xs font-mono tabular-nums">
              <div className="flex justify-between text-zinc-300">
                <span className="font-sans text-zinc-400">Avg Goals Scored / 90m:</span>
                <span className="font-bold text-white">{analysis.avgGoalsScoredHome}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="font-sans text-zinc-400">Avg Goals Conceded / 90m:</span>
                <span className="font-bold text-white">{analysis.avgGoalsConcededHome}</span>
              </div>
            </div>
          </div>

          {/* Away Stats */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {analysis.awayTeam} (Away Form)
            </h4>

            <div className="mt-3 flex items-center gap-1.5">
              <span className="text-xs text-zinc-400">Recent 5 Form:</span>
              <div className="flex gap-1">
                {analysis.awayRecentForm.map((res, i) => (
                  <span
                    key={i}
                    className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${
                      res === 'W' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      res === 'D' ? 'bg-zinc-800 text-zinc-300' : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {res}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-3 space-y-2 border-t border-zinc-800/80 pt-3 text-xs font-mono tabular-nums">
              <div className="flex justify-between text-zinc-300">
                <span className="font-sans text-zinc-400">Avg Goals Scored / 90m:</span>
                <span className="font-bold text-white">{analysis.avgGoalsScoredAway}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="font-sans text-zinc-400">Avg Goals Conceded / 90m:</span>
                <span className="font-bold text-white">{analysis.avgGoalsConcededAway}</span>
              </div>
            </div>
          </div>

        </div>

        {/* HEAD TO HEAD & KEY FACTORS */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* H2H */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Head-to-Head History
            </h4>
            <div className="mt-3 divide-y divide-zinc-800/60 text-xs">
              {analysis.headToHeadHistory.map((h, i) => (
                <div key={i} className="py-2 flex items-center justify-between">
                  <span className="text-zinc-400">{h.date}</span>
                  <span className="text-zinc-300 font-medium">{h.result}</span>
                  <span className="font-mono font-bold text-emerald-400 tabular-nums">{h.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Factors Influencing Prediction */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Key Factors Influencing Prediction
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-zinc-300">
              {analysis.keyFactors.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* MANDATORY DISCLAIMER */}
        <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-300">
              Official Statistical Disclaimer
            </p>
            <p className="mt-0.5 text-xs text-zinc-300 leading-relaxed">
              {analysis.disclaimer} Safe Picks Arena does not operate gambling or guarantee winnings. All data is provided purely for quantitative research and informational purposes.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-zinc-800 px-5 py-2 text-xs font-bold text-white hover:bg-zinc-700 transition"
          >
            Close Lab
          </button>
        </div>

      </div>
    </div>
  );
};
