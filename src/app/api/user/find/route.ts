import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("novapay_db");
    const usersCollection = db.collection("users");

    // We only fetch the fields we need for the UI to stay secure
    const user = await usersCollection.findOne(
      { email },
      { 
        projection: { 
          name: 1, 
          email: 1, 
          kycStatus: 1, 
          image: 1 // If you have profile pictures
        } 
      }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        kycStatus: user.kycStatus || "pending",
        image: user.image || null,
      },
    });
  } catch (error) {
    console.error("User lookup error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}