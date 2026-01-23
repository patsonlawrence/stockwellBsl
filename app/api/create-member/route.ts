import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "../../../firebaseAdmin";

export async function POST(req: Request) {
  try {
    const member = await req.json();
    
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


    /* 3. Send password setup email
    const link = await adminAuth.generatePasswordResetLink(member.email);
console.log("PASSWORD LINK:", link);*/


    return NextResponse.json(
      { success: true, uid: user.uid },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 400 }
    );
  }
}
