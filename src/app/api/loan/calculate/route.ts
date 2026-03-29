import Groq from "groq-sdk";
import clientPromise from "@/lib/mongodb";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const client = await clientPromise;
    const db = client.db("novapay_db");

    // 1. Fetch User
    const user = await db.collection("users").findOne({ email });
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    // 2. CHECK FOR ACTIVE LOANS
    const activeLoan = await db.collection("loans").findOne({ 
      userEmail: email, 
      status: { $in: ["active", "defaulted", "pending"] } 
    });

    if (activeLoan) {
      const blockedReason = "You have an active loan. Please repay it to unlock a new credit limit.";
      await db.collection("users").updateOne(
        { email },
        { $set: { loanLimit: 0, limitReason: blockedReason, lastAiUpdate: new Date() } }
      );
      return Response.json({ success: true, limit: 0, reason: blockedReason });
    }

    // 3. ENHANCED DATA GATHERING (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const allHistory = [...(user.history || []), ...(user.wallethistory || [])];
    
    const stats = allHistory.reduce((acc: any, tx: any) => {
      const txDate = new Date(tx.date || tx.createdAt || Date.now());
      if (txDate < thirtyDaysAgo) return acc; // Only count last 30 days

      // Capture amount from various possible keys
      const amount = Number(tx.amount || tx.amountReceived || 0);
      const type = String(tx.type || "").toLowerCase();

      // Check if it's an inflow (Money coming in)
      if (type.includes("receive") || type.includes("add") || type.includes("deposit") || type.includes("disbursement")) {
        acc.inflow += amount;
      } else {
        acc.outflow += amount;
      }
      return acc;
    }, { inflow: 0, outflow: 0 });

    // 4. GROQ AI LOGIC WITH IMPROVED PROMPT
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are NovaPay's AI Risk Engine. 
          Analyze user stats and provide a credit limit (1000 - 50000 BDT). 
          If inflow is 0, provide a small starter limit of 500 BDT.
          Return ONLY JSON: { "limit": number, "reason": "short explanation" }`
        },
        {
          role: "user",
          content: `User: ${user.name}. 
          Current Balance: ${user.balance} BDT. 
          Account Points: ${user.points || 0}. 
          30-Day Inflow Volume: ${stats.inflow} BDT. 
          30-Day Outflow Volume: ${stats.outflow} BDT. 
          KYC Status: ${user.kycStatus || 'Pending'}.`
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const aiResult = JSON.parse(completion.choices[0].message.content || "{}");
    
    // Fallback: Ensure limit isn't 0 if AI is being too strict on new users
    let finalLimit = aiResult.limit;
    if (!finalLimit || finalLimit < 500) {
        finalLimit = stats.inflow > 0 ? 1000 : 500; 
    }

    // 5. SAVE TO DB
    await db.collection("users").updateOne(
      { email },
      { 
        $set: { 
          loanLimit: finalLimit, 
          limitReason: aiResult.reason || "Starter limit based on account creation.",
          lastAiUpdate: new Date()
        } 
      }
    );

    return Response.json({ 
      success: true, 
      limit: finalLimit, 
      reason: aiResult.reason 
    });

  } catch (error: any) {
    console.error("AI Route Error:", error);
    return Response.json({ error: "Failed to calculate limit. Try again later." }, { status: 500 });
  }
}