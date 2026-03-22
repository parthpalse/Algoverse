import { History } from "../models/History.js";

export async function createHistory(req, res) {
  try {
    const { type, title, payload } = req.body;
    if (!type || !payload) {
      return res.status(400).json({ message: "type and payload are required" });
    }
    const allowed = ["graph", "truth", "venn", "hamming"];
    if (!allowed.includes(type)) {
      return res.status(400).json({ message: "Invalid type" });
    }
    const doc = await History.create({
      userId: req.user.id,
      type,
      title: typeof title === "string" ? title.slice(0, 200) : "",
      payload,
    });
    res.status(201).json({
      id: doc._id.toString(),
      type: doc.type,
      title: doc.title,
      payload: doc.payload,
      createdAt: doc.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to save history" });
  }
}

export async function listHistory(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const skip = parseInt(req.query.skip, 10) || 0;
    const type = req.query.type;
    const filter = { userId: req.user.id };
    if (type && ["graph", "truth", "venn", "hamming"].includes(type)) {
      filter.type = type;
    }
    const [items, total] = await Promise.all([
      History.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      History.countDocuments(filter),
    ]);
    res.json({
      items: items.map((h) => ({
        id: h._id.toString(),
        type: h.type,
        title: h.title,
        payload: h.payload,
        createdAt: h.createdAt,
      })),
      total,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load history" });
  }
}

export async function deleteHistory(req, res) {
  try {
    const { id } = req.params;
    const result = await History.deleteOne({ _id: id, userId: req.user.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete" });
  }
}
