// import { NextResponse } from "next/server";
// import clientPromise from "@/lib/mongodb";
// import { ObjectId } from "mongodb";

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const { email, type, amount, currency, sender, receiver, description, requestId } = body;

//     // basic validation
//     if (!email || !amount) {
//       return NextResponse.json({ message: "Email and Amount are required" }, { status: 400 });
//     }

//     const client = await clientPromise;
//     const db = client.db("novapay_db");
//     const usersCollection = db.collection("users");

//     // sender check
//     const user = await usersCollection.findOne({ email });
//     if (!user) return NextResponse.json({ message: "Sender user not found" }, { status: 404 });

//     const txAmount = Number(amount);
//     const normalizedType = type.toLowerCase().trim().replace(/\s+/g, '_');
//     const EXCHANGE_RATE = 120; // ১ ডলার = ১২০ টাকা ধরে

//     // expense checking
//     const expenseTypes = ["cashout", "send_money", "bill_payment", "pay_bill", "mobile_recharge"];
//     const isExpense = expenseTypes.includes(normalizedType);

//     // balance checking
//     if (isExpense && (user.balance || 0) < txAmount) {
//       return NextResponse.json({ message: "Insufficient balance" }, { status: 400 });
//     }

//     const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

//     // ---------------------------------------------------------
//     // Recipient & KYC Check Logic
//     // ---------------------------------------------------------
//     let recipientUser = null;

// //
// if (receiver) {
//  if (
//         normalizedType === "cashout" ||
//         normalizedType === "cash_out" ||
//         normalizedType === "mobile_recharge" ||
//         normalizedType === "bill_payment"

//       ) {

//         console.log(`${normalizedType} to:`, receiver);
//       } else {

//     recipientUser = await usersCollection.findOne({ email: receiver });

//     if (!recipientUser) {
//       return NextResponse.json({ message: "Recipient user not found" }, { status: 404 });
//     }

//     if (recipientUser.kycStatus !== "approved") {
//       return NextResponse.json({
//         message: "Recipient is not KYC verified. Money cannot be sent/requested."
//       }, { status: 403 });
//     }
//   }
// }

//     // cashout logic
// if (normalizedType === "cashout") {

//   if (!receiver) {
//     return NextResponse.json({ message: "Agent number/Phone is required" }, { status: 400 });
//   }

//   const senderTx = {
//     transactionId,
//     type: "Cash Out",
//     amount: txAmount,
//     currency: user.currency || "BDT",
//     receiver: receiver,
//     description: description || `Cash out to agent: ${receiver}`,
//     status: "completed",
//     date: new Date()
//   };

//   await usersCollection.updateOne(
//     { email: email },
//     {
//       $inc: { balance: -txAmount },

//       $push: { history: { $each: [senderTx], $position: 0 } } as any,
//       $set: { updatedAt: new Date() }
//     }
//   );

//   return NextResponse.json({
//     success: true,
//     message: `Cash out successful to ${receiver}`,
//     transactionId
//   }, { status: 200 });
// }

//     // ---------------------------------------------------------
//     // SEND MONEY LOGIC (With Currency Conversion)
//     // ---------------------------------------------------------
//     if (normalizedType === "send_money") {
//       if (!receiver) return NextResponse.json({ message: "Recipient email is required" }, { status: 400 });
//       if (email === receiver) return NextResponse.json({ message: "Cannot send money to yourself" }, { status: 400 });

//       const senderCurrency = user.currency || "BDT";
//       const receiverCurrency = recipientUser.currency || "BDT";
//       let receiverFinalAmount = txAmount;

//       if (senderCurrency === "USD" && receiverCurrency === "BDT") {
//         receiverFinalAmount = txAmount * EXCHANGE_RATE;
//       } else if (senderCurrency === "BDT" && receiverCurrency === "USD") {
//         receiverFinalAmount = txAmount / EXCHANGE_RATE;
//       }

//       const senderTx = {
//         transactionId,
//         type: "Send Money",
//         amount: txAmount,
//         currency: senderCurrency,
//         receiver: receiver,
//         description: description || `Sent money to ${receiver}`,
//         status: "completed",
//         date: new Date()
//       };

//       const receiverTx = {
//         transactionId,
//         type: "Receive Money",
//         amount: Number(receiverFinalAmount.toFixed(2)),
//         currency: receiverCurrency,
//         sender: email,
//         description: description || `Received money from ${email}`,
//         status: "completed",
//         date: new Date()
//       };

