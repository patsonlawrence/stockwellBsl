import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  console.log('FIREBASE_PRIVATE_KEY length:', process.env.FIREBASE_PRIVATE_KEY?.length);
  console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);

  fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
})
.then(res => res.json())
.then(console.log);

  if (email === "test@example.com" && password === "password123") {
    return NextResponse.json({ success: true, message: "Login successful!" });
  }

  return NextResponse.json({ success: false, message: "Invalid email or password" });
}
