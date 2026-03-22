import { HammingSimulator } from "../features/hamming/index.js";

export function HammingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Hamming (7,4) simulator</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Four data bits are expanded with three parity bits. Flip any single transmitted bit and the syndrome
          locates it for correction.
        </p>
      </div>
      <HammingSimulator />
    </div>
  );
}
