import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// --- GET: User profile fetch ---
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email)
      return NextResponse.json({ error: "Email required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("novapay_db");
    const user = await db.collection("users").findOne({ email });

    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// --- PUT: Update User Profile (Settings) ---
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { email, name, image } = body;

    if (!email)
      return NextResponse.json({ error: "Email required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("novapay_db");

    await db.collection("users").updateOne(
      { email },
      {
        $set: {
          name,
          image,
          updatedAt: new Date(),
        },
      },
    );

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
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
      type,
      note,
      wallet,
      wallethistory,
      bankId,
      amount,
      actionType,
      newBank,
    } = body;

    if (!email)
      return NextResponse.json({ error: "Email required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("novapay_db");
    const usersCollection = db.collection("users");

    // 1. LIQUID CASH LOGIC (Income/Expense)
    if (type === "income" || type === "expense") {
      const numAmount = parseFloat(amount);
      const isIncome = type === "income";

      const historyItem = {
        id: Math.random().toString(36).substring(2, 11),
        type,
        amount: numAmount,
        note: note || `Cash ${type}`,
        date: new Date(),
      };

      await usersCollection.updateOne(
        { email },
        {
          $inc: {
            bankBalance: isIncome ? numAmount : -numAmount,
            "wallet.totalPhysicalIncome": isIncome ? numAmount : 0,
            "wallet.totalPhysicalExpense": isIncome ? 0 : numAmount,
          },
          $push: {
            wallethistory: {
              $each: [historyItem],
              $position: 0,
            },
          },
          $set: {
            "wallet.lastTransactionDate": new Date(),
            updatedAt: new Date(),
          },
        },
      );

      return NextResponse.json({
        success: true,
        message: "Liquid asset updated",
      });
    }

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
          $set: { updatedAt: new Date() },
        },
        { upsert: true },
      );
      return NextResponse.json({
        success: true,
        message: "Smart Goal Created Successfully!",
      });
    }

    // --- LOGIC B: Handle Linking New Bank ---
    if (newBank) {
      const maskedAccNo = `**** **** **** ${newBank.accNo.slice(-4)}`;

      const bankData = {
        id: Math.random().toString(36).substr(2, 9),
        brand: newBank.brand,
        name: newBank.name,
        accNo: maskedAccNo,
        expiry: newBank.expiry,
        balance: Math.floor(Math.random() * 25000) + 5000,
        addedAt: new Date(),
      };

      await usersCollection.updateOne(
        { email },
        { $push: { linkedBanks: bankData } as any },
      );
      return NextResponse.json({
        success: true,
        message: "Card Linked Securely",
      });
    }

    // --- 2. TRANSACTION LOGIC ---
    const existingUser = await usersCollection.findOne({ email });
    if (!existingUser)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    let novaPayBalance = existingUser.balance ?? 0;
    const numAmount = parseFloat(amount) || 0;

    const targetBank = existingUser.linkedBanks?.find(
      (b: any) => b.id === bankId,
    );
    if (!targetBank && actionType) {
      return NextResponse.json(
        { error: "Source Card not found" },
        { status: 404 },
      );
    }

    let finalBankBalance = targetBank ? parseFloat(targetBank.balance) || 0 : 0;

    if (actionType === "add_money") {
      if (finalBankBalance < numAmount)
        return NextResponse.json(
          { error: "Insufficient Bank Balance" },
          { status: 400 },
        );
      novaPayBalance += numAmount;
      finalBankBalance -= numAmount;
    } else if (actionType === "deposit_money") {
      if (novaPayBalance < numAmount)
        return NextResponse.json(
          { error: "Insufficient NovaPay Balance" },
          { status: 400 },
        );
      novaPayBalance -= numAmount;
      finalBankBalance += numAmount;
    }

    const updateQuery: any = { email: email };
    if (bankId) updateQuery["linkedBanks.id"] = bankId;

    const updatePayload: any = {
      $set: {
        balance: novaPayBalance,
        updatedAt: new Date(),
      },
    };

    if (bankId && targetBank) {
      updatePayload.$set["linkedBanks.$.balance"] = finalBankBalance;
    }

    await usersCollection.updateOne(updateQuery, updatePayload);

    return NextResponse.json({
      success: true,
      currentNovaPayBalance: novaPayBalance,
    });
  } catch (error: any) {
    console.error("Database Update Error:", error);
    return NextResponse.json(
      {
        error: "Failed to update database",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
