import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";

const typeLabels = {
  graph: "Graph",
  truth: "Truth table",
  venn: "Venn",
  hamming: "Hamming",
};

export function DashboardPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/history", { params: { limit: 80 } });
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e.response?.data?.message || "Could not load history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id) => {
    try {
      await api.delete(`/api/history/${id}`);
      setItems((prev) => prev.filter((h) => h.id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } catch (e) {
      setError(e.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-400">
            {total} saved result{total === 1 ? "" : "s"} across tools.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/graph"
            className="rounded-lg bg-cyan-500/20 px-4 py-2 text-sm text-cyan-200 ring-1 ring-cyan-500/40 hover:bg-cyan-500/30"
          >
            Graph 3D
          </Link>
          <Link
            to="/truth-table"
            className="rounded-lg bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
          >
            Truth table
          </Link>
          <Link
            to="/venn"
            className="rounded-lg bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
          >
            Venn
          </Link>
          <Link
            to="/hamming"
            className="rounded-lg bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
          >
            Hamming
          </Link>
        </div>
      </div>

      {loading && <p className="text-slate-500">Loading history…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {!loading && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-slate-500">
          No saved runs yet. Use any tool and click &quot;Save to history&quot;.
        </div>
      )}

      <ul className="space-y-3">
        {items.map((h) => (
          <li
            key={h.id}
            className="overflow-hidden rounded-2xl border border-white/10 bg-av-card/70 ring-1 ring-white/5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
                  {typeLabels[h.type] || h.type}
                </span>
                <h2 className="mt-2 font-medium text-slate-100">{h.title || "Untitled"}</h2>
                <p className="text-xs text-slate-500">
                  {new Date(h.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setExpanded((x) => (x === h.id ? null : h.id))}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10"
                >
                  {expanded === h.id ? "Hide" : "Details"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(h.id)}
                  className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            </div>
            {expanded === h.id && (
              <pre className="max-h-80 overflow-auto border-t border-white/10 bg-black/40 p-4 text-left text-[11px] leading-relaxed text-slate-400">
                {JSON.stringify(h.payload, null, 2)}
              </pre>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
