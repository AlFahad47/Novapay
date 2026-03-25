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

    // 2. CHECK FOR ACTIVE LOANS (The Bug Fix)
    // We check if the user has any loan that isn't 'completed' or 'rejected'
    const activeLoan = await db.collection("loans").findOne({ 
      userEmail: email, 
      status: { $in: ["active", "defaulted", "pending"] } 
    });

    if (activeLoan) {
      const blockedReason = "You have an active loan. Please repay it to unlock a new credit limit.";
      
      await db.collection("users").updateOne(
        { email },
        { 
          $set: { 
            loanLimit: 0, 
            limitReason: blockedReason,
            lastAiUpdate: new Date() 
          } 
        }
      );

      return Response.json({ 
        success: true, 
        limit: 0, 
        reason: blockedReason 
      });
    }

    // 3. SAFE DATA GATHERING (Only runs if no active loan)
    const allHistory = [...(user.history || []), ...(user.wallethistory || [])];
    
    const stats = allHistory.reduce((acc: any, tx: any) => {
      const amount = tx.amount || tx.amountReceived || 0;
      if (tx.type?.includes("receive") || tx.type === "add_money") {
        acc.inflow += amount;
      } else {
        acc.outflow += amount;
      }
      return acc;
    }, { inflow: 0, outflow: 0 });

    // 4. GROQ AI LOGIC
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are NovaPay's AI Risk Engine. Return ONLY JSON: { "limit": number, "reason": "string" }`
        },
        {
          role: "user",
          content: `User: ${user.name}. Balance: ${user.balance}. Points: ${user.points}. 30-day Inflow: ${stats.inflow}. 30-day Outflow: ${stats.outflow}. KYC Status: ${user.kycStatus}.`
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const aiResult = JSON.parse(completion.choices[0].message.content || "{}");

    // 5. SAVE TO DB
    await db.collection("users").updateOne(
      { email },
      { 
        $set: { 
          loanLimit: aiResult.limit || 500, 
          limitReason: aiResult.reason,
          lastAiUpdate: new Date()
        } 
      }
    );

    return Response.json({ 
      success: true, 
      limit: aiResult.limit, 
      reason: aiResult.reason 
    });

  } catch (error: any) {
    console.error("AI Route Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}