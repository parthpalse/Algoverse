import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { runBfs, runDfs, runWarshall } from "../controllers/graphController.js";

const router = Router();

router.use(requireAuth);
router.post("/bfs", runBfs);
router.post("/dfs", runDfs);
router.post("/warshall", runWarshall);

export default router;
