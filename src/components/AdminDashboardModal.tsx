import React, { useState } from 'react';
import { OfficialPrediction } from '../types/client.ts';
import { X, Shield, Plus, CheckCircle, Trash2, Edit2, AlertCircle } from 'lucide-react';

interface AdminDashboardModalProps {
  isOpen: boolean;
  editingPrediction?: OfficialPrediction | null;
  onClose: () => void;
  onSavePrediction: (predData: Partial<OfficialPrediction>) => Promise<boolean>;
  onDeletePrediction: (id: string) => Promise<boolean>;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  editingPrediction,
  onClose,
  onSavePrediction,
  onDeletePrediction,
}) => {
  const [title, setTitle] = useState(editingPrediction?.title || '');
  const [match, setMatch] = useState(editingPrediction?.match || '');
  const [league, setLeague] = useState(editingPrediction?.league || 'English Premier League');
  const [kickoffTime, setKickoffTime] = useState(editingPrediction?.kickoffTime || new Date(Date.now() + 4 * 3600 * 1000).toISOString().slice(0, 16));
  const [pick, setPick] = useState(editingPrediction?.pick || '');
  const [odds, setOdds] = useState(editingPrediction?.odds?.toString() || '1.65');
  const [riskRating, setRiskRating] = useState<'Banker' | 'Safe' | 'Medium' | 'High'>(editingPrediction?.riskRating || 'Safe');
  const [confidencePercent, setConfidencePercent] = useState(editingPrediction?.confidencePercent?.toString() || '85');
  const [status, setStatus] = useState<OfficialPrediction['status']>(editingPrediction?.status || 'Open');
  const [tacticalAnalysis, setTacticalAnalysis] = useState(editingPrediction?.tacticalAnalysis || '');
  const [factorsInput, setFactorsInput] = useState(editingPrediction?.factors ? editingPrediction.factors.join('\n') : 'Rolling 10-match expected goals favors home side\nDefensive transition superiority\nUnbeaten in consecutive home fixtures');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const factors = factorsInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const data: Partial<OfficialPrediction> = {
      ...(editingPrediction ? { id: editingPrediction.id } : {}),
      title,
      match,
      league,
      kickoffTime: new Date(kickoffTime).toISOString(),
      pick,
      odds: parseFloat(odds) || 1.5,
      riskRating,
      confidencePercent: parseInt(confidencePercent, 10) || 85,
      status,
      tacticalAnalysis,
      factors,
    };

    const success = await onSavePrediction(data);
    setIsSubmitting(false);

    if (success) {
      onClose();
    } else {
      setErrorMsg('Failed to save official prediction.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#0B0F17] p-6 shadow-2xl text-white my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-black font-black">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-black text-white">
                {editingPrediction ? 'Edit Official Prediction' : 'Publish New Official Safe Pick'}
              </h3>
              <p className="text-xs text-zinc-400">
                Official Admin Desk · Appears instantly for all active members.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Headline Title</label>
              <input
                type="text"
                required
                placeholder="e.g. EPL Banker: Arsenal vs Chelsea"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Match Fixture</label>
              <input
                type="text"
                required
                placeholder="e.g. Arsenal vs Chelsea"
                value={match}
                onChange={(e) => setMatch(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">League</label>
              <input
                type="text"
                required
                value={league}
                onChange={(e) => setLeague(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Kick-off Date & Time</label>
              <input
                type="datetime-local"
                required
                value={kickoffTime}
                onChange={(e) => setKickoffTime(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Risk Rating</label>
              <select
                value={riskRating}
                onChange={(e: any) => setRiskRating(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
              >
                <option value="Banker">Banker (Prime Safe Pick)</option>
                <option value="Safe">Safe (High Probability)</option>
                <option value="Medium">Medium Value</option>
                <option value="High">High Odds Value</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Recommended Pick</label>
              <input
                type="text"
                required
                placeholder="e.g. Over 2.5 Goals / 1X & Over 1.5"
                value={pick}
                onChange={(e) => setPick(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Decimal Odds</label>
              <input
                type="number"
                step="0.01"
                required
                value={odds}
                onChange={(e) => setOdds(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-mono text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Confidence Score (%)</label>
              <input
                type="number"
                min="50"
                max="99"
                required
                value={confidencePercent}
                onChange={(e) => setConfidencePercent(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-mono text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          {editingPrediction && (
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Outcome Status</label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
              >
                <option value="Open">Open (Pending kick-off)</option>
                <option value="Won">Won (Official Green Result)</option>
                <option value="Lost">Lost</option>
                <option value="Void">Void / Postponed</option>
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Tactical Analysis & Reasoning</label>
            <textarea
              rows={3}
              required
              placeholder="Detailed tactical breakdown explaining why this selection possesses positive statistical expected value..."
              value={tacticalAnalysis}
              onChange={(e) => setTacticalAnalysis(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">Grounded Statistical Factors (One per line)</label>
            <textarea
              rows={3}
              placeholder="Enter bullet point factors (e.g. Unbeaten at home in 12 matches)"
              value={factorsInput}
              onChange={(e) => setFactorsInput(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none font-mono"
            />
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-zinc-800">
            {editingPrediction ? (
              <button
                type="button"
                onClick={async () => {
                  if (confirm('Delete this official prediction post?')) {
                    await onDeletePrediction(editingPrediction.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300"
              >
                <Trash2 className="h-4 w-4" />
                Remove Post
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-black text-black hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : editingPrediction ? 'Update Pick' : 'Publish to Arena'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
