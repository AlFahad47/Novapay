// import { NextResponse } from "next/server";
// import clientPromise from "@/lib/mongodb";

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const { email, type, amount, note } = body;

//     if (!email || !amount || !type) {
//       return NextResponse.json({ message: "Data missing" }, { status: 400 });
//     }

//     const client = await clientPromise;
//     const db = client.db("novapay_db");
//     const numAmount = Number(amount);

//     // Transaction History Object
//     const newTransaction = {
//       id: crypto.randomUUID(),
//       type, // 'income' or 'expense'
//       amount: numAmount,
//       note: note || (type === 'income' ? "Cash In" : "Cash Out"),
//       date: new Date(),
//     };

//     // Database Atomic Update
//     const updateOps: any = {
//       $push: { wallethistory: { $each: [newTransaction], $position: 0 } },
//       $set: { "wallet.lastTransactionDate": new Date(), updatedAt: new Date() }
//     };

//     if (type === "income") {
//       updateOps.$inc = {
//         bankBalance: numAmount,
//         "wallet.totalPhysicalIncome": numAmount
//       };
//     } else {
//       updateOps.$inc = {
//         bankBalance: -numAmount,
//         "wallet.totalPhysicalExpense": numAmount
//       };
//     }

//     const result = await db.collection("users").updateOne({ email }, updateOps);

//     return NextResponse.json({ success: true, message: "Balance updated" });
//   } catch (error) {
//     return NextResponse.json({ message: "Server Error" }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, type, amount, note } = body;

    // 1. Basic Validation
    if (!email || !amount || !type) {
      return NextResponse.json({ message: "Data missing" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("novapay_db");
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
    }

    // 2. Fetch User for Balance Check (Crucial for Expenses)
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (type === "expense" && user.bankBalance < numAmount) {
      return NextResponse.json(
        { message: "Insufficient balance" },
        { status: 400 },
      );
    }

    // 3. Create Transaction History Object
    const newTransaction = {
      id: crypto.randomUUID(),
      type, // 'income' or 'expense'
      amount: numAmount,
      note: note || (type === "income" ? "Cash In" : "Cash Out"),
      date: new Date(),
    };

    // 4. Database Atomic Update
    const updateOps: any = {
      $push: {
        wallethistory: {
          $each: [newTransaction],
          $position: 0, // Adds new transaction to the top of the list
        },
      },
      $set: {
        "wallet.lastTransactionDate": new Date(),
        updatedAt: new Date(),
      },
    };

    if (type === "income") {
      updateOps.$inc = {
        bankBalance: numAmount,
        "wallet.totalPhysicalIncome": numAmount,
      };
    } else {
      updateOps.$inc = {
        bankBalance: -numAmount,
        "wallet.totalPhysicalExpense": numAmount,
      };
    }

    // 5. Execute Update
    const result = await db.collection("users").updateOne({ email }, updateOps);

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "Failed to update wallet" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Balance updated: ${type === "income" ? "Received" : "Spent"} ${numAmount}`,
    });
  } catch (error: any) {
    console.error("TRANSACTION_POST_ERROR:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
