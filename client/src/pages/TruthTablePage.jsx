import { TruthTableTool } from "../features/truth/index.js";

export function TruthTablePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Truth table generator</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Enter a boolean expression to enumerate all assignments, then read off canonical CNF and DNF forms.
        </p>
      </div>
      <TruthTableTool />
    </div>
  );
}
