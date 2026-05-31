import admin from "firebase-admin";

import serviceAccount from "../keys/ai-voice-app-85078-firebase-adminsdk-fbsvc-793a2124d8.json";

if (!admin.apps.length) {

  admin.initializeApp({
    credential: admin.credential.cert(
      serviceAccount as admin.ServiceAccount
    ),
  });

}

export const adminDb = admin.firestore();

export const adminAuth = admin.auth();