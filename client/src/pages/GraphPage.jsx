import { GraphVisualizer } from "../features/graph/index.js";

export function GraphPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">3D graph visualizer</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Click the ground plane to place nodes. Switch to <strong>Connect edges</strong> and click two nodes.
          Traversals run on the server; Warshall shows the transitive closure matrix step by step.
        </p>
      </div>
      <GraphVisualizer />
    </div>
  );
}
