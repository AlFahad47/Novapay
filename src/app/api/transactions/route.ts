import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, type, amount, currency, sender, receiver, description } = body;

    if (!email || !amount) {
      return NextResponse.json({ message: "Email and Amount are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("novapay_db");
    const usersCollection = db.collection("users");

    // ১. ইউজার চেক
    const user = await usersCollection.findOne({ email });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const txAmount = Number(amount);

    // টাইপকে ক্লিন করা: ছোট হাতের করা এবং স্পেসকে আন্ডারস্কোর দিয়ে রিপ্লেস করা
    // এতে "Bill Payment" হয়ে যাবে "bill_payment"
    const normalizedType = type.toLowerCase().trim().replace(/\s+/g, '_');

    // খরচের লিস্ট যেখানে টাকা বিয়োগ হবে
    const expenseTypes = ["withdraw", "send_money", "bill_payment", "cash_out", "pay_bill","mobile_recharge"];
    
    const isExpense = expenseTypes.includes(normalizedType);

    // ২. টাকা পাঠানোর বা বিল দেওয়ার ক্ষেত্রে ব্যালেন্স চেক
    if (isExpense && (user.balance || 0) < txAmount) {
      return NextResponse.json({ message: "Insufficient balance" }, { status: 400 });
    }

    // ৩. ব্যালেন্স অ্যাডজাস্টমেন্ট (Expense হলে বিয়োগ, অন্যথায় যোগ)
    const balanceAdjustment = isExpense ? -txAmount : txAmount;

    // নতুন ট্রানজেকশন অবজেক্ট (হিস্ট্রিতে আপনার পাঠানো অরিজিনাল টাইপই থাকবে)
    const newTransaction = {
      transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
      type: type, // এখানে অরিজিনাল টাইপ রাখছি যাতে ডিসপ্লেতে সুন্দর দেখায়
      amount: txAmount,
      currency: currency || "BDT",
      status: "completed",
      sender: sender || "Wallet",
      receiver: receiver || "System",
      description,
      date: new Date()
    };

    // ৪. একসাথেই হিস্ট্রি আপডেট এবং ব্যালেন্স পরিবর্তন
    await usersCollection.updateOne(
      { email: email },
      { 
        // $position: 0 দিলে নতুন ট্রানজেকশন হিস্ট্রির সবার উপরে আসবে
        $push: { history: { $each: [newTransaction], $position: 0 } } as any,
        $inc: { balance: balanceAdjustment },
        $set: { updatedAt: new Date() }
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Transaction successful",
      transaction: newTransaction,
      updatedBalance: (user.balance || 0) + balanceAdjustment
    }, { status: 200 });

  } catch (error) {
    console.error("Transaction Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}