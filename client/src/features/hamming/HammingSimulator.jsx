import { useMemo, useState } from "react";
import { api } from "../../lib/api.js";
import { decodeHamming74, encodeHamming74 } from "./hammingCode.js";

function BitToggle({ value, onChange, disabled, label }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(value ? 0 : 1)}
      className={`h-10 w-10 rounded-lg font-mono text-lg font-bold transition ${
        value
          ? "bg-cyan-500/40 text-cyan-100 ring-1 ring-cyan-400/60"
          : "bg-white/5 text-slate-500 ring-1 ring-white/10"
      } ${disabled ? "opacity-50" : "hover:bg-white/10"}`}
      aria-label={label}
    >
      {value}
    </button>
  );
}

export function HammingSimulator() {
  const [data, setData] = useState([1, 0, 1, 1]);
  const [encoded, setEncoded] = useState(null);
  const [received, setReceived] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const codeword = useMemo(() => {
    try {
      return encodeHamming74(data);
    } catch {
      return null;
    }
  }, [data]);

  const decodeResult = useMemo(() => {
    if (!received) return null;
    try {
      return decodeHamming74(received);
    } catch (e) {
      return { error: e.message };
    }
  }, [received]);

  const encodeStep = () => {
    setError("");
    try {
      const c = encodeHamming74(data);
      setEncoded(c);
      setReceived(c.slice());
      setStatus("Encoded 4 data bits into 7-bit Hamming codeword. Toggle a bit below to inject an error.");
    } catch (e) {
      setError(e.message);
    }
  };

  const setReceivedBit = (index, bit) => {
    if (!received) return;
    const next = received.slice();
    next[index] = bit ? 1 : 0;
    setReceived(next);
  };

  const saveHistory = async () => {
    if (!encoded || !received || !decodeResult || decodeResult.error) return;
    setError("");
    try {
      await api.post("/api/history", {
        type: "hamming",
        title: "Hamming (7,4) simulation",
        payload: {
          dataBits: data,
          encoded,
          received,
          corrected: decodeResult.corrected,
          dataRecovered: decodeResult.dataBits,
          errorBitIndex: decodeResult.errorBitIndex,
          syndrome: decodeResult.syndrome,
        },
      });
      setStatus("Saved to history.");
    } catch (e) {
      setError(e.response?.data?.message || "Could not save");
    }
  };

  const labels = ["p1", "p2", "d3", "p4", "d5", "d6", "d7"];

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-av-card/80 p-6 ring-1 ring-white/10">
        <h3 className="font-display text-lg font-semibold text-white">Data bits (4)</h3>
        <p className="mt-1 text-xs text-slate-500">
          Positions map to Hamming layout bits 3,5,6,7 in the final codeword.
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          {data.map((b, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[10px] uppercase text-slate-500">d{i + 1}</span>
              <BitToggle
                value={b}
                onChange={(v) => {
                  const next = data.slice();
                  next[i] = v;
                  setData(next);
                }}
                label={`data ${i}`}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={encodeStep}
          className="mt-6 rounded-lg bg-cyan-500/20 px-5 py-2 text-sm font-medium text-cyan-200 ring-1 ring-cyan-500/40 hover:bg-cyan-500/30"
        >
          Encode with Hamming (7,4)
        </button>
      </section>

      {codeword && (
        <section className="rounded-2xl bg-av-card/80 p-6 ring-1 ring-white/10">
          <h3 className="font-display text-lg font-semibold text-white">Codeword (7 bits)</h3>
          <p className="mt-1 font-mono text-sm text-slate-400">{codeword.join("")}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {labels.map((lb, i) => (
              <span key={lb} className="rounded bg-white/5 px-2 py-1 font-mono text-[10px] text-slate-500">
                {i + 1}:{lb}
              </span>
            ))}
          </div>
        </section>
      )}

      {received && (
        <section className="rounded-2xl bg-av-card/80 p-6 ring-1 ring-white/10">
          <h3 className="font-display text-lg font-semibold text-white">Received word (flip one bit to simulate error)</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            {received.map((b, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-500">{labels[i]}</span>
                <BitToggle value={b} onChange={(v) => setReceivedBit(i, v)} label={`bit ${i}`} />
              </div>
            ))}
          </div>
        </section>
      )}

      {decodeResult && !decodeResult.error && (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-black/35 p-4 ring-1 ring-white/10">
            <h4 className="text-sm font-semibold text-emerald-200">Syndrome</h4>
            <p className="mt-2 font-mono text-2xl text-white">{decodeResult.syndrome}</p>
            <p className="mt-1 text-xs text-slate-500">
              {decodeResult.syndrome === 0
                ? "No error detected (or multiple errors — SECDED not modeled)."
                : `Single-bit error suspected at codeword index ${decodeResult.errorBitIndex} (1-based position ${decodeResult.errorBitIndex + 1}).`}
            </p>
          </div>
          <div className="rounded-xl bg-black/35 p-4 ring-1 ring-white/10">
            <h4 className="text-sm font-semibold text-violet-200">Corrected codeword</h4>
            <p className="mt-2 font-mono text-sm text-slate-200">
              {decodeResult.corrected.join("")}
            </p>
            <h4 className="mt-4 text-sm font-semibold text-cyan-200">Recovered data</h4>
            <p className="mt-1 font-mono text-sm text-slate-200">
              {decodeResult.dataBits.join("")}
            </p>
          </div>
        </section>
      )}

      {decodeResult?.error && (
        <p className="text-sm text-red-400">{decodeResult.error}</p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={saveHistory}
          disabled={!received || !decodeResult || decodeResult.error}
          className="rounded-lg border border-white/15 px-5 py-2 text-sm text-slate-200 hover:bg-white/10 disabled:opacity-40"
        >
          Save to history
        </button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {status && <p className="text-xs text-emerald-400">{status}</p>}
    </div>
  );
}
