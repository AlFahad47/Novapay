import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  // Only logged-in users can fetch user info
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Read userId from URL: /api/chat/user-info?userId=abc123
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("novapay_db");

  // Find user by their MongoDB _id
  const user = await db.collection("users").findOne(
    { _id: new ObjectId(userId) },
    { projection: { name: 1, email: 1, image: 1 } } // only return name, email, image — not password etc.
  );

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      name: user.name,
      email: user.email,
      image: user.image ?? null,
    },
  });
}
