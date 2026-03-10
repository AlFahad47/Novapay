import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { CURRENCY_META, SupportedCurrency } from "@/types/international";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("novapay_db");

    const user = await db.collection("users").findOne(
      { email },
      { projection: { wallets: 1, balance: 1, currency: 1 } } // only fetch what we need
    );

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Build wallet list with metadata for the UI
    const wallets = user.wallets || {};
    const walletsWithMeta = Object.entries(wallets).map(([currency, amount]) => ({
      currency: currency as SupportedCurrency,
      amount: Number(amount),
      symbol: CURRENCY_META[currency as SupportedCurrency]?.symbol || currency,
      name: CURRENCY_META[currency as SupportedCurrency]?.name || currency,
      flag: CURRENCY_META[currency as SupportedCurrency]?.flag || "🌐",
    }));

    return NextResponse.json({
      mainBalance: user.balance || 0,
      mainCurrency: user.currency || "USD",
      wallets: walletsWithMeta,
    });

  } catch (error) {
    console.error("Get Wallets Error:", error);
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}
