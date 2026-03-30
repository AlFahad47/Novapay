import Groq from "groq-sdk";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json().catch(() => null);
    if (!body || !body.message) return NextResponse.json({ error: "No message" }, { status: 400 });

    const { message } = body;
    const userEmail = session?.user?.email;

    let history: any[] = [];

    // --- 1. OPTIONAL DATABASE FETCH ---
    if (userEmail) {
      const client = await clientPromise;
      const db = client.db();
      const chatDoc = await db.collection("ai_chats").findOne({ userEmail: session.user.email });
      history = chatDoc?.messages || [];
    }

    // --- 2. AI PROCESSING (Works for both Guest & User) ---
    const cleanHistory = history.slice(-5).map((m: any) => ({
      role: m.role,
      content: m.content
    }));

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are Nova AI. Help users with NovaPay info. Be concise." },
        ...cleanHistory,
        { role: "user", content: message }
      ],
    });

    const aiResponse = completion.choices[0].message.content;

    // --- 3. OPTIONAL DATABASE SAVE ---
    if (userEmail) {
      const client = await clientPromise;
      const db = client.db();
      await db.collection("ai_chats").updateOne(
        { userEmail },
        {
          $set: { updatedAt: new Date() },
          $push: {
            messages: {
              $each: [
                { role: "user", content: message, timestamp: new Date() },
                { role: "assistant", content: aiResponse, timestamp: new Date() }
              ]
            }
          }
        },
        { upsert: true }
      );
    }

    // 4. Return response to everyone (User or Guest)
    return NextResponse.json({ message: aiResponse });

  } catch (error: any) {
    console.error("AI_ROUTE_ERROR:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json([]);

    const client = await clientPromise;
    const db = client.db(); // Use your default DB
    
    const chatDoc = await db.collection("ai_chats").findOne({ userEmail: session.user.email });

    // CRITICAL: Return the messages array specifically
    return NextResponse.json(chatDoc?.messages || []);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}