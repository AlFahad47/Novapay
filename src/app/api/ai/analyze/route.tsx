import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { balance, history, retention, currency } = await req.json();

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a witty, professional cash-flow coach for a physical wallet app. 
                    Analyze the user's physical cash behavior. Give a 1-sentence tip in English. 
                    No markdown, no bold text, no emojis. Focus on liquidity and burn rate.`
        },
        {
          role: "user",
          content: `Cash Balance: ${currency}${balance}, Cash Retention: ${retention}%, Recent Spends: ${JSON.stringify(history)}`
        }
      ],
      model: "llama-3.3-70b-versatile", 
    });

    const advice = completion.choices[0]?.message?.content || "Avoid carrying too much cash for unnecessary expenses.";
    return NextResponse.json({ advice });

  } catch (error: any) {
    return NextResponse.json({ 
      advice: "Your cash flow looks steady, but try to keep a daily log of minor spends.",
      error: error.message 
    });
  }
}