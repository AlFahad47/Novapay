import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// --- GET: User profile fetch korar jonno (Existing code) ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("novapay_db");
    const user = await db.collection("users").findOne({ email });

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// --- POST: Wallet Balance ebong History update korar jonno ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      email, 
      bankBalance,   // Physical Pocket balance
      wallet,        // Inflow/Outflow stats
      wallethistory, // Transaction records
      // --- New Fields for Bank Sync ---
      bankId,        // The ID of the specific bank (e.g., "8cmwzt3ij")
      amount,        // The transaction amount
      actionType,    // "add_money" or "deposit_money"
      newBank        // For linking new accounts
    } = body;

    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("novapay_db");
    const usersCollection = db.collection("users");

    // 1. Handle Linking New Bank (If newBank object exists)
    if (newBank) {
      await usersCollection.updateOne(
        { email },
        { 
          $push: { 
            linkedBanks: { 
              ...newBank, 
              id: Math.random().toString(36).substr(2, 9), 
              addedAt: new Date() 
            } 
          } as any 
        }
      );
      return NextResponse.json({ success: true, message: "Bank Linked Successfully" });
    }

    // 2. Transaction Logic for existing Banks
    const existingUser = await usersCollection.findOne({ email });
    if (!existingUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let novaPayBalance = existingUser.balance ?? 0;
    const numAmount = parseFloat(amount) || 0;
    
    // Logic to find and calculate the specific bank balance
    const targetBank = existingUser.linkedBanks?.find((b: any) => b.id === bankId);
    let finalBankBalance = targetBank ? (parseFloat(targetBank.balance) || 0) : 0;

    if (actionType === "add_money") {
      novaPayBalance += numAmount;
      finalBankBalance -= numAmount; // Subtract from Bank
    } else if (actionType === "deposit_money") {
      novaPayBalance -= numAmount;
      finalBankBalance += numAmount; // Add to Bank
    }

    // 3. Database Update with Positional Operator
    const updateQuery: any = { email: email };
    if (bankId) updateQuery["linkedBanks.id"] = bankId;

    const updatePayload: any = {
      $set: { 
        bankBalance: bankBalance,
        wallet: wallet,
        wallethistory: wallethistory,
        balance: novaPayBalance,
        updatedAt: new Date()
      }
    };

    // If we have a specific bank, update its balance inside the array
    if (bankId && targetBank) {
      updatePayload.$set["linkedBanks.$.balance"] = finalBankBalance;
    }

    const result = await usersCollection.updateOne(updateQuery, updatePayload);

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User or Bank Record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Transaction Recorded Successfully", currentNovaPayBalance: novaPayBalance });
  } catch (error) {
    console.error("Database Update Error:", error);
    return NextResponse.json({ error: "Failed to update database" }, { status: 500 });
  }
}