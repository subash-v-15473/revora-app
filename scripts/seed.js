// Seeds 10 sample cars (with two photos each) and 2 appointments. Run once, as admin.
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { readFileSync, readdirSync } from 'node:fs';
import { config } from './config.js';
const app = initializeApp(config);
await signInWithEmailAndPassword(getAuth(app), 'revoraadmin@revora.com', process.env.REVORA_ADMIN_PASSWORD || 'Revora@1');
const db = getFirestore(app);
const dir = new URL('../sample-data/', import.meta.url);
const urlFor = {};
for (const f of readdirSync(dir).filter(f => f.endsWith('.jpg'))) {
  const bytes = readFileSync(new URL(f, dir));
  const data = 'data:image/jpeg;base64,' + bytes.toString('base64');
  const r = await addDoc(collection(db, 'photos'), { data, size: bytes.length, createdAt: new Date().toISOString(), sample: true });
  urlFor[f] = 'fs:' + r.id; console.log('stored photo', f);
}
for (const f of readdirSync(dir).filter(f => f.endsWith('.json'))) {
  const [collection, id] = f.replace('.json', '').split('__');
  const data = JSON.parse(readFileSync(new URL(f, dir), 'utf8'));
  if (Array.isArray(data.photos)) data.photos = data.photos.map(p => urlFor[p] || p);
  await setDoc(doc(db, collection, id), data); console.log('wrote', collection + '/' + id);
}
console.log('Done.'); process.exit(0);
