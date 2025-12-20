import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // Temporary login check
  if (email === "test@example.com" && password === "password123") {
    return NextResponse.json({ success: true, message: "Login successful!" });
  }

  return NextResponse.json(
    { success: false, message: "Invalid email or password" },
    { status: 401 }
  );
}
