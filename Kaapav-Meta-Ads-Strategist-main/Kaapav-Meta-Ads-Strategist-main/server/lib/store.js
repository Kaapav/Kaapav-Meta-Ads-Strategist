// server/lib/store.js
import fetch from 'node-fetch';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

function ensureFirebase() {
  if (admin.apps.length) return admin.app();
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_FILE;
  if (base64) {
    const json = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
    admin.initializeApp({ credential: admin.credential.cert(json) });
  } else if (filePath && fs.existsSync(filePath)) {
    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    admin.initializeApp({ credential: admin.credential.cert(json) });
  } else {
    // firebase optional — we don't throw here
    console.warn('Firebase not configured (FIREBASE_SERVICE_ACCOUNT_BASE64 or FILE missing).');
  }
  return admin.app();
}

// Upstash REST helpers
export async function redisGet(key) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  const res = await fetch(`${UPSTASH_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
  });
  const j = await res.json();
  return j.result ?? null;
}

export async function redisSet(key, value, exSeconds = null) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  const v = typeof value === 'string' ? value : JSON.stringify(value);
  let url = `${UPSTASH_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(v)}`;
  if (exSeconds) url += `?ex=${exSeconds}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }});
  return res.json();
}

export function getFirestore() {
  ensureFirebase();
  if (!admin.apps.length) throw new Error('Firebase not initialized');
  return admin.firestore();
}

export async function fsSave(collection, id, doc) {
  const db = getFirestore();
  const ref = id ? db.collection(collection).doc(id) : db.collection(collection).doc();
  await ref.set(doc, { merge: true });
  return { id: ref.id };
}

export async function fsGet(collection, id) {
  const db = getFirestore();
  const snap = await db.collection(collection).doc(id).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() };
}

export async function fsQuery(collection, where = []) {
  const db = getFirestore();
  let q = db.collection(collection);
  for (const [field, op, val] of where) q = q.where(field, op, val);
  const snap = await q.get();
  const out = [];
  snap.forEach(d => out.push({ id: d.id, ...d.data() }));
  return out;
}
