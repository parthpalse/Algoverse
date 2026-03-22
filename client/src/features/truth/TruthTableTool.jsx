import { useMemo, useState } from "react";
import { buildTruthTable } from "../../lib/booleanParser.js";
import { api } from "../../lib/api.js";

export function TruthTableTool() {
  const [expr, setExpr] = useState("A & B");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("");

  const table = useMemo(() => {
    if (!result) return null;
    return result;
  }, [result]);

  const generate = () => {
    setError("");
    setStatus("");
    try {
      const data = buildTruthTable(expr);
      setResult(data);
    } catch (e) {
      setError(e.message || "Invalid expression");
      setResult(null);
    }
  };

  const saveHistory = async () => {
    if (!table) return;
    setError("");
    try {
      await api.post("/api/history", {
        type: "truth",
        title: `Truth: ${table.expression.slice(0, 80)}`,
        payload: {
          expression: table.expression,
          vars: table.vars,
          cnf: table.cnf,
          dnf: table.dnf,
          rows: table.rows,
        },
      });
      setStatus("Saved to history.");
    } catch (e) {
      setError(e.response?.data?.message || "Could not save");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-av-card/80 p-6 ring-1 ring-white/10">
        <label className="mb-2 block text-sm font-medium text-slate-300">
          Logical expression
        </label>
        <p className="mb-3 text-xs text-slate-500">
          Variables: single letters <code className="text-cyan-400">A</code>–
          <code className="text-cyan-400">Z</code>. Operators:{" "}
          <code className="text-slate-400">!</code> NOT,{" "}
          <code className="text-slate-400">&</code> AND,{" "}
          <code className="text-slate-400">|</code> OR,{" "}
          <code className="text-slate-400">^</code> XOR,{" "}
          <code className="text-slate-400">-&gt;</code> implies,{" "}
          <code className="text-slate-400">&lt;-&gt;</code> iff. Use parentheses.
        </p>
        <textarea
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm text-slate-100 outline-none ring-cyan-500/0 focus:ring-2"
          spellCheck={false}
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={generate}
            className="rounded-lg bg-cyan-500/20 px-5 py-2 text-sm font-medium text-cyan-200 ring-1 ring-cyan-500/40 hover:bg-cyan-500/30"
          >
            Generate table
          </button>
          <button
            type="button"
            onClick={saveHistory}
            disabled={!table}
            className="rounded-lg border border-white/15 px-5 py-2 text-sm text-slate-200 hover:bg-white/10 disabled:opacity-40"
          >
            Save to history
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        {status && <p className="mt-3 text-xs text-emerald-400">{status}</p>}
      </div>

      {table && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-av-card/80 p-5 ring-1 ring-white/10">
              <h3 className="font-display text-sm font-semibold text-white">CNF</h3>
              <p className="mt-2 break-words font-mono text-xs leading-relaxed text-slate-300">
                {table.cnf}
              </p>
            </div>
            <div className="rounded-2xl bg-av-card/80 p-5 ring-1 ring-white/10">
              <h3 className="font-display text-sm font-semibold text-white">DNF</h3>
              <p className="mt-2 break-words font-mono text-xs leading-relaxed text-slate-300">
                {table.dnf}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto rounded-2xl ring-1 ring-white/10">
            <table className="w-full min-w-[320px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  {table.vars.map((v) => (
                    <th key={v} className="px-4 py-3 font-medium text-cyan-200">
                      {v}
                    </th>
                  ))}
                  <th className="px-4 py-3 font-medium text-violet-200">f</th>
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                    {table.vars.map((v) => (
                      <td key={v} className="px-4 py-2 font-mono text-slate-300">
                        {row.assignment[v] ? "1" : "0"}
                      </td>
                    ))}
                    <td className="px-4 py-2 font-mono font-semibold text-white">
                      {row.value ? "1" : "0"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
