import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { name, email, password, image } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "All required fields must be filled." }, { status: 400 });
    }

    if (image && typeof image !== "string") {
      return NextResponse.json({ message: "Invalid profile image format." }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db(); // Connects to novapay_db from .env

    // Check if an account already exists with this email
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "An account with this email already exists." }, { status: 400 });
    }

    // Hash password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user data
    await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      image: image || null,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: "Account created successfully." }, { status: 201 });
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ message: "A server error occurred." }, { status: 500 });
  }
}