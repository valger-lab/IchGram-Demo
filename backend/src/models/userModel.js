import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: { type: String, default: "" },
    avatar: { type: String, default: "https://www.gravatar.com/avatar/?d=mp" },
    avatarPublicId: { type: String },
    website: {
      type: String,
      default: "",
    },
    profileStyle: {
      bgColor: { type: String },
      textColor: { type: String },
      sidebarBgColor: { type: String },
      sidebarTextColor: { type: String },
      headerImage: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", userSchema);
