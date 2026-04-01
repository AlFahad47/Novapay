import { NextResponse } from "next/server";

// Supported currencies in our app
// Note: BDT is NOT supported by frankfurter.app - removed from list
const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "PHP", "INR", "SGD", "AUD", "JPY", "CAD"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") || "USD";
    const to = searchParams.get("to"); // optional - if not given, fetch all

    // Validate the "from" currency
    if (!SUPPORTED_CURRENCIES.includes(from.toUpperCase())) {
      return NextResponse.json(
        { message: `Currency "${from}" is not supported.` },
        { status: 400 }
      );
    }

    // Build the frankfurter.app URL
    // If "to" is given → fetch only that pair (e.g. USD to PHP)
    // If "to" is not given → fetch all supported currencies
    const toCurrencies = to
      ? to.toUpperCase()
      : SUPPORTED_CURRENCIES.filter((c) => c !== from.toUpperCase()).join(",");

    const apiUrl = `https://api.frankfurter.app/latest?from=${from.toUpperCase()}&to=${toCurrencies}`;

    const response = await fetch(apiUrl, {
      // Cache for 10 minutes - rates don't change every second
      next: { revalidate: 600 },
    });

    if (!response.ok) {
      throw new Error(`Frankfurter API error: ${response.status}`);
    }

    const data = await response.json();

    // Return the rates + metadata
    return NextResponse.json({
      base: data.base,         // e.g. "USD"
      date: data.date,         // e.g. "2025-03-09"
      rates: data.rates,       // e.g. { "PHP": 57.5, "EUR": 0.92, ... }
    });
  } catch (error) {
    console.error("Exchange Rate API Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch exchange rates. Please try again." },
      { status: 500 }
    );
  }
}

