import { Line, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { runBfs, runDfs, runWarshall } from "./graphApi.js";
import { api } from "../../lib/api.js";

function nodeColor(id, highlightSet, currentId) {
  if (currentId && id === currentId) return "#fbbf24";
  if (highlightSet && highlightSet.has(id)) return "#22d3ee";
  return "#64748b";
}

function GraphScene({
  nodes,
  edges,
  onPlaneClick,
  onNodeClick,
  highlightIds,
  currentId,
  directed,
}) {
  const planeRef = useRef();

  const handlePointerDown = useCallback(
    (e) => {
      e.stopPropagation();
      if (e.object === planeRef.current) {
        onPlaneClick(e.point.clone());
      }
    },
    [onPlaneClick]
  );

  return (
    <>
      <color attach="background" args={["#0b0f1a"]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[8, 14, 6]} intensity={1.1} />
      <mesh
        ref={planeRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        onPointerDown={handlePointerDown}
      >
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <gridHelper args={[40, 40, "#1e293b", "#1e293b"]} position={[0, 0, 0]} />
      {edges.map((e, i) => {
        const a = nodes.find((n) => n.id === e.from);
        const b = nodes.find((n) => n.id === e.to);
        if (!a || !b) return null;
        const pa = new THREE.Vector3(...a.position);
        const pb = new THREE.Vector3(...b.position);
        const elevated = [
          [pa.x, pa.y + 0.35, pa.z],
          [pb.x, pb.y + 0.35, pb.z],
        ];
        return (
          <Line
            key={`${e.from}-${e.to}-${i}`}
            points={elevated}
            color={directed ? "#6366f1" : "#94a3b8"}
            lineWidth={2}
            dashed={false}
          />
        );
      })}
      {nodes.map((n) => (
        <group key={n.id} position={n.position}>
          <mesh
            onPointerDown={(ev) => {
              ev.stopPropagation();
              onNodeClick(n.id);
            }}
          >
            <sphereGeometry args={[0.42, 24, 24]} />
            <meshStandardMaterial
              color={nodeColor(n.id, highlightIds, currentId)}
              emissive={nodeColor(n.id, highlightIds, currentId)}
              emissiveIntensity={currentId === n.id ? 0.45 : 0.12}
              metalness={0.2}
              roughness={0.45}
            />
          </mesh>
          <Text
            position={[0, 0.65, 0]}
            fontSize={0.35}
            color="#e2e8f0"
            anchorX="center"
            anchorY="middle"
          >
            {String(n.id).slice(0, 8)}
          </Text>
        </group>
      ))}
      <OrbitControls makeDefault minDistance={6} maxDistance={40} />
    </>
  );
}

function CameraSync({ nodes }) {
  const { camera } = useThree();
  useEffect(() => {
    if (nodes.length === 0) {
      camera.position.set(10, 10, 10);
      camera.lookAt(0, 0, 0);
    }
  }, [nodes.length, camera]);
  return null;
}

export function GraphVisualizer() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [directed, setDirected] = useState(false);
  const [mode, setMode] = useState("addNode");
  const [pendingEdge, setPendingEdge] = useState(null);
  const [algo, setAlgo] = useState("bfs");
  const [startId, setStartId] = useState("");
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const timerRef = useRef(null);

  const apiNodes = useMemo(() => nodes.map((n) => ({ id: n.id })), [nodes]);
  const apiEdges = useMemo(
    () => edges.map((e) => ({ from: e.from, to: e.to })),
    [edges]
  );

  const clearAnimation = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPlaying(false);
    setSteps([]);
    setStepIndex(0);
  }, []);

  useEffect(() => {
    return () => clearAnimation();
  }, [clearAnimation]);

  const onPlaneClick = useCallback(
    (point) => {
      if (mode !== "addNode") return;
      const id = crypto.randomUUID().slice(0, 8);
      const y = 0.35;
      setNodes((prev) => [...prev, { id, position: [point.x, y, point.z] }]);
      setStatus(`Added node ${id}`);
    },
    [mode]
  );

  const onNodeClick = useCallback(
    (id) => {
      if (mode === "addNode") {
        setStartId(id);
        setStatus(`Start node set to ${id}`);
        return;
      }
      if (mode === "edge") {
        if (!pendingEdge) {
          setPendingEdge(id);
          setStatus(`Selected first endpoint ${id}. Click another node.`);
        } else if (pendingEdge !== id) {
          setEdges((prev) => {
            const exists = prev.some(
              (e) =>
                (e.from === pendingEdge && e.to === id) ||
                (e.from === id && e.to === pendingEdge)
            );
            if (exists) return prev;
            return [...prev, { from: pendingEdge, to: id }];
          });
          setPendingEdge(null);
          setStatus(`Edge added`);
        }
      }
    },
    [mode, pendingEdge]
  );

  const runAlgorithm = async () => {
    setError("");
    clearAnimation();
    if (nodes.length === 0) {
      setError("Add at least one node.");
      return;
    }
    try {
      if (algo === "warshall") {
        const data = await runWarshall({
          nodes: apiNodes,
          edges: apiEdges,
          directed,
        });
        setSteps(data.steps || []);
        setStepIndex(0);
        setStatus("Warshall: step through transitive closure.");
        return;
      }
      if (!startId || !nodes.some((n) => n.id === startId)) {
        setError("Pick a valid start node (click node in Add-node mode or set start).");
        return;
      }
      const body = {
        nodes: apiNodes,
        edges: apiEdges,
        startNodeId: startId,
        directed,
      };
      const data =
        algo === "dfs" ? await runDfs(body) : await runBfs(body);
      setSteps(data.steps || []);
      setStepIndex(0);
      setPlaying(true);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Request failed");
    }
  };

  useEffect(() => {
    if (!playing || steps.length === 0) return;
    timerRef.current = setInterval(() => {
      setStepIndex((i) => {
        if (i >= steps.length - 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, 450);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, steps.length]);

  const currentStep = steps[stepIndex];
  const visitedSet = useMemo(() => {
    if (!currentStep?.visited) return new Set();
    return new Set(currentStep.visited.map(String));
  }, [currentStep]);

  const currentHighlight = currentStep?.current ? String(currentStep.current) : null;

  const matrixText = useMemo(() => {
    if (algo !== "warshall" || !currentStep?.matrix) return "";
    const order = currentStep.nodeOrder || [];
    const m = currentStep.matrix;
    const header = "     " + order.map((id) => String(id).padStart(4, " ")).join(" ");
    const rows = m.map((row, i) => {
      const line = order[i].toString().padEnd(4, " ") + row.map((v) => String(v).padStart(4, " ")).join(" ");
      return line;
    });
    return [header, ...rows].join("\n");
  }, [algo, currentStep]);

  const saveHistory = async () => {
    setError("");
    try {
      await api.post("/api/history", {
        type: "graph",
        title: `${algo.toUpperCase()} on ${nodes.length} nodes`,
        payload: {
          nodes,
          edges,
          directed,
          algorithm: algo,
          startNodeId: startId,
          stepCount: steps.length,
          savedAt: new Date().toISOString(),
        },
      });
      setStatus("Saved to your history.");
    } catch (e) {
      setError(e.response?.data?.message || "Could not save history");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="h-[min(70vh,560px)] min-h-[280px] overflow-hidden rounded-2xl ring-1 ring-white/10">
        <Canvas shadows camera={{ position: [12, 12, 12], fov: 45 }}>
          <CameraSync nodes={nodes} />
          <GraphScene
            nodes={nodes}
            edges={edges}
            onPlaneClick={onPlaneClick}
            onNodeClick={onNodeClick}
            highlightIds={visitedSet}
            currentId={algo === "warshall" ? null : currentHighlight}
            directed={directed}
          />
        </Canvas>
      </div>
      <div className="space-y-4 rounded-2xl bg-av-card/80 p-5 ring-1 ring-white/10">
        <h2 className="font-display text-lg font-semibold text-white">Controls</h2>
        <div className="flex flex-wrap gap-2">
          {[
            ["addNode", "Add nodes"],
            ["edge", "Connect edges"],
          ].map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                setMode(k);
                setPendingEdge(null);
              }}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                mode === k ? "bg-cyan-500/25 text-cyan-200 ring-1 ring-cyan-500/40" : "bg-white/5 text-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-400">
          <input
            type="checkbox"
            checked={directed}
            onChange={(e) => setDirected(e.target.checked)}
          />
          Directed edges (recommended for Warshall)
        </label>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wide text-slate-500">Algorithm</label>
          <select
            value={algo}
            onChange={(e) => {
              clearAnimation();
              setAlgo(e.target.value);
            }}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
          >
            <option value="bfs">Breadth-first search</option>
            <option value="dfs">Depth-first search</option>
            <option value="warshall">Warshall (transitive closure)</option>
          </select>
        </div>
        {algo !== "warshall" && (
          <p className="text-xs text-slate-500">
            In <strong>Add nodes</strong> mode, click a node to set it as the traversal start.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={runAlgorithm}
            className="rounded-lg bg-cyan-500/20 px-4 py-2 text-sm font-medium text-cyan-200 ring-1 ring-cyan-500/40 hover:bg-cyan-500/30"
          >
            Run on server
          </button>
          <button
            type="button"
            onClick={() => {
              clearAnimation();
              setStepIndex(0);
            }}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
          >
            Reset playback
          </button>
          <button
            type="button"
            onClick={() => {
              setNodes([]);
              setEdges([]);
              clearAnimation();
              setStartId("");
              setStatus("Cleared graph");
            }}
            className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
          >
            Clear all
          </button>
        </div>
        {algo === "warshall" && steps.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs text-slate-500">Step {stepIndex + 1} / {steps.length}</label>
            <input
              type="range"
              min={0}
              max={Math.max(0, steps.length - 1)}
              value={Math.min(stepIndex, steps.length - 1)}
              onChange={(e) => setStepIndex(Number(e.target.value))}
              className="w-full"
            />
            <pre className="max-h-40 overflow-auto rounded-lg bg-black/40 p-3 text-[10px] leading-tight text-slate-300">
              {matrixText}
            </pre>
          </div>
        )}
        {algo !== "warshall" && steps.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs text-slate-500">Step {stepIndex + 1} / {steps.length}</label>
            <input
              type="range"
              min={0}
              max={Math.max(0, steps.length - 1)}
              value={Math.min(stepIndex, steps.length - 1)}
              onChange={(e) => setStepIndex(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-slate-400">{currentStep?.message}</p>
          </div>
        )}
        <button
          type="button"
          onClick={saveHistory}
          className="w-full rounded-lg border border-white/15 py-2 text-sm text-slate-200 hover:bg-white/10"
        >
          Save run to history
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {status && <p className="text-xs text-slate-500">{status}</p>}
      </div>
    </div>
  );
}
