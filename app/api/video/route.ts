import { NextResponse } from "next/server";
import { setCurrentVideoUrl, getCurrentVideoUrl } from "@/lib/videoStore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = typeof body.url === "string" ? body.url : "";

    setCurrentVideoUrl(url);

    return NextResponse.json({ ok: true, url });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Erro ao processar requisição." },
      { status: 400 }
    );
  }
}

export async function GET() {
  const url = getCurrentVideoUrl();
  return NextResponse.json({ ok: true, url });
}
