import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, type, amount, currency, sender, receiver, description, requestId } = body;

    // basic validation
    if (!email || !amount) {
      return NextResponse.json({ message: "Email and Amount are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("novapay_db");
    const usersCollection = db.collection("users");

    // sender check
    const user = await usersCollection.findOne({ email });
    if (!user) return NextResponse.json({ message: "Sender user not found" }, { status: 404 });

    const txAmount = Number(amount);
    const normalizedType = type.toLowerCase().trim().replace(/\s+/g, '_');
    const EXCHANGE_RATE = 120; // ১ ডলার = ১২০ টাকা ধরে

    // expense checking
    const expenseTypes = ["cashout", "send_money", "bill_payment", "pay_bill", "mobile_recharge"];
    const isExpense = expenseTypes.includes(normalizedType);

    // balance checking
    if (isExpense && (user.balance || 0) < txAmount) {
      return NextResponse.json({ message: "Insufficient balance" }, { status: 400 });
    }

    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // ---------------------------------------------------------
    // Recipient & KYC Check Logic
    // ---------------------------------------------------------
    let recipientUser = null;

// ক্যাশ আউট বাদে অন্য সব ক্ষেত্রে রিসিভার চেক করবে
if (receiver) {
 if (
        normalizedType === "cashout" || 
        normalizedType === "cash_out" || 
        normalizedType === "mobile_recharge" ||
        normalizedType === "bill_payment" 
        
      ) {
        // ক্যাশ আউট বা মোবাইল রিচার্জ হলে ডাটাবেসে ইউজার খোঁজার দরকার নেই
        console.log(`${normalizedType} to:`, receiver);
      } else {
    // বাকি সব ফিচারের (Send Money, Request Money ইত্যাদি) জন্য ইউজার চেক করবে
    recipientUser = await usersCollection.findOne({ email: receiver });
    
    if (!recipientUser) {
      return NextResponse.json({ message: "Recipient user not found" }, { status: 404 });
    }

    if (recipientUser.kycStatus !== "approved") {
      return NextResponse.json({ 
        message: "Recipient is not KYC verified. Money cannot be sent/requested." 
      }, { status: 403 });
    }
  }
}

    // cashout logic
if (normalizedType === "cashout") {
  // ১. ইনপুট ভ্যালিডেশন: এজেন্ট নাম্বার পাঠানো হয়েছে কিনা চেক করা
  if (!receiver) {
    return NextResponse.json({ message: "Agent number/Phone is required" }, { status: 400 });
  }

  const senderTx = {
    transactionId,
    type: "Cash Out",
    amount: txAmount,
    currency: user.currency || "BDT",
    receiver: receiver, // ইউজার ফর্ম থেকে যে নাম্বার দিবে সেটাই এখানে সেভ হবে
    description: description || `Cash out to agent: ${receiver}`,
    status: "completed",
    date: new Date()
  };

  await usersCollection.updateOne(
    { email: email },
    { 
      $inc: { balance: -txAmount },
      // $each এবং $position: 0 ব্যবহার করলে লেটেস্ট ট্রানজেকশন সবার উপরে থাকবে
      $push: { history: { $each: [senderTx], $position: 0 } } as any,
      $set: { updatedAt: new Date() }
    }
  );
  
  return NextResponse.json({ 
    success: true, 
    message: `Cash out successful to ${receiver}`, 
    transactionId 
  }, { status: 200 });
}

    // ---------------------------------------------------------
    // SEND MONEY LOGIC (With Currency Conversion)
    // ---------------------------------------------------------
    if (normalizedType === "send_money") {
      if (!receiver) return NextResponse.json({ message: "Recipient email is required" }, { status: 400 });
      if (email === receiver) return NextResponse.json({ message: "Cannot send money to yourself" }, { status: 400 });

      

      // **কারেন্সি লজিক ইমপ্লিমেন্টেশন**
      const senderCurrency = user.currency || "BDT";
      const receiverCurrency = recipientUser.currency || "BDT";
      let receiverFinalAmount = txAmount;

      // এক্সচেঞ্জ রেট ক্যালকুলেশন
      if (senderCurrency === "USD" && receiverCurrency === "BDT") {
        receiverFinalAmount = txAmount * EXCHANGE_RATE;
      } else if (senderCurrency === "BDT" && receiverCurrency === "USD") {
        receiverFinalAmount = txAmount / EXCHANGE_RATE;
      }

      const senderTx = {
        transactionId,
        type: "Send Money",
        amount: txAmount,
        currency: senderCurrency,
        receiver: receiver,
        description: description || `Sent money to ${receiver}`,
        status: "completed",
        date: new Date()
      };

      const receiverTx = {
        transactionId,
        type: "Receive Money",
        amount: Number(receiverFinalAmount.toFixed(2)), // ২ দশমিক ঘর পর্যন্ত
        currency: receiverCurrency,
        sender: email,
        description: description || `Received money from ${email}`,
        status: "completed",
        date: new Date()
      };

      // Update Sender (ব্যালেন্স কমবে সেন্ডার কারেন্সিতে)
      await usersCollection.updateOne(
        { email: email },
        { 
          $inc: { balance: -txAmount },
          $push: { history: { $each: [senderTx], $position: 0 } } as any,
          $set: { updatedAt: new Date() }
        }
      );

      // Update Receiver (ব্যালেন্স বাড়বে রিসিভার কারেন্সিতে)
      await usersCollection.updateOne(
        { email: receiver },
        { 
          $inc: { balance: Number(receiverFinalAmount.toFixed(2)) },
          $push: { history: { $each: [receiverTx], $position: 0 } } as any,
          $set: { updatedAt: new Date() }
        }
      );

      if (requestId) {
        try {
          await db.collection("notifications").deleteOne({ _id: new ObjectId(requestId) });
        } catch (err) {
          console.error("Failed to delete notification:", err);
        }
      }

      return NextResponse.json({ success: true, message: "Money sent successfully", transactionId }, { status: 200 });
    } 


    // add_money_self logic
// ---------------------------------------------------------
// ---------------------------------------------------------
if (normalizedType === "add_money_self") {
  // 1. Basic Input Validation
  if (!body.bankNumber || !txAmount) {
    return NextResponse.json({ message: "Bank Number and Amount are required" }, { status: 400 });
  }

  // 2. Bank Balance Validation (Using bankBalance field from your DB)
  const currentBankBalance = user.bankBalance || 0;
  if (currentBankBalance < txAmount) {
    return NextResponse.json({ 
      message: `Insufficient bank balance. Your current bank balance is: ${currentBankBalance}` 
    }, { status: 400 });
  }

  const transactionId = `ADD_SELF_${Date.now()}`;
  const addTx = {
    transactionId,
    type: "Add Money (Bank)",
    amount: txAmount,
    currency: user.currency || "BDT",
    sender: body.bankNumber, // The bank account number provided in the form
    receiver: email,
    description: `Added money from Bank A/C: ${body.bankNumber}`,
    status: "completed",
    date: new Date()
  };

  // 3. Database Update: Atomic transaction to decrease bank and increase wallet
  await usersCollection.updateOne(
    { email: email },
    { 
      $inc: { 
        balance: txAmount,        // Wallet balance increases
        bankBalance: -txAmount    // Bank balance decreases
      },
      // $each and $position: 0 ensures the latest transaction stays at the top
      $push: { history: { $each: [addTx], $position: 0 } } as any,
      $set: { updatedAt: new Date() }
    }
  );

  return NextResponse.json({ 
    success: true, 
    message: `Successfully added ${txAmount} from your bank to your wallet.`,
    transactionId 
  }, { status: 200 });
}

// ---------------------------------------------------------


    // ---------------------------------------------------------
    // (Deposit, Bill etc.) - Other Logic Remains Same
    // ---------------------------------------------------------
    else {
      const balanceAdjustment = isExpense ? -txAmount : txAmount;
      const currentCurrency = currency || user.currency || "BDT";

      const newTransaction = {
        transactionId,
        type: type,
        amount: txAmount,
        currency: currentCurrency,
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