import Groq from "groq-sdk";
import clientPromise from "@/lib/mongodb"; // Fixed: No curly braces

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const client = await clientPromise;
    const db = client.db("novapay_db");

    const user = await db.collection("users").findOne({ email });

    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    // SAFE DATA GATHERING
    // We check both 'history' and 'wallethistory' and default to an empty array if null
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

    // GROQ AI LOGIC
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are NovaPay's AI Risk Engine. Return ONLY JSON: { \"limit\": number, \"reason\": \"string\" }`
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

    // SAVE TO DB
    const updateResult = await db.collection("users").updateOne(
      { email },
      { 
        $set: { 
          loanLimit: aiResult.limit || 500, // Fallback to 500 if AI fails
          limitReason: aiResult.reason,
          lastAiUpdate: new Date()
        } 
      }
    );

    return Response.json({ success: true, limit: aiResult.limit,reason: aiResult.reason });

  } catch (error: any) {
    console.error("AI Route Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}