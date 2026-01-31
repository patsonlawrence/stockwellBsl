import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const member = await req.json();

    if (!member.email || !member.fullName) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Create Auth user
    const user = await adminAuth.createUser({
      email: member.email,
      displayName: member.fullName,
    });

    // 2. Save member in Firestore
    await adminDb.collection("members").doc(user.uid).set({
      ...member,
      uid: user.uid,
      createdAt: new Date(),
    });

    // Optional: password setup link
    // const link = await adminAuth.generatePasswordResetLink(member.email);

    return NextResponse.json(
      { success: true, uid: user.uid },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("CREATE MEMBER ERROR:", error);

    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}