import multer from "multer";
import postStorage from "../config/storage/postStorage.js";

const upload = multer({ storage: postStorage });

export default upload;
