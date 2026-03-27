import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    const usersCollection = db.collection("users");

    // ✅ Match ANY verified condition dynamically
    const users = await usersCollection
      .find({
        $or: [
          {
            "kycDetails.kycStatus": {
              $in: ["approved", "accepted", "Approved", "Accepted"],
            },
          },
          {
            kycStatus: {
              $in: ["approved", "accepted", "Approved", "Accepted"],
            },
          },
          {
            status: {
              $in: ["approved", "accepted", "Approved", "Accepted"],
            },
          },
        ],
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
      { status: 500 },
    );
  }
}
