import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

/**
 * GET
 * Return ALL users for admin panel
 */
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("novapay_db");

    const users = await db
      .collection("users")
      .find({})
      .project({
        _id: 0,
        name: 1,
        email: 1,
        role: 1,
        kycStatus: 1,
        kycDetails: 1,
      })
      .toArray();

    // 🔥 Normalize country field
    const formattedUsers = users.map((user) => ({
      name: user.name || "No Name",
      email: user.email,
      role: user.role || "User",
      kycStatus: user.kycStatus || "N/A",
      country: user.kycDetails?.country || "N/A",
    }));

    return NextResponse.json(formattedUsers, { status: 200 });
  } catch (error) {
    console.error("GET KYC Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

/**
 * PATCH
 * Update user KYC status
 */
export async function PATCH(request: Request) {
  try {
    const { email, status } = await request.json();

    if (!email || !status) {
      return NextResponse.json(
        { message: "Email and status required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("novapay_db");

    const result = await db.collection("users").updateOne(
      { email },
      {
        $set: {
          kycStatus: status,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "KYC status updated" },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH KYC Error:", error);
    return NextResponse.json(
      { message: "Failed to update KYC" },
      { status: 500 }
    );
  }
}