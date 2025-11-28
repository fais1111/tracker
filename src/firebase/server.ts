// IMPORTANT: This file should only be used on the server
// and is not intended for client-side consumption.

import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { firebaseConfig } from './config';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

let app: App;

export function initializeServerApp() {
  if (getApps().length > 0) {
    app = getApps()[0];
    return;
  }
  
  app = initializeApp({
    credential: cert(serviceAccount),
    databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
  });
}
