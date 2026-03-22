import { useMemo, useState } from "react";
import {
  difference,
  intersection,
  intersection3,
  onlyA,
  onlyB,
  onlyC,
  parseElements,
  union,
  union3,
} from "./vennUtils.js";
import { api } from "../../lib/api.js";

function TwoSetVenn({ aLabel, bLabel, onlyASet, inter, onlyBSet }) {
  return (
    <svg viewBox="0 0 240 160" className="h-auto w-full max-w-md text-slate-200">
      <defs>
        <linearGradient id="g2a" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="g2b" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <circle cx="92" cy="88" r="58" fill="url(#g2a)" stroke="#22d3ee" strokeWidth="2" />
      <circle cx="148" cy="88" r="58" fill="url(#g2b)" stroke="#a78bfa" strokeWidth="2" />
      <text x="52" y="32" fill="#e2e8f0" fontSize="12" fontWeight="600">
        {aLabel}
      </text>
      <text x="168" y="32" fill="#e2e8f0" fontSize="12" fontWeight="600">
        {bLabel}
      </text>
      <text x="48" y="92" fill="#94a3b8" fontSize="10">
        {onlyASet.length ? onlyASet.join(", ") : "∅"}
      </text>
      <text x="108" y="92" fill="#f8fafc" fontSize="10" textAnchor="middle">
        {inter.length ? inter.join(", ") : "∅"}
      </text>
      <text x="168" y="92" fill="#94a3b8" fontSize="10" textAnchor="end">
        {onlyBSet.length ? onlyBSet.join(", ") : "∅"}
      </text>
    </svg>
  );
}

function ThreeSetVenn({
  aLabel,
  bLabel,
  cLabel,
  regions,
}) {
  return (
    <svg viewBox="0 0 280 220" className="h-auto w-full max-w-lg text-slate-200">
      <defs>
        <linearGradient id="g3a" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="g3b" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="g3c" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#f472b6" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#f472b6" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <circle cx="118" cy="98" r="56" fill="url(#g3a)" stroke="#22d3ee" strokeWidth="2" />
      <circle cx="162" cy="98" r="56" fill="url(#g3b)" stroke="#a78bfa" strokeWidth="2" />
      <circle cx="140" cy="132" r="56" fill="url(#g3c)" stroke="#f472b6" strokeWidth="2" />
      <text x="70" y="36" fill="#e2e8f0" fontSize="11" fontWeight="600">
        {aLabel}
      </text>
      <text x="190" y="36" fill="#e2e8f0" fontSize="11" fontWeight="600">
        {bLabel}
      </text>
      <text x="124" y="206" fill="#e2e8f0" fontSize="11" fontWeight="600">
        {cLabel}
      </text>
      <text x="96" y="78" fill="#94a3b8" fontSize="9">
        {regions.abOnly.length ? regions.abOnly.join(",") : ""}
      </text>
      <text x="132" y="104" fill="#f8fafc" fontSize="9" textAnchor="middle">
        {regions.abc.length ? regions.abc.join(",") : ""}
      </text>
      <text x="72" y="112" fill="#94a3b8" fontSize="9">
        {regions.aOnly.length ? regions.aOnly.join(",") : ""}
      </text>
      <text x="176" y="112" fill="#94a3b8" fontSize="9" textAnchor="end">
        {regions.bOnly.length ? regions.bOnly.join(",") : ""}
      </text>
      <text x="108" y="150" fill="#94a3b8" fontSize="9">
        {regions.acOnly.length ? regions.acOnly.join(",") : ""}
      </text>
      <text x="156" y="150" fill="#94a3b8" fontSize="9" textAnchor="end">
        {regions.bcOnly.length ? regions.bcOnly.join(",") : ""}
      </text>
      <text x="132" y="176" fill="#94a3b8" fontSize="9" textAnchor="middle">
        {regions.cOnly.length ? regions.cOnly.join(",") : ""}
      </text>
    </svg>
  );
}

