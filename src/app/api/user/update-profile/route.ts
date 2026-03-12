import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, email } = body;

  const client = await clientPromise;
  const db = client.db();

  await db.collection("users").updateOne(
    { email: session.user.email },
    {
      $set: {
        name,
        email,
      },
    }
  );

  return NextResponse.json({ success: true });
}