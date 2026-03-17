import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    const users = await db
      .collection("users")
      .find({
        $or: [
          { kycStatus: "fraud" },
          { accountStatus: "fraud" },
        ],
      })
      .project({
        password: 0,
      })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ users });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch fraud users" },
      { status: 500 }
    );
  }
}