export function VennDiagram() {
  const [count, setCount] = useState(2);
  const [rawA, setRawA] = useState("1, 2, 3");
  const [rawB, setRawB] = useState("3, 4, 5");
  const [rawC, setRawC] = useState("5, 6, 7");
  const [labels, setLabels] = useState({ a: "A", b: "B", c: "C" });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const sets = useMemo(() => {
    const a = parseElements(rawA);
    const b = parseElements(rawB);
    const c = parseElements(rawC);
    return { a, b, c };
  }, [rawA, rawB, rawC]);

  const two = useMemo(() => {
    const { a, b } = sets;
    const inter = intersection(a, b);
    const aOnly = difference(a, b);
    const bOnly = difference(b, a);
    return {
      union: union(a, b),
      intersection: inter,
      aOnly,
      bOnly,
      differenceAB: difference(a, b),
      differenceBA: difference(b, a),
    };
  }, [sets]);

  const three = useMemo(() => {
    const { a, b, c } = sets;
    const abc = intersection3(a, b, c);
    const abOnly = difference(intersection(a, b), c);
    const acOnly = difference(intersection(a, c), b);
    const bcOnly = difference(intersection(b, c), a);
    const aOnly = onlyA(a, b, c);
    const bOnly = onlyB(a, b, c);
    const cOnly = onlyC(a, b, c);
    return {
      union: union3(a, b, c),
      intersection: abc,
      aOnly,
      bOnly,
      cOnly,
      abOnly,
      acOnly,
      bcOnly,
      abc,
      regions: {
        aOnly,
        bOnly,
        cOnly,
        abOnly,
        acOnly,
        bcOnly,
        abc,
      },
    };
  }, [sets]);

  const saveHistory = async () => {
    setError("");
    try {
      await api.post("/api/history", {
        type: "venn",
        title: `Venn ${count} sets`,
        payload: {
          count,
          labels,
          sets: { a: sets.a, b: sets.b, c: sets.c },
          two,
          three,
        },
      });
      setStatus("Saved to history.");
    } catch (e) {
      setError(e.response?.data?.message || "Could not save");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-av-card/80 p-4 ring-1 ring-white/10">
        <span className="text-sm text-slate-400">Sets:</span>
        {[2, 3].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setCount(n)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              count === n ? "bg-cyan-500/25 text-cyan-200 ring-1 ring-cyan-500/40" : "bg-white/5"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block space-y-1">
          <span className="text-xs text-slate-500">Label A</span>
          <input
            value={labels.a}
            onChange={(e) => setLabels((s) => ({ ...s, a: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-slate-500">Label B</span>
          <input
            value={labels.b}
            onChange={(e) => setLabels((s) => ({ ...s, b: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
          />
        </label>
        {count === 3 && (
          <label className="block space-y-1">
            <span className="text-xs text-slate-500">Label C</span>
            <input
              value={labels.c}
              onChange={(e) => setLabels((s) => ({ ...s, c: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
            />
          </label>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-xs font-medium text-slate-400">Set {labels.a} (comma-separated)</span>
          <textarea
            value={rawA}
            onChange={(e) => setRawA(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-slate-400">Set {labels.b}</span>
          <textarea
            value={rawB}
            onChange={(e) => setRawB(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm"
          />
        </label>
        {count === 3 && (
          <label className="block space-y-1 md:col-span-2">
            <span className="text-xs font-medium text-slate-400">Set {labels.c}</span>
            <textarea
              value={rawC}
              onChange={(e) => setRawC(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm"
            />
          </label>
        )}
      </div>

      <div className="rounded-2xl bg-av-card/60 p-6 ring-1 ring-white/10">
        {count === 2 ? (
          <TwoSetVenn
            aLabel={labels.a}
            bLabel={labels.b}
            onlyASet={two.aOnly}
            inter={two.intersection}
            onlyBSet={two.bOnly}
          />
        ) : (
          <ThreeSetVenn
            aLabel={labels.a}
            bLabel={labels.b}
            cLabel={labels.c}
            regions={three.regions}
          />
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-black/30 p-4 ring-1 ring-white/10">
          <h3 className="text-sm font-semibold text-cyan-200">Union</h3>
          <p className="mt-2 font-mono text-xs text-slate-300">
            {(count === 2 ? two.union : three.union).join(", ") || "∅"}
          </p>
        </div>
        <div className="rounded-xl bg-black/30 p-4 ring-1 ring-white/10">
          <h3 className="text-sm font-semibold text-violet-200">Intersection</h3>
          <p className="mt-2 font-mono text-xs text-slate-300">
            {(count === 2 ? two.intersection : three.intersection).join(", ") || "∅"}
          </p>
        </div>
        <div className="rounded-xl bg-black/30 p-4 ring-1 ring-white/10">
          <h3 className="text-sm font-semibold text-pink-200">
            Difference ({labels.a} \\ {labels.b})
          </h3>
          <p className="mt-2 font-mono text-xs text-slate-300">
            {two.differenceAB.join(", ") || "∅"}
          </p>
        </div>
        <div className="rounded-xl bg-black/30 p-4 ring-1 ring-white/10">
          <h3 className="text-sm font-semibold text-pink-200">
            Difference ({labels.b} \\ {labels.a})
          </h3>
          <p className="mt-2 font-mono text-xs text-slate-300">
            {two.differenceBA.join(", ") || "∅"}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={saveHistory}
        className="rounded-lg border border-white/15 px-5 py-2 text-sm text-slate-200 hover:bg-white/10"
      >
        Save to history
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {status && <p className="text-xs text-emerald-400">{status}</p>}
    </div>
  );
}
