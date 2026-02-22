/**
 * RUN ONCE to upload MCQ bank to Firestore.
 *
 * Usage:
 *   npx ts-node --esm scripts/seedFirestore.ts
 *   OR paste into browser console after importing firebase.ts
 *
 * Firestore structure created:
 *   mcq_bank/{auto-id}  ← one document per question
 */

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, writeBatch, doc } from "firebase/firestore";
import { mcqBank } from "./mcqData";

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

async function seedMCQBank() {
    const colRef = collection(db, "mcq_bank");

    // Firestore batches max 500 writes each
    const BATCH_SIZE = 499;
    let batch = writeBatch(db);
    let count = 0;
    let batchCount = 0;

    for (const question of mcqBank) {
        const ref = doc(colRef); // auto-generated ID
        batch.set(ref, question);
        count++;

        if (count % BATCH_SIZE === 0) {
            await batch.commit();
            batchCount++;
            console.log(`✓ Batch ${batchCount} committed (${count} questions so far)`);
            batch = writeBatch(db);
        }
    }

    if (count % BATCH_SIZE !== 0) {
        await batch.commit();
        console.log(`✓ Final batch committed`);
    }

    console.log(`\n🎉 Done! ${count} questions uploaded to Firestore mcq_bank collection.`);
}

seedMCQBank().catch(console.error);