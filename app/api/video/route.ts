import { NextResponse } from "next/server";
import { getVideoUrl, setVideoUrl } from "@/lib/callStore";

export async function GET() {
  const url = getVideoUrl();
  return NextResponse.json({ url });
}

export async function POST(request: Request) {
  let body: { url?: string } = {};

  try {
    body = await request.json();
  } catch (e) {
    body = {};
  }

  const url = typeof body.url === "string" ? body.url.trim() : "";

  if (!url) {
    setVideoUrl(null);
    return NextResponse.json({ ok: true, url: null });
  }

  setVideoUrl(url);

  return NextResponse.json({ ok: true, url });
}
