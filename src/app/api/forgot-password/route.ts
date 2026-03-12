import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required!" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Check whether the user exists
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "No account found with this email!" }, { status: 404 });
    }

    // Password reset is not applicable for users signed in via Google
    if (user.provider === "google") {
      return NextResponse.json({ message: "You signed in with Google, so password reset is not required!" }, { status: 400 });
    }

    // Generate random 6-digit reset token
    const resetToken = crypto.randomInt(100000, 999999).toString();
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // Valid for 15 minutes

    // Save token to database
    await db.collection("users").updateOne(
      { email },
      {
        $set: {
          resetToken,
          resetTokenExpiry,
        },
      }
    );

    // NOTE: Email sending logic should be here; in development we only return the token
    // In production, use Nodemailer/SendGrid/Resend to send the email
    
    return NextResponse.json({ 
      message: "Password reset code sent! (Development Mode: Check Console)", 
      resetToken // For development display only
    }, { status: 200 });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ message: "A server error occurred!" }, { status: 500 });
  }
}
