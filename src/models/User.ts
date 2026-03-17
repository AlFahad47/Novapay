import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // অ্যাকাউন্ট এবং লেনদেন নিয়ন্ত্রণ
    accountStatus: {
      type: String,
      enum: ["active", "suspended", "fraud"],
      default: "active",
    },
    walletFrozen: { type: Boolean, default: false },

    // KYC স্ট্যাটাস
    kycStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "fraud"],
      default: "pending",
    },

    kycDetails: {
      phone: String,
      address: String,
    },

    // ফ্রড ট্র্যাকিং ডাটা
    fraudInfo: {
      isFraud: { type: Boolean, default: false },
      reason: String,
      markedBy: String,
      markedAt: Date,
    },
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
