import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../cloudinary.js";

const postStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "posts",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 1080, height: 1080, crop: "limit" }],
  },
});

export default postStorage;
