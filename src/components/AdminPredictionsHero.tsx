import React, { useState } from 'react';
import { OfficialPrediction } from '../types/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ShieldCheck, Flame, Plus, Edit2, Trash2, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface AdminPredictionsHeroProps {
  predictions: OfficialPrediction[];
  onOpenCreateModal: () => void;
  onOpenEditModal: (pred: OfficialPrediction) => void;
  onDeletePrediction: (id: string) => void;
  onUpdateStatus: (id: string, status: OfficialPrediction['status']) => void;
  onSelectPredictionForAnalysis: (pred: OfficialPrediction) => void;
}

export const AdminPredictionsHero: React.FC<AdminPredictionsHeroProps> = ({
  predictions,
  onOpenCreateModal,
  onOpenEditModal,
  onDeletePrediction,
  onUpdateStatus,
  onSelectPredictionForAnalysis,
}) => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'open' | 'banker' | 'won'>('all');

  const filteredPredictions = predictions.filter((p) => {
    if (filter === 'open') return p.status === 'Open';
    if (filter === 'banker') return p.riskRating === 'Banker';
    if (filter === 'won') return p.status === 'Won';
    return true;
  });

  const featuredPick = predictions.find((p) => p.riskRating === 'Banker' && p.status === 'Open') || predictions[0];

  return (
    <section className="relative overflow-hidden border-b border-zinc-800 bg-[#080B11]">
      {/* Cinematic Stadium Backdrop with measured contrast scrim */}
      <div className="absolute inset-0 z-0 opacity-20">
        <img
          src="/src/assets/images/hero_arena_green_1791480830619.jpg"
          alt="Sports Arena Stadium"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080B11]/90 via-[#080B11]/95 to-[#080B11]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Top Header & Platform Mission */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-emerald-400 uppercase">
              <Flame className="h-4 w-4" />
              <span>Official Admin Desk & Game Analysis</span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-400 font-medium normal-case">Updated Live for All Members</span>
            </div>
            <h1 className="mt-1 font-heading text-3xl font-black tracking-tight text-white sm:text-4xl">
              SAFE PICKS <span className="text-emerald-400">ARENA</span>
            </h1>
            <p className="mt-1 text-sm text-zinc-300 max-w-2xl">
              Zero subscriptions, zero paywalls. Unbiased mathematical sports predictions, real-time football data, and verified bookmaker slips.
            </p>
          </div>

          {/* Admin Action Trigger & Free Badge */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <div>
                <p className="font-bold text-white">100% Free Arena</p>
                <p className="text-[11px] text-zinc-400">No VIP Tiers · Free for Everyone</p>
              </div>
            </div>

            {user?.role === 'admin' && (
              <button
                onClick={onOpenCreateModal}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-black transition-all hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
              >
                <Plus className="h-4 w-4" />
                Publish Official Pick
              </button>
            )}
          </div>
        </div>

        {/* FEATURED GAME SPOTLIGHT BANNER */}
        {featuredPick && (
          <div className="mt-6 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-zinc-950 via-[#10141D] to-zinc-950 p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="rounded bg-emerald-500 px-2 py-0.5 font-black text-black text-[10px] uppercase">
                  {featuredPick.riskRating} Pick of the Day
                </span>
                <span>·</span>
                <span className="font-semibold text-white">{featuredPick.league}</span>
                <span>·</span>
                <span className="font-mono tabular-nums text-zinc-400">
                  {new Date(featuredPick.kickoffTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Confidence:</span>
                <span className="font-mono text-sm font-bold text-emerald-400 tabular-nums">
                  {featuredPick.confidencePercent}%
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <h2 className="text-2xl font-black text-white sm:text-3xl">
                  {featuredPick.match}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <div className="rounded-lg bg-black/60 border border-zinc-800 px-3 py-1.5">
                    <span className="text-xs text-zinc-400">Recommended Pick: </span>
                    <span className="text-sm font-extrabold text-emerald-400">{featuredPick.pick}</span>
                  </div>
                  <div className="rounded-lg bg-black/60 border border-zinc-800 px-3 py-1.5">
                    <span className="text-xs text-zinc-400">Odds: </span>
                    <span className="font-mono text-sm font-bold text-white tabular-nums">@{featuredPick.odds.toFixed(2)}</span>
                  </div>
                  <div className="rounded-lg bg-black/60 border border-zinc-800 px-3 py-1.5">
                    <span className="text-xs text-zinc-400">Status: </span>
                    <span className={`text-xs font-bold uppercase ${
                      featuredPick.status === 'Won' ? 'text-emerald-400' :
                      featuredPick.status === 'Lost' ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {featuredPick.status}
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-zinc-300">
                  {featuredPick.tacticalAnalysis}
                </p>
              </div>

              {/* Statistical factors list */}
              <div className="lg:col-span-5 rounded-xl border border-zinc-800/80 bg-black/40 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Grounded Quantitative Factors
                </p>
                <ul className="mt-2 space-y-1.5">
                  {featuredPick.factors.slice(0, 3).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                      <span className="text-emerald-400 mt-0.5">▸</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex items-center justify-between pt-2 border-t border-zinc-800">
                  <button
                    onClick={() => onSelectPredictionForAnalysis(featuredPick)}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    View Deep Statistical Lab →
                  </button>
                  <span className="text-[10px] text-zinc-500">
                    By {featuredPick.authorName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prediction Filter Controls & List Header */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1 p-1 bg-zinc-900/90 rounded-lg border border-zinc-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filter === 'all' ? 'bg-emerald-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Predictions ({predictions.length})
            </button>
            <button
              onClick={() => setFilter('open')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filter === 'open' ? 'bg-emerald-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Active / Open
            </button>
            <button
              onClick={() => setFilter('banker')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filter === 'banker' ? 'bg-emerald-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Banker Tier
            </button>
            <button
              onClick={() => setFilter('won')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filter === 'won' ? 'bg-emerald-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Won History
            </button>
          </div>

          <p className="text-[11px] text-zinc-400 italic">
            * Predictions are statistical estimates and not guaranteed wins.
          </p>
        </div>

        {/* PREDICTIONS GRID */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPredictions.map((pred) => (
            <div
              key={pred.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-[#0B0F17] p-4 transition hover:border-zinc-700"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/80 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-zinc-200">{pred.league}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                      pred.riskRating === 'Banker' ? 'bg-emerald-500 text-black' :
                      pred.riskRating === 'Safe' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      'bg-zinc-800 text-zinc-300'
                    }`}>
                      {pred.riskRating}
                    </span>
                    <span className={`text-[11px] font-bold uppercase ${
                      pred.status === 'Won' ? 'text-emerald-400' :
                      pred.status === 'Lost' ? 'text-rose-400' :
                      pred.status === 'Void' ? 'text-zinc-400' : 'text-emerald-400'
                    }`}>
                      {pred.status}
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="text-base font-bold text-white hover:text-emerald-400 transition-colors">
                    {pred.match}
                  </h3>
                  <div className="mt-2 flex items-center justify-between rounded-lg bg-black/60 p-2 border border-zinc-900">
                    <div>
                      <p className="text-[10px] uppercase font-medium text-zinc-400">Pick</p>
                      <p className="text-xs font-extrabold text-emerald-400">{pred.pick}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-medium text-zinc-400">Odds</p>
                      <p className="font-mono text-sm font-bold text-white tabular-nums">
                        @{pred.odds.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mt-2 text-xs text-zinc-400 line-clamp-2">
                  {pred.tacticalAnalysis}
                </p>

                <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className="font-mono tabular-nums">
                      {new Date(pred.kickoffTime).toLocaleDateString([], { month: 'short', day: 'numeric' })} ·{' '}
                      {new Date(pred.kickoffTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </span>
                  <span className="font-mono text-zinc-300 font-semibold tabular-nums">
                    {pred.confidencePercent}% Conf.
                  </span>
                </div>
              </div>

              {/* Action buttons & Admin modifiers */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <button
                  onClick={() => onSelectPredictionForAnalysis(pred)}
                  className="text-xs font-semibold text-zinc-300 hover:text-emerald-400 transition-colors"
                >
                  Statistical Breakdown →
                </button>

                {user?.role === 'admin' && (
                  <div className="flex items-center gap-1.5">
                    {/* Fast outcome toggles */}
                    <button
                      onClick={() => onUpdateStatus(pred.id, 'Won')}
                      title="Mark Won"
                      className="p-1 text-zinc-500 hover:text-emerald-400 transition"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onUpdateStatus(pred.id, 'Lost')}
                      title="Mark Lost"
                      className="p-1 text-zinc-500 hover:text-rose-400 transition"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onOpenEditModal(pred)}
                      title="Edit Pick"
                      className="p-1 text-zinc-500 hover:text-emerald-400 transition"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePrediction(pred.id)}
                      title="Delete Pick"
                      className="p-1 text-zinc-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
