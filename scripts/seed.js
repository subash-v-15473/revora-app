// Seeds 10 sample cars (with two photos each) and 2 appointments. Run once, as admin.
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, updateDoc, collection, addDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { readFileSync, readdirSync } from 'node:fs';
import { config } from './config.js';
const app = initializeApp(config);
await signInWithEmailAndPassword(getAuth(app), 'revoraadmin@revora.com', process.env.REVORA_ADMIN_PASSWORD || 'Revora@1');
const db = getFirestore(app);
const dir = new URL('../sample-data/', import.meta.url);
// Remove sample photos from an earlier run so they are not duplicated.
const old = await getDocs(query(collection(db, 'photos'), where('sample', '==', true)));
for (const d of old.docs) await deleteDoc(d.ref);
if (old.size) console.log('removed', old.size, 'old sample photos');
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
  try {
    if (collection === 'appointments') {
      // the create rule only allows status "new"; set the final status with an admin update
      const status = data.status; await setDoc(doc(db, collection, id), { ...data, status: 'new' });
      if (status !== 'new') await updateDoc(doc(db, collection, id), { status });
    } else await setDoc(doc(db, collection, id), data);
    console.log('wrote', collection + '/' + id);
  } catch (e) { console.log('FAILED', collection + '/' + id, e.code || e.message); }
}
console.log('Done.'); process.exit(0);
