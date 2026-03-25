import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const client = await clientPromise;
  const db = client.db("novapay_db");
  const today = new Date();

  const dueLoans = await db.collection("loans").find({
    status: "active",
    nextInstallmentDate: { $lte: today }
  }).toArray();

  for (const loan of dueLoans) {
    const user = await db.collection("users").findOne({ _id: loan.userId });

    if (user && user.balance >= loan.monthlyInstallment) {
      // SUCCESS: Deduct from balance
      const isLastPayment = loan.remainingAmount <= loan.monthlyInstallment;
      
      await db.collection("users").updateOne(
        { _id: user._id },
        { $inc: { balance: -loan.monthlyInstallment } }
      );

      await db.collection("loans").updateOne(
        { _id: loan._id },
        { $set: { 
            remainingAmount: Math.max(0, loan.remainingAmount - loan.monthlyInstallment),
            status: isLastPayment ? "completed" : "active",
            nextInstallmentDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
          } 
        }
      );
    } else {
      // FAILURE: Default logic
      await db.collection("loans").updateOne({ _id: loan._id }, { $set: { status: "defaulted" } });
    }
  }
  return NextResponse.json({ processed: dueLoans.length });
}