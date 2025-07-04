import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: { type: String, default: "" },
    imagePublicId: { type: String, default: "" }, // для хранения ID изображения в облаке
    description: { type: String, default: "" },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    videoUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
