import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { config } from './config.js';
const EMAIL = 'revoraadmin@revora.com';
const PASSWORD = process.env.REVORA_ADMIN_PASSWORD || 'Revora@1';
const auth = getAuth(initializeApp(config));
try {
  await createUserWithEmailAndPassword(auth, EMAIL, PASSWORD);
  console.log('Admin user created:', EMAIL);
} catch (e) {
  if (e.code === 'auth/email-already-in-use') {
    await signInWithEmailAndPassword(auth, EMAIL, PASSWORD);
    console.log('Admin user already exists and the password works:', EMAIL);
  } else { console.error(e.code || e); process.exit(1); }
}
process.exit(0);
