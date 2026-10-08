import React, { useState, useEffect } from 'react';
import { X, Server, Database, Shield, Cpu, Cloud, Activity, CheckCircle2 } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [healthData, setHealthData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/health')
        .then((r) => r.json())
        .then((d) => setHealthData(d))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-zinc-800 bg-[#0B0F17] p-6 sm:p-8 shadow-2xl text-white my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-black font-black">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-black text-white">
                Scalability & Reliability Architecture
              </h3>
              <p className="text-xs text-zinc-400">
                Engineered for 5,000,000+ Concurrent Registered Users & Decades of Reliability
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

        {/* Live Telemetry Bar */}
        {healthData && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 text-xs">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">System Status:</span>
              <span className="font-mono text-emerald-400 uppercase font-bold">{healthData.status}</span>
            </div>
            <div className="flex items-center gap-4 font-mono tabular-nums text-zinc-300 text-[11px]">
              <span>Uptime: {healthData.uptimeSeconds}s</span>
              <span>Memory Heap: {healthData.memoryUsageMB} MB</span>
              <span className="text-emerald-400 font-bold">Target: {healthData.capacityTarget}</span>
            </div>
          </div>
        )}

        {/* Core Architectural Pillars Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* 1. Global CDN & Edge Caching */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
              <Cloud className="h-4 w-4" />
              <span>Edge CDN & WAF Tier</span>
            </div>
            <p className="mt-2 text-xs text-zinc-300 leading-relaxed">
              Global Anycast edge servers cache live scoreboards for 45s. Shields origins from 98% of peak traffic spikes. Layer 7 DDoS mitigation and SSL termination.
            </p>
            <div className="mt-3 text-[11px] font-mono text-zinc-500">
              Tech: Cloudflare / Fastly Edge Workers
            </div>
          </div>

          {/* 2. Microservices & In-Memory Redis */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
              <Cpu className="h-4 w-4" />
              <span>Distributed In-Memory Cache</span>
            </div>
            <p className="mt-2 text-xs text-zinc-300 leading-relaxed">
              Sub-millisecond session validation, token bucket rate limiters, and pub/sub channels. Handles over 150,000 requests/sec with Redis Cluster Sentinel.
            </p>
            <div className="mt-3 text-[11px] font-mono text-zinc-500">
              Tech: Redis Cluster + Sentinel replicas
            </div>
          </div>

          {/* 3. Scalable Sharded Database */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
              <Database className="h-4 w-4" />
              <span>Multi-Region Sharded DB</span>
            </div>
            <p className="mt-2 text-xs text-zinc-300 leading-relaxed">
              PostgreSQL / CockroachDB horizontally sharded by user hash keys. Compound B-tree indexes on email, match status, and timestamps prevent table locks.
            </p>
            <div className="mt-3 text-[11px] font-mono text-zinc-500">
              Tech: CockroachDB / PostgreSQL + PgBouncer
            </div>
          </div>

          {/* 4. Real-Time Streaming */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
              <Activity className="h-4 w-4" />
              <span>Asynchronous Event Streaming</span>
            </div>
            <p className="mt-2 text-xs text-zinc-300 leading-relaxed">
              Server-Sent Events (SSE) and persistent WebSockets multiplexed across clustered worker nodes. Zero socket exhaustion during worldwide game finals.
            </p>
            <div className="mt-3 text-[11px] font-mono text-zinc-500">
              Tech: Node.js Cluster + SSE Connection Pool
            </div>
          </div>

          {/* 5. Zero-Trust Security & Rate Limiting */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
              <Shield className="h-4 w-4" />
              <span>Security Controls & Hashing</span>
            </div>
            <p className="mt-2 text-xs text-zinc-300 leading-relaxed">
              Bcrypt 10-round salted password hashing, timing-safe crypto tokens, strict CORS, CSP, no-sniff headers, sliding-window token bucket per IP.
            </p>
            <div className="mt-3 text-[11px] font-mono text-zinc-500">
              Tech: Bcrypt + Sliding-Window Rate Limiter
            </div>
          </div>

          {/* 6. Disaster Recovery & Zero Downtime */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
              <CheckCircle2 className="h-4 w-4" />
              <span>Decade Disaster Recovery</span>
            </div>
            <p className="mt-2 text-xs text-zinc-300 leading-relaxed">
              RPO &lt; 15s via automated WAL continuous archiving. Multi-region hot standby replica with failover RTO &lt; 3 mins. Blue/Green zero-downtime rolling deploys.
            </p>
            <div className="mt-3 text-[11px] font-mono text-zinc-500">
              Tech: Continuous WAL Archive + Blue/Green CI/CD
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end pt-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="rounded-xl bg-zinc-800 px-5 py-2 text-xs font-bold text-white hover:bg-zinc-700 transition"
          >
            Close Architecture
          </button>
        </div>

      </div>
    </div>
  );
};
