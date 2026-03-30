import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// POST /api/donation/donate
// Body: { userEmail, campaignId, amount }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userEmail, campaignId, amount } = body;

    // ── 1. Validation ─────────────────────────────────────────────────
    if (!userEmail || !campaignId || !amount) {
      return NextResponse.json({ message: "userEmail, campaignId, and amount are required." }, { status: 400 });
    }

    const donationAmount = Number(amount);
    if (isNaN(donationAmount) || donationAmount < 10) {
      return NextResponse.json({ message: "Minimum donation is ৳10." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("novapay_db");
    const users = db.collection("users");
    const campaigns = db.collection("campaigns");

    // ── 2. Find campaign ──────────────────────────────────────────────
    const campaign = await campaigns.findOne({ _id: new ObjectId(campaignId), active: true });
    if (!campaign) {
      return NextResponse.json({ message: "Campaign not found or is no longer active." }, { status: 404 });
    }

    // ── 3. Find user ──────────────────────────────────────────────────
    const user = await users.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // ── 4. Balance check ──────────────────────────────────────────────
    const userBalance = user.balance ?? 0;
    if (userBalance < donationAmount) {
      return NextResponse.json({ message: "Insufficient balance." }, { status: 400 });
    }

    // ── 5. Find admin (case-insensitive) ─────────────────────────────
    const admin = await users.findOne({
      role: { $regex: /^admin$/i },
    });
    if (!admin) {
      return NextResponse.json({ message: "Admin account not found." }, { status: 500 });
    }

    // ── 6. Build transaction record ───────────────────────────────────
    const transactionId = `DON_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const donationTx = {
      transactionId,
      type: "donation",
      campaignId,
      campaignTitle: campaign.title,
      amount: donationAmount,
      status: "completed",
      date: new Date(),
    };

    const adminCreditTx = {
      transactionId,
      type: "donation_received",
      campaignId,
      campaignTitle: campaign.title,
      fromEmail: userEmail,
      amount: donationAmount,
      status: "completed",
      date: new Date(),
    };

    // ── 7. Update DB atomically ───────────────────────────────────────
    await Promise.all([
      // Deduct from user balance + add to history
      users.updateOne(
        { email: userEmail },
        {
          $inc: { balance: -donationAmount },
          $push: { history: { $each: [donationTx], $position: 0 } } as any,
          $set: { updatedAt: new Date() },
        }
      ),
      // Credit admin balance + add to history
      users.updateOne(
        { role: "Admin" },
        {
          $inc: { balance: donationAmount },
          $push: { history: { $each: [adminCreditTx], $position: 0 } } as any,
          $set: { updatedAt: new Date() },
        }
      ),
      // Update campaign raised amount and donor count
      campaigns.updateOne(
        { _id: new ObjectId(campaignId) },
        {
          $inc: { raisedAmount: donationAmount, donorCount: 1 },
          $set: { updatedAt: new Date() },
        }
      ),
    ]);

    return NextResponse.json({
      success: true,
      transactionId,
      campaignTitle: campaign.title,
      amount: donationAmount,
      newBalance: parseFloat((userBalance - donationAmount).toFixed(2)),
    }, { status: 200 });

  } catch (error) {
    console.error("Donation error:", error);
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
