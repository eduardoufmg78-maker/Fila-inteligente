import { NextResponse } from "next/server";
import { setCurrentCall } from "@/lib/callStore";

export async function POST(request: Request) {
  const body = await request.json();

  const { name, doctor, room } = body;

  if (!name || !doctor || !room) {
    return NextResponse.json(
      { ok: false, error: "Nome do paciente, profissional e consultório são obrigatórios." },
      { status: 400 }
    );
  }

  const call = {
    id: Date.now(),
    name,
    doctor,
    room,
    timestamp: Date.now(),
  };

  setCurrentCall(call);

  return NextResponse.json({ ok: true, call });
}
