import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

/**
 * GET: Fetch the full user profile using email as a unique identifier.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) return NextResponse.json({ message: "Email is required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("novapay_db");
    const user = await db.collection("users").findOne({ email });

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST: Update KYC details and ensure financial fields are initialized.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, role, currency, bank, bankBalance, ...kycData } = body;

    if (!email) return NextResponse.json({ message: "Email is required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("novapay_db"); 
    const usersCollection = db.collection("users");

    // Fetch existing user to check current data
    const existingUser = await usersCollection.findOne({ email });
    
    // updatePayload will update profile info and ensure fields exist
    const updatePayload: any = {
      $set: { 
        role: role || existingUser?.role || "User",
        currency: currency || existingUser?.currency || "BDT",
        bank: bank || existingUser?.bank || "Not Linked",
        bankBalance: bankBalance !== undefined ? bankBalance : (existingUser?.bankBalance ?? 0),
        kycStatus: existingUser?.kycStatus || "pending", 
        kycDetails: {
          ...kycData, 
        },

        // Loyalty System
        points: existingUser?.points ?? existingUser?.points ?? 0,
    rank: existingUser?.rank ?? "Bronze",
    pointsHistory: existingUser?.pointsHistory ?? [],

    
        // If these fields are missing in the database, set defaults. 
        // If they exist, keep the original values (existingUser?.field)
        balance: existingUser?.balance ?? 0,
        history: existingUser?.history ?? [],
        wallet: existingUser?.wallet ?? {
          totalIncome: 0,
          totalExpense: 0,
          status: "active"
        },
        microsaving: existingUser?.microsaving ?? {
          savingsBalance: 0,
          goals: []
        },
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };

    // Use updateOne with upsert: true
    const result = await usersCollection.updateOne(
      { email: email }, 
      updatePayload,
      { upsert: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Profile updated and financial fields ensured." 
    }, { status: 200 });

  } catch (error) {
    console.error("POST KYC Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}