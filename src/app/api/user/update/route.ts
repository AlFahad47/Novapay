import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// --- GET: User profile fetch ---
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

// --- POST: Wallet Balance, Goals and History update ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      email, 
      newGoal,
      bankBalance,
      wallet,
      wallethistory,
      bankId,
      amount,
      actionType,
      newBank 
    } = body;

    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("novapay_db");
    const usersCollection = db.collection("users");

    // --- LOGIC A: New Microsaving Goal Add ---
    if (newGoal) {
      const goalWithId = {
        ...newGoal,
        id: Math.random().toString(36).substring(2, 11),
        createdAt: new Date(),
        savingsBalance: 0, 
      };

      await usersCollection.updateOne(
        { email },
        { 
          // @ts-ignore
          $push: { microsaving: goalWithId },
          $set: { updatedAt: new Date() }
        },
        { upsert: true }
      );
      return NextResponse.json({ success: true, message: "Smart Goal Created Successfully!" });
    }

    // --- LOGIC B: Handle Linking New Bank ---
    if (newBank) {
      await usersCollection.updateOne(
        { email },
        { 
          // @ts-ignore
          $push: { 
            linkedBanks: { 
              ...newBank, 
              id: Math.random().toString(36).substring(2, 11), 
              addedAt: new Date() 
            } 
          } 
        }
      );
      return NextResponse.json({ success: true, message: "Bank Linked Successfully" });
    }

    // --- LOGIC C: Transaction Logic for existing User ---
    const existingUser = await usersCollection.findOne({ email });
    if (!existingUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let novaPayBalance = existingUser.balance ?? 0;
    const numAmount = parseFloat(amount) || 0;
    
    const targetBank = existingUser.linkedBanks?.find((b: any) => b.id === bankId);
    let finalBankBalance = targetBank ? (parseFloat(targetBank.balance) || 0) : 0;

    if (actionType === "add_money") {
      novaPayBalance += numAmount;
      finalBankBalance -= numAmount;
    } else if (actionType === "deposit_money") {
      novaPayBalance -= numAmount;
      finalBankBalance += numAmount;
    }

    // Database Update
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

    // Correctly handle the nested array update
    if (bankId && targetBank) {
      updatePayload.$set["linkedBanks.$.balance"] = finalBankBalance;
    }

    const result = await usersCollection.updateOne(updateQuery, updatePayload);

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User or Bank Record not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Transaction Recorded Successfully", 
      currentNovaPayBalance: novaPayBalance 
    });

  } catch (error: any) {
    console.error("Database Update Error:", error);
    return NextResponse.json({ 
      error: "Failed to update database", 
      details: error.message 
    }, { status: 500 });
  }
}