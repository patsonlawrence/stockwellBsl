import "server-only";
import admin from "firebase-admin";

let app: admin.app.App | null = null;

function getApp() {
  if (app) return app;
    try {
    app = admin.app(); // ✅ get existing app if it exists
  } catch (error) {
  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !process.env.FIREBASE_PRIVATE_KEY
  ) {
    throw new Error("Missing Firebase Admin environment variables");
  }

  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
  }
  return app;
  
}

export function getAdminAuth() {
  getApp();
  return admin.auth();
}

export function getAdminDb() {
  getApp();
  return admin.firestore();
}
