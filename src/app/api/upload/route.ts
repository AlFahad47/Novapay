import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { texts, targetLang } = await req.json();

  if (!texts?.length || targetLang === "en") {
    return NextResponse.json({ translated: texts });
  }

  try {
    const translated = await Promise.all(
      texts.map(async (text: string) => {
        if (!text?.trim()) return text;
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        const data = await res.json();
        return data[0]?.map((item: string[]) => item[0]).join("") || text;
      })
    );
    return NextResponse.json({ translated });
  } catch {
    return NextResponse.json({ translated: texts });
  }
}

