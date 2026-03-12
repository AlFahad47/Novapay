import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    const usersCollection = db.collection("users");

    // get only approved / accepted users
    const users = await usersCollection
      .find({
        kycStatus: { $in: ["approved", "Accepted"] },
      })
      .project({
        password: 0, // hide password
      })
      .toArray();

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Users fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}