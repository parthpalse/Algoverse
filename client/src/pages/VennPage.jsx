import { VennDiagram } from "../features/venn/index.js";

export function VennPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Venn diagram tool</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Describe two or three sets with comma-separated elements. The diagram updates with unions, intersections,
          and differences.
        </p>
      </div>
      <VennDiagram />
    </div>
  );
}
