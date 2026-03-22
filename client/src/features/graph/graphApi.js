import { api } from "../../lib/api.js";

export function runBfs(body) {
  return api.post("/api/graph/bfs", body).then((r) => r.data);
}

export function runDfs(body) {
  return api.post("/api/graph/dfs", body).then((r) => r.data);
}

export function runWarshall(body) {
  return api.post("/api/graph/warshall", body).then((r) => r.data);
}
