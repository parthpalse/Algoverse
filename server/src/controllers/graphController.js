/**
 * Build adjacency list from node ids and directed edges.
 * Undirected: pass directed=false to add both directions.
 */
function buildAdjacencyList(nodeIds, edges, directed) {
  const idSet = new Set(nodeIds.map(String));
  const adj = new Map();
  for (const id of idSet) {
    adj.set(id, []);
  }
  for (const e of edges || []) {
    const a = String(e.from);
    const b = String(e.to);
    if (!idSet.has(a) || !idSet.has(b)) continue;
    adj.get(a).push(b);
    if (!directed) {
      adj.get(b).push(a);
    }
  }
  return adj;
}

function normalizeNodeIds(nodes) {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    throw new Error("nodes must be a non-empty array");
  }
  return nodes.map((n) => {
    if (n && n.id !== undefined && n.id !== null) return String(n.id);
    throw new Error("Each node must have an id");
  });
}

export function runBfs(req, res) {
  try {
    const { nodes, edges, startNodeId, directed = false } = req.body;
    const ids = normalizeNodeIds(nodes);
    const start = String(startNodeId);
    if (!ids.includes(start)) {
      return res.status(400).json({ message: "startNodeId must exist in nodes" });
    }
    const adj = buildAdjacencyList(ids, edges, directed);
    const visited = [];
    const order = [];
    const queue = [start];
    const steps = [];

    steps.push({
      phase: "init",
      visited: [],
      current: null,
      queue: [...queue],
      message: `BFS: start at ${start}`,
    });

    while (queue.length) {
      const u = queue.shift();
      if (visited.includes(u)) continue;
      visited.push(u);
      order.push(u);
      steps.push({
        phase: "visit",
        visited: [...visited],
        current: u,
        queue: [...queue],
        message: `Visit ${u}`,
      });
      const neighbors = (adj.get(u) || []).slice().sort();
      for (const v of neighbors) {
        if (!visited.includes(v) && !queue.includes(v)) {
          queue.push(v);
        }
      }
      steps.push({
        phase: "enqueue",
        visited: [...visited],
        current: u,
        queue: [...queue],
        message: `Enqueue neighbors of ${u}`,
      });
    }

    res.json({
      algorithm: "bfs",
      order,
      steps,
      startNodeId: start,
      directed: !!directed,
    });
  } catch (err) {
    res.status(400).json({ message: err.message || "BFS failed" });
  }
}

export function runDfs(req, res) {
  try {
    const { nodes, edges, startNodeId, directed = false } = req.body;
    const ids = normalizeNodeIds(nodes);
    const start = String(startNodeId);
    if (!ids.includes(start)) {
      return res.status(400).json({ message: "startNodeId must exist in nodes" });
    }
    const adj = buildAdjacencyList(ids, edges, directed);
    const visited = [];
    const order = [];
    const steps = [];

    steps.push({
      phase: "init",
      visited: [],
      current: null,
      stack: [start],
      message: `DFS: start at ${start}`,
    });

    const stack = [start];

    while (stack.length) {
      const u = stack.pop();
      if (visited.includes(u)) {
        steps.push({
          phase: "skip",
          visited: [...visited],
          current: u,
          stack: [...stack],
          message: `Skip already visited ${u}`,
        });
        continue;
      }
      visited.push(u);
      order.push(u);
      steps.push({
        phase: "visit",
        visited: [...visited],
        current: u,
        stack: [...stack],
        message: `Visit ${u}`,
      });
      const neighbors = (adj.get(u) || []).slice().sort((a, b) => b.localeCompare(a));
      for (const v of neighbors) {
        stack.push(v);
      }
      steps.push({
        phase: "push",
        visited: [...visited],
        current: u,
        stack: [...stack],
        message: `Push unvisited neighbors of ${u} onto stack`,
      });
    }

    res.json({
      algorithm: "dfs",
      order,
      steps,
      startNodeId: start,
      directed: !!directed,
    });
  } catch (err) {
    res.status(400).json({ message: err.message || "DFS failed" });
  }
}

/**
 * Warshall (Floyd-Warshall) transitive closure on directed graph.
 * adj[i][j] = 1 if edge i->j exists or i===j for closure diagonal optional.
 * Returns steps for each k when matrix changes.
 */
export function runWarshall(req, res) {
  try {
    const { nodes, edges, directed = true } = req.body;
    const ids = normalizeNodeIds(nodes);
    const n = ids.length;
    if (n === 0) {
      return res.status(400).json({ message: "Need at least one node" });
    }

    const index = new Map(ids.map((id, i) => [id, i]));
    const M = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) M[i][i] = 1;

    for (const e of edges || []) {
      const a = String(e.from);
      const b = String(e.to);
      if (!index.has(a) || !index.has(b)) continue;
      M[index.get(a)][index.get(b)] = 1;
      if (!directed) {
        M[index.get(b)][index.get(a)] = 1;
      }
    }

    const steps = [];
    const clone = (mat) => mat.map((row) => row.slice());

    steps.push({
      phase: "init",
      k: null,
      matrix: clone(M),
      nodeOrder: [...ids],
      message: "Initial reachability matrix (including self-loops)",
    });

    const dist = M.map((row) => row.slice());

    for (let k = 0; k < n; k++) {
      let changed = false;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (dist[i][k] && dist[k][j] && !dist[i][j]) {
            dist[i][j] = 1;
            changed = true;
          }
        }
      }
      steps.push({
        phase: "outer_k",
        k: ids[k],
        kIndex: k,
        matrix: clone(dist),
        nodeOrder: [...ids],
        message: `After considering intermediate vertex ${ids[k]} (k=${k})`,
        changed,
      });
    }

    res.json({
      algorithm: "warshall",
      transitiveClosure: dist,
      nodeOrder: ids,
      steps,
      directed: !!directed,
    });
  } catch (err) {
    res.status(400).json({ message: err.message || "Warshall failed" });
  }
}
