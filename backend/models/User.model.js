import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["donor", "ngo"],
      required: true,
    },

    securityQuestion: {
      type: String,
      required: true,
    },
    securityAnswer: {
      type: String,
      required: true,
    },

    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      text: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

<<<<<<< HEAD
export default mongoose.model('User', userSchema);
=======
const User = mongoose.model("User", userSchema);
export default User;
>>>>>>> 76559eb6b59f57ce453b630264cb0c4ba8cf6bc3
