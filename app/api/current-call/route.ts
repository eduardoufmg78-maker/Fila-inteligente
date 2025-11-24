import { NextResponse } from "next/server";
import { getCurrentCall } from "@/lib/callStore";

export async function GET() {
  const call = getCurrentCall();
  return NextResponse.json({ call });
}
