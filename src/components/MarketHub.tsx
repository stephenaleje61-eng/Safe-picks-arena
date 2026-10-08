import React, { useState, useEffect } from 'react';
import { MarketSlip } from '../types/client.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ShoppingBag, Share2, Copy, Check, Calculator, Sparkles, ExternalLink, Plus } from 'lucide-react';

export const MarketHub: React.FC = () => {
  const { user } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<'All' | 'Bet9ja' | 'SportyBet' | 'MSport' | 'Football.com'>('All');
  const [slips, setSlips] = useState<MarketSlip[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New slip form state
  const [showShareModal, setShowShareModal] = useState(false);
  const [formPlatform, setFormPlatform] = useState<'Bet9ja' | 'SportyBet' | 'MSport' | 'Football.com'>('Bet9ja');
  const [formCode, setFormCode] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formOdds, setFormOdds] = useState('2.85');
  const [formNotes, setFormNotes] = useState('');

  // Accumulator calculator state
  const [calcStake, setCalcStake] = useState<number>(1000);
  const [calcOdds, setCalcOdds] = useState<number>(3.5);
  const [calcLegs, setCalcLegs] = useState<number>(4);

  const fetchSlips = async () => {
    try {
      const q = selectedPlatform !== 'All' ? `?platform=${selectedPlatform}` : '';
      const res = await fetch(`/api/market/slips${q}`);
      const data = await res.json();
      setSlips(data.slips || []);
    } catch {
      // offline
    }
  };

  useEffect(() => {
    fetchSlips();
  }, [selectedPlatform]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleShareSlip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to share a booking slip.');
      return;
    }

    try {
      const res = await fetch('/api/market/slips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('safepicks_token')}`,
        },
        body: JSON.stringify({
          platform: formPlatform,
          bookingCode: formCode,
          title: formTitle,
          totalOdds: parseFloat(formOdds) || 2.5,
          notes: formNotes,
        }),
      });

      if (res.ok) {
        setShowShareModal(false);
        setFormCode('');
        setFormTitle('');
        setFormNotes('');
        fetchSlips();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to submit slip');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    }
  };

  // Compute platform accumulator bonus
  const getAccumulatorBonusPercent = (platform: string, legs: number): number => {
    if (platform === 'Bet9ja') {
      if (legs >= 30) return 170;
      if (legs >= 25) return 135;
      if (legs >= 20) return 100;
      if (legs >= 15) return 60;
      if (legs >= 10) return 30;
      if (legs >= 5) return 5;
      return 0;
    } else if (platform === 'SportyBet') {
      if (legs >= 50) return 1000;
      if (legs >= 35) return 350;
      if (legs >= 20) return 120;
      if (legs >= 12) return 45;
      if (legs >= 6) return 15;
      if (legs >= 3) return 3;
      return 0;
    } else if (platform === 'MSport') {
      if (legs >= 30) return 180;
      if (legs >= 25) return 110;
      if (legs >= 15) return 55;
      if (legs >= 8) return 25;
      if (legs >= 4) return 5;
      return 0;
    } else {
      // Football.com
      if (legs >= 28) return 150;
      if (legs >= 21) return 100;
      if (legs >= 14) return 50;
      if (legs >= 7) return 20;
      if (legs >= 3) return 5;
      return 0;
    }
  };

  const currentBonusPercent = getAccumulatorBonusPercent(selectedPlatform === 'All' ? 'Bet9ja' : selectedPlatform, calcLegs);
  const potentialReturn = calcStake * calcOdds;
  const bonusAmount = (potentialReturn * currentBonusPercent) / 100;
  const totalPayout = potentialReturn + bonusAmount;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <ShoppingBag className="h-4 w-4" />
            <span>Dedicated Bookmaker Spaces</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-400 font-medium normal-case">Code Loaders & Multi-Odds Matrix</span>
          </div>
          <h2 className="mt-1 font-heading text-2xl font-black text-white sm:text-3xl">
            Bookmaker Market & Booking Codes
          </h2>
          <p className="mt-1 text-xs text-zinc-300">
            Real community booking slips, live accumulator bonus multipliers, and platform spaces for Bet9ja, SportyBet, MSport, and Football.com.
          </p>
        </div>

        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-black transition-all hover:bg-emerald-400 shadow-md shadow-emerald-500/10 self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          Share Booking Code
        </button>
      </div>

      {/* DEDICATED PLATFORM CARDS */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Bet9ja */}
        <div
          onClick={() => setSelectedPlatform('Bet9ja')}
          className={`cursor-pointer rounded-xl border p-4 transition ${
            selectedPlatform === 'Bet9ja'
              ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500'
              : 'border-zinc-800 bg-[#0B0F17] hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-heading text-lg font-black text-emerald-400">Bet9ja Space</span>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
              170% Boost
            </span>
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            Official Nigerian flagship bookmaker. Renowned for Cut 1 feature, live cash out, and massive multiple accumulators.
          </p>
          <div className="mt-3 text-[11px] font-mono text-zinc-500">
            Code Format: B9J-XXXXX
          </div>
        </div>

        {/* SportyBet */}
        <div
          onClick={() => setSelectedPlatform('SportyBet')}
          className={`cursor-pointer rounded-xl border p-4 transition ${
            selectedPlatform === 'SportyBet'
              ? 'border-emerald-500 bg-rose-950/20 ring-1 ring-emerald-500'
              : 'border-zinc-800 bg-[#0B0F17] hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-heading text-lg font-black text-rose-400">SportyBet Space</span>
            <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
              1000% Super
            </span>
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            Pan-African high-speed platform with Flexi-Bet partial cashouts, instant virtual bet settlements, and live match tracker.
          </p>
          <div className="mt-3 text-[11px] font-mono text-zinc-500">
            Code Format: SPT-XXXXXX
          </div>
        </div>

        {/* MSport */}
        <div
          onClick={() => setSelectedPlatform('MSport')}
          className={`cursor-pointer rounded-xl border p-4 transition ${
            selectedPlatform === 'MSport'
              ? 'border-emerald-500 bg-amber-950/20 ring-1 ring-emerald-500'
              : 'border-zinc-800 bg-[#0B0F17] hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-heading text-lg font-black text-amber-400">MSport Space</span>
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
              Cashback Hub
            </span>
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            Aggressive deposit vouchers, weekly draws, zero-fee withdrawals, and boosted accumulator payout matrices.
          </p>
          <div className="mt-3 text-[11px] font-mono text-zinc-500">
            Code Format: MSP-XXXXX
          </div>
        </div>

        {/* Football.com */}
        <div
          onClick={() => setSelectedPlatform('Football.com')}
          className={`cursor-pointer rounded-xl border p-4 transition ${
            selectedPlatform === 'Football.com'
              ? 'border-emerald-500 bg-blue-950/20 ring-1 ring-emerald-500'
              : 'border-zinc-800 bg-[#0B0F17] hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-heading text-lg font-black text-blue-400">Football.com Space</span>
            <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300">
              Super Odds
            </span>
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            Global soccer domain with zero-margin super odds, weekly predictor pool challenges, and lightning-fast bet confirmation.
          </p>
          <div className="mt-3 text-[11px] font-mono text-zinc-500">
            Code Format: FBC-XXXXX
          </div>
        </div>

      </div>

      {/* INTERACTIVE ACCUMULATOR & BONUS CALCULATOR */}
      <div className="mt-8 rounded-2xl border border-zinc-800 bg-[#0B0F17] p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-emerald-400" />
            <h3 className="font-heading text-lg font-bold text-white">
              Accumulator Boost & Payout Simulator ({selectedPlatform === 'All' ? 'Bet9ja' : selectedPlatform})
            </h3>
          </div>
          <span className="text-xs text-zinc-400 font-medium">Real-time bonus formula</span>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">Stake Currency Units</label>
            <input
              type="number"
              value={calcStake}
              onChange={(e) => setCalcStake(Math.max(1, Number(e.target.value)))}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-mono text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">Total Accumulator Odds</label>
            <input
              type="number"
              step="0.05"
              value={calcOdds}
              onChange={(e) => setCalcOdds(Math.max(1.01, Number(e.target.value)))}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-mono text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">Number of Legs (Matches)</label>
            <input
              type="number"
              value={calcLegs}
              onChange={(e) => setCalcLegs(Math.max(1, Math.min(50, Number(e.target.value))))}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-mono text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-zinc-950 p-4 font-mono tabular-nums">
            <p className="text-[11px] text-zinc-400 uppercase font-sans">Simulated Payout</p>
            <p className="text-xl font-black text-emerald-400 mt-1">
              {totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-zinc-500 font-sans mt-0.5">
              Includes {currentBonusPercent}% Multiple Boost ({bonusAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })})
            </p>
          </div>
        </div>
      </div>

      {/* FILTER BUTTONS & SLIPS LIST */}
      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-lg border border-zinc-800 overflow-x-auto">
          {(['All', 'Bet9ja', 'SportyBet', 'MSport', 'Football.com'] as const).map((plat) => (
            <button
              key={plat}
              onClick={() => setSelectedPlatform(plat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                selectedPlatform === plat
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {plat} ({plat === 'All' ? slips.length : slips.filter(s => s.platform === plat).length})
            </button>
          ))}
        </div>
      </div>

      {/* SLIPS GRID */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slips.length === 0 ? (
          <div className="col-span-full rounded-xl border border-zinc-800 bg-[#0B0F17] p-8 text-center text-zinc-400 text-xs">
            No booking codes shared yet for this platform. Click "Share Booking Code" to submit the first slip!
          </div>
        ) : (
          slips.map((slip) => (
            <div
              key={slip.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-[#0B0F17] p-4 transition hover:border-zinc-700"
            >
              <div>
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 text-xs">
                  <span className={`font-bold ${
                    slip.platform === 'Bet9ja' ? 'text-emerald-400' :
                    slip.platform === 'SportyBet' ? 'text-rose-400' :
                    slip.platform === 'MSport' ? 'text-amber-400' : 'text-blue-400'
                  }`}>
                    {slip.platform}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono tabular-nums">
                    {new Date(slip.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="text-sm font-bold text-white">{slip.title}</h3>
                  <div className="mt-2 flex items-center justify-between rounded-lg bg-zinc-900/90 p-2.5 border border-zinc-800 font-mono tabular-nums">
                    <div>
                      <p className="text-[10px] font-sans uppercase text-zinc-500">Booking Code</p>
                      <p className="text-sm font-black text-emerald-400 tracking-wider">
                        {slip.bookingCode}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-sans uppercase text-zinc-500">Total Odds</p>
                      <p className="text-sm font-bold text-white">@{slip.totalOdds.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {slip.legs && slip.legs.length > 0 && (
                  <div className="mt-3 space-y-1 text-xs">
                    <p className="text-[10px] font-bold uppercase text-zinc-500">Selected Legs ({slip.legs.length}):</p>
                    {slip.legs.slice(0, 3).map((leg, i) => (
                      <div key={i} className="flex justify-between text-zinc-300 text-[11px] truncate">
                        <span className="truncate max-w-[170px]">{leg.match}</span>
                        <span className="font-mono text-emerald-400">@{leg.odds}</span>
                      </div>
                    ))}
                  </div>
                )}

                {slip.notes && (
                  <p className="mt-2 text-[11px] text-zinc-400 italic">
                    "{slip.notes}"
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">By {slip.username}</span>
                <button
                  onClick={() => handleCopy(slip.bookingCode)}
                  className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 hover:text-black transition"
                >
                  {copiedCode === slip.bookingCode ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SHARE SLIP MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0B0F17] p-6 shadow-2xl">
            <h3 className="font-heading text-lg font-bold text-white">
              Share Booking Code to Arena
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
              Contribute a verified slip for Bet9ja, SportyBet, MSport, or Football.com.
            </p>

            <form onSubmit={handleShareSlip} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Target Bookmaker</label>
                <select
                  value={formPlatform}
                  onChange={(e: any) => setFormPlatform(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Bet9ja">Bet9ja</option>
                  <option value="SportyBet">SportyBet</option>
                  <option value="MSport">MSport</option>
                  <option value="Football.com">Football.com</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Booking Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B9J-99214 or SPT-88219X"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Slip Title / Descriptor</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekend European Safe 3-Fold"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Total Odds</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 3.45"
                  value={formOdds}
                  onChange={(e) => setFormOdds(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Analysis / Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. High probability accumulator with home defensive backups."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="rounded-lg px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-400 transition"
                >
                  Publish Booking Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
};
