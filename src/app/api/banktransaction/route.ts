import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      email, 
      bankId,      // The ID of the specific bank selected
      amount,      // The amount to move
      actionType   // "add_money" (Bank -> NovaPay) or "deposit_money" (NovaPay -> Bank)
    } = body;

    if (!email || !bankId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("novapay_db");
    const usersCollection = db.collection("users");

    // 1. Fetch user to validate current balances
    const user = await usersCollection.findOne({ email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const numAmount = parseFloat(amount);
    const currentNovaPayBalance = user.balance || 0;
    
    // Find the specific bank from the user's linkedBanks array
    const targetBank = user.linkedBanks.find((b: any) => b.id === bankId);
    if (!targetBank) return NextResponse.json({ error: "Bank account not found" }, { status: 404 });

    let newNovaPayBalance = currentNovaPayBalance;
    let newBankBalance = targetBank.balance || 0;

    // 2. Perform Transaction Logic
    if (actionType === "add_money") {
      // Move from Bank to NovaPay
      if (newBankBalance < numAmount) {
        return NextResponse.json({ error: "Insufficient bank funds" }, { status: 400 });
      }
      newNovaPayBalance += numAmount;
      newBankBalance -= numAmount;
    } else if (actionType === "deposit_money") {
      // Move from NovaPay to Bank
      if (currentNovaPayBalance < numAmount) {
        return NextResponse.json({ error: "Insufficient NovaPay vault funds" }, { status: 400 });
      }
      newNovaPayBalance -= numAmount;
      newBankBalance += numAmount;
    } else {
      return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }

    // 3. Update Database using array filters to target the specific bank
    const result = await usersCollection.updateOne(
      { email: email, "linkedBanks.id": bankId },
      { 
        $set: { 
          balance: newNovaPayBalance,
          "linkedBanks.$.balance": newBankBalance,
          updatedAt: new Date()
        },
        $push: {
          wallethistory: {
            id: Math.random().toString(36).substr(2, 9),
            type: actionType,
            amount: numAmount,
            bankName: targetBank.name,
            date: new Date()
          }
        } as any
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Balances synced successfully",
      newNovaPayBalance,
      newBankBalance 
    });

  } catch (error) {
    console.error("Transaction Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}