//       await usersCollection.updateOne(
//         { email: email },
//         {
//           $inc: { balance: -txAmount },
//           $push: { history: { $each: [senderTx], $position: 0 } } as any,
//           $set: { updatedAt: new Date() }
//         }
//       );

//       await usersCollection.updateOne(
//         { email: receiver },
//         {
//           $inc: { balance: Number(receiverFinalAmount.toFixed(2)) },
//           $push: { history: { $each: [receiverTx], $position: 0 } } as any,
//           $set: { updatedAt: new Date() }
//         }
//       );

//       if (requestId) {
//         try {
//           await db.collection("notifications").deleteOne({ _id: new ObjectId(requestId) });
//         } catch (err) {
//           console.error("Failed to delete notification:", err);
//         }
//       }

//       return NextResponse.json({ success: true, message: "Money sent successfully", transactionId }, { status: 200 });
//     }

//     // add_money_self logic
// // ---------------------------------------------------------
// // ---------------------------------------------------------
// if (normalizedType === "add_money_self") {
//   // 1. Basic Input Validation
//   if (!body.bankNumber || !txAmount) {
//     return NextResponse.json({ message: "Bank Number and Amount are required" }, { status: 400 });
//   }

//   // 2. Bank Balance Validation (Using bankBalance field from your DB)
//   const currentBankBalance = user.bankBalance || 0;
//   if (currentBankBalance < txAmount) {
//     return NextResponse.json({
//       message: `Insufficient bank balance. Your current bank balance is: ${currentBankBalance}`
//     }, { status: 400 });
//   }

//   const transactionId = `ADD_SELF_${Date.now()}`;
//   const addTx = {
//     transactionId,
//     type: "Add Money (Bank)",
//     amount: txAmount,
//     currency: user.currency || "BDT",
//     sender: body.bankNumber, // The bank account number provided in the form
//     receiver: email,
//     description: `Added money from Bank A/C: ${body.bankNumber}`,
//     status: "completed",
//     date: new Date()
//   };

//   // 3. Database Update: Atomic transaction to decrease bank and increase wallet
//   await usersCollection.updateOne(
//     { email: email },
//     {
//       $inc: {
//         balance: txAmount,        // Wallet balance increases
//         bankBalance: -txAmount    // Bank balance decreases
//       },
//       // $each and $position: 0 ensures the latest transaction stays at the top
//       $push: { history: { $each: [addTx], $position: 0 } } as any,
//       $set: { updatedAt: new Date() }
//     }
//   );

//   return NextResponse.json({
//     success: true,
//     message: `Successfully added ${txAmount} from your bank to your wallet.`,
//     transactionId
//   }, { status: 200 });
// }

// // ---------------------------------------------------------

//     // ---------------------------------------------------------
//     // (Deposit, Bill etc.) - Other Logic Remains Same
//     // ---------------------------------------------------------
//     else {
//       const balanceAdjustment = isExpense ? -txAmount : txAmount;
//       const currentCurrency = currency || user.currency || "BDT";

//       const newTransaction = {
//         transactionId,
//         type: type,
//         amount: txAmount,
//         currency: currentCurrency,
//         status: "completed",
//         sender: sender || "Wallet",
//         receiver: receiver || "System",
//         description: description || `${type} transaction`,
//         date: new Date()
//       };

//       await usersCollection.updateOne(
//         { email: email },
//         {
//           $inc: { balance: balanceAdjustment },
//           $push: { history: { $each: [newTransaction], $position: 0 } } as any,
//           $set: { updatedAt: new Date() }
//         }
//       );

//       return NextResponse.json({
//         success: true,
//         message: "Transaction successful",
//         updatedBalance: (user.balance || 0) + balanceAdjustment,
//         transactionId
//       }, { status: 200 });
//     }

