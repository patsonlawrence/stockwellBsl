import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "../../../firebaseAdmin"; // no serviceAccount import needed

export async function POST(req: Request) {
  try {
    const member = await req.json();

    const user = await adminAuth.createUser({
      email: member.email,
      displayName: member.fullName,
    });

    await adminDb.collection("members").add({
      ...member,
      uid: user.uid,
      createdAt: new Date(),
    });

    await adminAuth.generatePasswordResetLink(member.email);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
