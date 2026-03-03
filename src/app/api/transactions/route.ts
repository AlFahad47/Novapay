import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, type, amount, currency, sender, receiver, description, requestId } = body;

    // basic
    if (!email || !amount) {
      return NextResponse.json({ message: "Email and Amount are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("novapay_db");
    const usersCollection = db.collection("users");

    // sender
    const user = await usersCollection.findOne({ email });
    if (!user) return NextResponse.json({ message: "Sender user not found" }, { status: 404 });

    const txAmount = Number(amount);
    const normalizedType = type.toLowerCase().trim().replace(/\s+/g, '_');

    // expense
    const expenseTypes = ["withdraw", "send_money", "bill_payment", "cash_out", "pay_bill", "mobile_recharge"];
    const isExpense = expenseTypes.includes(normalizedType);

    // balance
    if (isExpense && (user.balance || 0) < txAmount) {
      return NextResponse.json({ message: "Insufficient balance" }, { status: 400 });
    }

    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // ---------------------------------------------------------
    //
    // ---------------------------------------------------------
    let recipientUser = null;
    if (receiver) {
      recipientUser = await usersCollection.findOne({ email: receiver });
      
      if (!recipientUser) {
        return NextResponse.json({ message: "Recipient user not found" }, { status: 404 });
      }

      // **KYC check**
      if (recipientUser.kycStatus !== "approved") {
        return NextResponse.json({ 
          message: "Recipient is not KYC verified. Money cannot be sent/requested." 
        }, { status: 403 });
      }
    }

    // ---------------------------------------------------------
    // SEND MONEY LOGIC
    // ---------------------------------------------------------
    if (normalizedType === "send_money") {
      if (!receiver) return NextResponse.json({ message: "Recipient email is required" }, { status: 400 });
      if (email === receiver) return NextResponse.json({ message: "Cannot send money to yourself" }, { status: 400 });

      // Transactions Histories
      const senderTx = {
        transactionId,
        type: "Send Money",
        amount: txAmount,
        currency: currency || "BDT",
        receiver: receiver,
        description: description || `Sent money to ${receiver}`,
        status: "completed",
        date: new Date()
      };

      const receiverTx = {
        transactionId,
        type: "Receive Money",
        amount: txAmount,
        currency: currency || "BDT",
        sender: email,
        description: description || `Received money from ${email}`,
        status: "completed",
        date: new Date()
      };

      // Update Sender
      await usersCollection.updateOne(
        { email: email },
        { 
          $inc: { balance: -txAmount },
          $push: { history: { $each: [senderTx], $position: 0 } } as any,
          $set: { updatedAt: new Date() }
        }
      );

      // Update Receiver
      await usersCollection.updateOne(
        { email: receiver },
        { 
          $inc: { balance: txAmount },
          $push: { history: { $each: [receiverTx], $position: 0 } } as any,
          $set: { updatedAt: new Date() }
        }
      );

      //  (Request Money এর ক্ষেত্রে)
      if (requestId) {
        try {
          await db.collection("notifications").deleteOne({
            _id: new ObjectId(requestId)
          });
        } catch (err) {
          console.error("Failed to delete notification:", err);
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: "Money sent successfully", 
        transactionId 
      }, { status: 200 });
    } 

    // ---------------------------------------------------------
    //  (Deposit, Bill etc.)
    // ---------------------------------------------------------
    else {
      const balanceAdjustment = isExpense ? -txAmount : txAmount;

      const newTransaction = {
        transactionId,
        type: type,
        amount: txAmount,
        currency: currency || "BDT",
        status: "completed",
        sender: sender || "Wallet",
        receiver: receiver || "System",
        description: description || `${type} transaction`,
        date: new Date()
      };

      await usersCollection.updateOne(
        { email: email },
        { 
          $inc: { balance: balanceAdjustment },
          $push: { history: { $each: [newTransaction], $position: 0 } } as any,
          $set: { updatedAt: new Date() }
        }
      );

      return NextResponse.json({ 
        success: true, 
        message: "Transaction successful",
        updatedBalance: (user.balance || 0) + balanceAdjustment,
        transactionId
      }, { status: 200 });
    }

  } catch (error) {
    console.error("Transaction Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}