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
          content: "You are a professional finance coach. Give a 1-sentence tip in English. No markdown, no bold text."
        },
        {
          role: "user",
          content: `Balance: ${currency}${balance}, Retention: ${retention}%, History: ${JSON.stringify(history)}`
        }
      ],
      model: "llama-3.3-70b-versatile", 
    });

    const advice = completion.choices[0]?.message?.content || "Keep tracking your expenses!";
    return NextResponse.json({ advice });

  } catch (error: any) {
    console.error("Groq Error:", error);
    return NextResponse.json({ 
      advice: "Try to keep your daily expenses below 20% of your balance.",
      error: error.message 
    });
  }
}