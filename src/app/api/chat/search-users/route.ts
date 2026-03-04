import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ users: [] });
  }

  const client = await clientPromise;
  const db = client.db("novapay_db");

  // Case-insensitive search on name or email
  const users = await db.collection("users").find(
    {
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    },
    { projection: { _id: 1, name: 1, email: 1, image: 1 } }
  ).limit(10).toArray();

  return NextResponse.json({
    users: users.map((u) => ({
      _id: u._id.toString(),
      name: u.name,
      email: u.email,
      image: u.image ?? null,
    })),
  });
}
