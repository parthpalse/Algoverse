import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["graph", "truth", "venn", "hamming"],
      index: true,
    },
    title: {
      type: String,
      default: "",
      trim: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

historySchema.index({ userId: 1, createdAt: -1 });

export const History = mongoose.model("History", historySchema);
