import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "../../../../../../../models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();

    // 1. Admin Auth Check
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { reason } = await req.json();

    // 2. Update User with all 3 critical fields
    const user = await User.findByIdAndUpdate(
      params.id,
      {
        $set: {
          accountStatus: "fraud",
          kycStatus: "fraud", // KYC ব্লক করার জন্য
          walletFrozen: true, // লেনদেন বন্ধ করার জন্য
          fraud: {
            isFraud: true,
            reason: reason || "No reason provided",
            markedBy: session.user.email,
            markedAt: new Date(),
          },
        },
      },
      { new: true },
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "User has been marked as fraud and wallet frozen.",
      user,
    });
  } catch (error) {
    console.error("Fraud Update Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
