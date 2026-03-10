import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const DB_NAME = "novapay_db";
const COLLECTION = "reviews";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const reviews = await db.collection(COLLECTION).find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    // Check if user already reviewed
    const existing = await db.collection(COLLECTION).findOne({ email: body.email });
    if (existing) return NextResponse.json({ error: "Already reviewed" }, { status: 400 });

    const res = await db.collection(COLLECTION).insertOne({ ...body, createdAt: new Date() });
    return NextResponse.json(res);
  } catch (error) {
    return NextResponse.json({ error: "Post failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    await db.collection(COLLECTION).updateOne({ _id: new ObjectId(id) }, { $set: updateData });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id!) });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}