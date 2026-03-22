import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createHistory, deleteHistory, listHistory } from "../controllers/historyController.js";

const router = Router();

router.use(requireAuth);
router.get("/", listHistory);
router.post("/", createHistory);
router.delete("/:id", deleteHistory);

export default router;
