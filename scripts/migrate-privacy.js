// One-time migration for the public/private split:
//  1. builds listings/{carId} for every car that customers should see
//  2. moves document files out of the public `photos` collection into admin-only `files`
//  3. re-keys the admins collection by email
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { config } from './config.js';
const app = initializeApp(config); const db = getFirestore(app);
const ADMIN = 'revoraadmin@revora.com';
const cred = await signInWithEmailAndPassword(getAuth(app), ADMIN, process.env.REVORA_ADMIN_PASSWORD || 'Revora@1');
const STAGES = ['purchased','listed','customer','payment','sold','rc','done'];
const idx = s => STAGES.indexOf(s);
const daysSince = d => d ? Math.floor((Date.now() - new Date(d)) / 86400000) : 0;
const maskReg = r => String(r || '').replace(/(\d{4})$/, '••••');
const cars = (await getDocs(collection(db, 'cars'))).docs.map(d => ({ id: d.id, ...d.data() }));
let nList = 0, nDel = 0, nFiles = 0;
for (const c of cars) {
  // 1. listing mirror
  const forSale = c.stage === 'listed' || c.stage === 'customer';
  const sold = idx(c.stage) >= idx('sold') && c.sale?.date && daysSince(c.sale.date) <= 120;
  const ref = doc(db, 'listings', c.id);
  if (forSale || sold) {
    await setDoc(ref, { title: c.title || '', year: c.year || null, km: c.km || null, fuel: c.fuel || '', transmission: c.transmission || '', owners: c.owners || '', colour: c.colour || '', city: c.city || '',
      regMasked: maskReg(c.reg), photos: Array.isArray(c.photos) ? c.photos : [], stage: forSale ? 'listed' : 'sold', price: forSale ? (+c.listing?.price || 0) : null,
      listedAt: forSale ? (c.listing?.date || '') : '', soldDate: sold ? c.sale.date : '', updatedAt: new Date().toISOString() }); nList++;
  } else { try { await deleteDoc(ref); nDel++; } catch {} }
  // 2. documents → files
  if (Array.isArray(c.docs) && c.docs.some(d => String(d.fileId).startsWith('fs:'))) {
    const docs = [];
    for (const d of c.docs) {
      if (String(d.fileId).startsWith('fs:')) {
        const src = await getDoc(doc(db, 'photos', d.fileId.slice(3)));
        if (src.exists()) { const n = await addDoc(collection(db, 'files'), src.data()); await deleteDoc(src.ref); docs.push({ ...d, fileId: 'fd:' + n.id }); nFiles++; }
        else docs.push(d);
      } else docs.push(d);
    }
    await updateDoc(doc(db, 'cars', c.id), { docs });
  }
}
// 3. admins keyed by email
const admins = (await getDocs(collection(db, 'admins'))).docs;
for (const a of admins) {
  const d = a.data(); const email = (d.email || '').toLowerCase();
  if (!email || a.id === email) continue;
  await setDoc(doc(db, 'admins', email), { ...d, email, uid: a.id }, { merge: true }); await deleteDoc(a.ref); console.log('re-keyed admin', email);
}
await setDoc(doc(db, 'admins', ADMIN), { name: 'Revora Admin', email: ADMIN, uid: cred.user.uid }, { merge: true });
console.log(`listings written: ${nList}, removed: ${nDel}; document files moved: ${nFiles}`); process.exit(0);
