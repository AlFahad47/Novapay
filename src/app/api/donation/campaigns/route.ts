import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// GET /api/donation/campaigns — returns all active campaigns
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("novapay_db");
    const campaigns = db.collection("campaigns");

    const activeCampaigns = await campaigns
      .find({ active: true })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(activeCampaigns, { status: 200 });
  } catch (error) {
    console.error("Fetch campaigns error:", error);
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
