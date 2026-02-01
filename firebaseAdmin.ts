import "server-only";
import admin from "firebase-admin";

let app: admin.app.App;

function getApp() {
  if (admin.apps.length) {
    return admin.apps[0];
  }

  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !process.env.FIREBASE_PRIVATE_KEY
  ) {
    throw new Error("Missing Firebase Admin environment variables");
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");

  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });

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
