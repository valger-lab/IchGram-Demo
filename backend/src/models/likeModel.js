import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  },
  { timestamps: true }
);

likeSchema.index({ author: 1, post: 1 }, { unique: true }); // один лайк на пост от одного пользователя

export const Like = mongoose.model("Like", likeSchema);
