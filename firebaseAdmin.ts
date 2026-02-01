import "server-only";
import admin from "firebase-admin";

function getApp() {
  if (admin.apps.length) return admin.apps[0];
  console.log("ENV CHECK", {
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY_BASE64: !!process.env.FIREBASE_PRIVATE_KEY_BASE64,
});


  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !process.env.FIREBASE_PRIVATE_KEY_BASE64
  ) {
    throw new Error("Missing Firebase Admin environment variables");
  }

  const privateKey = Buffer.from(
    process.env.FIREBASE_PRIVATE_KEY_BASE64,
    "base64"
  ).toString("utf8");

  // 🔍 optional sanity check
  if (!privateKey.includes("BEGIN PRIVATE KEY")) {
    throw new Error("Decoded private key is invalid");
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

export function getAdminAuth() {
  getApp();
  return admin.auth();
}

export function getAdminDb() {
  getApp();
  return admin.firestore();
}
