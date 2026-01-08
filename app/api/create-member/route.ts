// /app/api/create-member/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // ✅ Dynamic import (this is the critical fix)
    const { adminAuth, adminDb } = await import("../../../firebaseAdmin");

    const member = await req.json();

    // Create user in Firebase Auth
    const user = await adminAuth.createUser({
      email: member.email,
      displayName: member.fullName,
    });

    // Add member to Firestore
    await adminDb.collection("members").add({
      ...member,
      uid: user.uid,
      createdAt: new Date(),
    });

    // Send password reset link
    await adminAuth.generatePasswordResetLink(member.email);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error creating member:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }
}