//   } catch (error) {
//     console.error("Transaction Error:", error);
//     return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      type,
      amount,
      currency,
      sender,
      receiver,
      description,
      requestId,
      goalId, 
    } = body;

    // 1. Basic validation
    if (!email || !amount) {
      return NextResponse.json(
        { message: "Email and Amount are required" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("novapay_db");
    const usersCollection = db.collection("users");

    // 2. Sender Check
    const user = await usersCollection.findOne({ email });
    if (!user)
      return NextResponse.json(
        { message: "Sender user not found" },
        { status: 404 },
      );

    // 🔴 FRAUD CHECK LOGIC 🔴
    // যদি ইউজারের একাউন্ট স্ট্যাটাস 'fraud' হয়, তবে ট্রানজেকশন ব্লক হবে।
    if (user.accountStatus === "fraud") {
      return NextResponse.json(
        { message: "Account blocked due to fraud activity." },
        { status: 403 },
      );
    }

    const txAmount = Number(amount);
    const finalAmount = txAmount;
    const normalizedType = type.toLowerCase().trim().replace(/\s+/g, "_");
    const EXCHANGE_RATE = 120; // ১ ডলার = ১২০ টাকা

    // 3. Expense Checking & Balance Validation
    const expenseTypes = [
      "cashout",
      "send_money",
      "bill_payment",
      "pay_bill",
      "mobile_recharge",
      "micro_saving_deposit",
    ];
    const isExpense = expenseTypes.includes(normalizedType);

    if (isExpense && (user.balance || 0) < txAmount) {
      return NextResponse.json(
        { message: "Insufficient balance" },
        { status: 400 },
      );
    }

    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // 4. Recipient & KYC Check Logic (For Send Money)
    let recipientUser = null;
    if (receiver && normalizedType === "send_money") {
      if (email === receiver)
        return NextResponse.json(
          { message: "Cannot send money to yourself" },
          { status: 400 },
        );

      recipientUser = await usersCollection.findOne({ email: receiver });
      if (!recipientUser)
        return NextResponse.json(
          { message: "Recipient user not found" },
          { status: 404 },
        );

      if (recipientUser.kycStatus !== "approved") {
        return NextResponse.json(
          {
            message: "Recipient is not KYC verified. Money cannot be sent.",
          },
          { status: 403 },
        );
      }
    }
// micro-saving
 // ---------------------------------------------------------
    // 4. MICRO-SAVING LOGIC
    // ---------------------------------------------------------
    if (normalizedType === "micro_saving_deposit") {
      if (!goalId) {
        return NextResponse.json({ message: "Goal ID (goalId) is missing from request" }, { status: 400 });
      }

      const savingTx = {
        transactionId,
        type: "Micro-Saving Deposit",
        amount: txAmount,
        currency: user.currency || "BDT",
        date: new Date(),
        description: description || "Deposit to savings",
        status: "completed"
      };

      const updateResult = await usersCollection.updateOne(
        { 
          email: email, 
          "microsaving.id": goalId // 🎯 Matches the 'id' field in your screenshot
        }, 
        {
          $inc: { 
            balance: -txAmount,
            "microsaving.$.currentSaved": txAmount // 🎯 Matches 'currentSaved' exactly
          },
          $push: { 
            history: { $each: [savingTx], $position: 0 } 
          } as any
        }
      );

      // matchedCount = found the goal. modifiedCount = actually changed it.
      if (updateResult.matchedCount === 0) {
        return NextResponse.json({ message: "Saving goal not found in your account" }, { status: 404 });
      }

      if (requestId) {
        await db.collection("notifications").updateOne(
          { _id: new ObjectId(requestId) },
          { $set: { status: "completed" } }
        );
      }

      return NextResponse.json({ success: true, message: "Savings updated successfully!" });
    }
    // ---------------------------------------------------------
    // 5. CASHOUT LOGIC
    // ---------------------------------------------------------
    if (normalizedType === "cashout") {
      if (!receiver)
        return NextResponse.json(
          { message: "Agent number is required" },
          { status: 400 },
        );

      const senderTx = {
        transactionId,
        type: "Cash Out",
        amount: txAmount,
        currency: user.currency || "BDT",
        receiver: receiver,
        description: description || `Cash out to agent: ${receiver}`,
        status: "completed",
        date: new Date(),
      };

      await usersCollection.updateOne(
        { email: email },
        {
          $inc: { balance: -txAmount },
          $push: { history: { $each: [senderTx], $position: 0 } } as any,
          $set: { updatedAt: new Date() },
        },
      );

      return NextResponse.json(
        {
          success: true,
          message: `Cash out successful to ${receiver}`,
          transactionId,
        },
        { status: 200 },
      );
    }

    // ---------------------------------------------------------
    // 5. CASHOUT REWARDS (Savings to Wallet)
    // ---------------------------------------------------------
    if (normalizedType === "cashout_rewards") {
      if (!goalId || finalAmount <= 0) {
        return NextResponse.json({ success: false, message: "Missing Goal ID or Amount" }, { status: 400 });
      }

      const currentTxId = `REW-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const rewardTx = {
        transactionId: currentTxId,
        type: "Savings Reward",
        amount: finalAmount,
        currency: user?.currency || "BDT",
        receiver: "Main Wallet",
        description: `Rewards cashout for goal: ${goalId}`,
        status: "completed",
        date: new Date(),
      };

      const updateResult = await usersCollection.updateOne(
        { email: email, "microsaving.id": goalId },
        {
          $inc: { balance: finalAmount }, 
          $push: { history: { $each: [rewardTx], $position: 0 } } as any,
          $pull: { microsaving: { id: goalId } }, 
          $set: { updatedAt: new Date() },
        }
      );

      if (updateResult.modifiedCount === 0) {
        return NextResponse.json({ success: false, message: "Goal not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: "Cashed out to wallet!", transactionId: currentTxId });
    }


    // ---------------------------------------------------------
    // 6. SEND MONEY LOGIC (Currency Conversion)
    // ---------------------------------------------------------
    if (normalizedType === "send_money") {
      const senderCurrency = user.currency || "BDT";
      const receiverCurrency = recipientUser.currency || "BDT";
      let receiverFinalAmount = txAmount;

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
        status: "completed",
        date: new Date(),
      };

      const receiverTx = {
        transactionId,
        type: "Receive Money",
        amount: Number(receiverFinalAmount.toFixed(2)),
        currency: receiverCurrency,
        sender: email,
        status: "completed",
        date: new Date(),
      };

      await usersCollection.updateOne(
        { email: email },
        {
          $inc: { balance: -txAmount },
          $push: { history: { $each: [senderTx], $position: 0 } } as any,
        },
      );

      await usersCollection.updateOne(
        { email: receiver },
        {
          $inc: { balance: Number(receiverFinalAmount.toFixed(2)) },
          $push: { history: { $each: [receiverTx], $position: 0 } } as any,
        },
      );

      if (requestId)
        await db
          .collection("notifications")
          .deleteOne({ _id: new ObjectId(requestId) });

      return NextResponse.json(
        { success: true, message: "Money sent successfully", transactionId },
        { status: 200 },
      );
    }

    // ---------------------------------------------------------
    // 7. ADD MONEY SELF (From Bank)
    // ---------------------------------------------------------
    if (normalizedType === "add_money_self") {
      if (!body.bankNumber || !txAmount)
        return NextResponse.json(
          { message: "Bank Number and Amount required" },
          { status: 400 },
        );

      const currentBankBalance = user.bankBalance || 0;
      if (currentBankBalance < txAmount)
        return NextResponse.json(
          { message: "Insufficient bank balance" },
          { status: 400 },
        );

      const addTx = {
        transactionId: `ADD_SELF_${Date.now()}`,
        type: "Add Money (Bank)",
        amount: txAmount,
        currency: user.currency || "BDT",
        description: `Added money from Bank A/C: ${body.bankNumber}`,
        status: "completed",
        date: new Date(),
      };

      await usersCollection.updateOne(
        { email: email },
        {
          $inc: { balance: txAmount, bankBalance: -txAmount },
          $push: { history: { $each: [addTx], $position: 0 } } as any,
          $set: { updatedAt: new Date() },
        },
      );

      return NextResponse.json(
        { success: true, message: "Added money from bank successfully" },
        { status: 200 },
      );
    }

    // ---------------------------------------------------------
    // 8. OTHERS (Deposit, Bill Pay etc.)
    // ---------------------------------------------------------
    const balanceAdjustment = isExpense ? -txAmount : txAmount;
    const newTransaction = {
      transactionId,
      type: type,
      amount: txAmount,
      currency: currency || user.currency || "BDT",
      status: "completed",
      sender: sender || "Wallet",
      receiver: receiver || "System",
      date: new Date(),
    };

    await usersCollection.updateOne(
      { email: email },
      {
        $inc: { balance: balanceAdjustment },
        $push: { history: { $each: [newTransaction], $position: 0 } } as any,
        $set: { updatedAt: new Date() },
      },
    );

    return NextResponse.json(
      { success: true, message: "Transaction successful", transactionId },
      { status: 200 },
    );
  } catch (error) {
    console.error("Transaction Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
