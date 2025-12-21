import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (email === "test@example.com" && password === "password123") {
    return NextResponse.json({ success: true, message: "Login successful!" });
  }

  return NextResponse.json({ success: false, message: "Invalid email or password" });
}
