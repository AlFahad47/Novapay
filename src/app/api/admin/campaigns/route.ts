import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// POST /api/admin/campaigns — create a new campaign
// PATCH /api/admin/campaigns — toggle active/inactive
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminEmail, title, description, image, goalAmount } = body;

    if (!adminEmail || !title || !goalAmount) {
      return NextResponse.json({ message: "adminEmail, title, and goalAmount are required." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("novapay_db");
    const users = db.collection("users");

    // Verify admin
    const admin = await users.findOne({ email: adminEmail, role: { $regex: /^admin$/i } });
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized. Admin only." }, { status: 403 });
    }

    const campaigns = db.collection("campaigns");

    const newCampaign = {
      title,
      description: description || "",
      image: image || "",
      goalAmount: Number(goalAmount),
      raisedAmount: 0,
      donorCount: 0,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await campaigns.insertOne(newCampaign);

    return NextResponse.json({
      success: true,
      campaignId: result.insertedId,
      campaign: newCampaign,
    }, { status: 201 });

  } catch (error) {
    console.error("Create campaign error:", error);
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}

// PATCH — toggle campaign active status
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { adminEmail, campaignId, active } = body;

    if (!adminEmail || !campaignId || active === undefined) {
      return NextResponse.json({ message: "adminEmail, campaignId, and active are required." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("novapay_db");
    const users = db.collection("users");

    const admin = await users.findOne({ email: adminEmail, role: { $regex: /^admin$/i } });
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized. Admin only." }, { status: 403 });
    }

    const campaigns = db.collection("campaigns");
    await campaigns.updateOne(
      { _id: new ObjectId(campaignId) },
      { $set: { active, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Update campaign error:", error);
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
