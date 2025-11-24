import { NextResponse } from "next/server";
import { getVideoUrl, setVideoUrl } from "@/lib/callStore";

// Buscar o link atual do vídeo
export async function GET() {
  const url = getVideoUrl();
  return NextResponse.json({ url });
}

// Definir / atualizar o link do vídeo
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({} as any));
  const url = typeof body.url === "string" ? body.url.trim() : "";

  if (!url) {
    // se vier vazio, consideramos que é para limpar o vídeo
    setVideoUrl(null);
    return NextResponse.json({ ok: true, url: null });
  }

  setVideoUrl(url);

  return NextResponse.json({ ok: true, url });
}
