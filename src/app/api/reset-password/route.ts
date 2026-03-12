import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, resetToken, newPassword } = await req.json();

    if (!email || !resetToken || !newPassword) {
      return NextResponse.json({ message: "All fields are required!" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Find the user
    const user = await db.collection("users").findOne({ 
      email,
      resetToken,
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid reset token or incorrect email!" }, { status: 400 });
    }

    // Check whether token has expired
    if (user.resetTokenExpiry && new Date() > new Date(user.resetTokenExpiry)) {
      return NextResponse.json({ message: "Reset code has expired! Please try again." }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await db.collection("users").updateOne(
      { email },
      {
        $set: {
          password: hashedPassword,
        },
        $unset: {
          resetToken: "",
          resetTokenExpiry: "",
        },
      }
    );

    return NextResponse.json({ message: "Password reset successfully!" }, { status: 200 });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ message: "A server error occurred!" }, { status: 500 });
  }
}
