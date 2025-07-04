import mongoose from "mongoose";

const commentLikeSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
  },
  { timestamps: true }
);

commentLikeSchema.index({ author: 1, comment: 1 }, { unique: true });

export const CommentLike = mongoose.model("CommentLike", commentLikeSchema);
