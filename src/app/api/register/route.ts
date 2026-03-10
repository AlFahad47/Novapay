import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "সবগুলো ফিল্ড পূরণ করতে হবে!" }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db(); // .env তে দেয়া novapay_db তে কানেক্ট হবে

    // চেক করা যে এই ইমেইলে আগে থেকেই একাউন্ট আছে কি না
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "এই ইমেইল দিয়ে অলরেডি একাউন্ট খোলা আছে!" }, { status: 400 });
    }

    // পাসওয়ার্ড হ্যাশ করা (যাতে কেউ ডাটাবেজ হ্যাক করলেও পাসওয়ার্ড না বোঝে)
    const hashedPassword = await bcrypt.hash(password, 10);

    // ইউজারের ডাটা সেভ করা
    const result = await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: "একাউন্ট সফলভাবে তৈরি হয়েছে!" }, { status: 201 });
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ message: "সার্ভারে কোনো সমস্যা হয়েছে!" }, { status: 500 });
  }
}