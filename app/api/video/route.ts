import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    return NextResponse.json({
      ok: true,
      url: body.url ?? null,
    });
  } catch {
    // Sem variável "e" para evitar erro ESLint
    return NextResponse.json(
      { ok: false, error: "Erro ao processar requisição." },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Endpoint de vídeo funcionando.",
  });
}
