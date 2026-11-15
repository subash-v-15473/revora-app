# Revora

Used-car business tracker. Customers browse cars for sale and book a visit; the admin tracks each car from purchase → listing → customer enquiry → payment (cash or bank loan) → sale → RC transfer.

Static page (`index.html`) hosted on GitHub Pages. Data lives in Firebase: Firestore (cars, appointments), Storage (photos), Authentication (the admin login).

## One-time setup

1. Create a Firebase project at https://console.firebase.google.com (free Spark plan is enough).
2. In the project: **Build → Firestore Database → Create database** (production mode, any region).
3. **Build → Storage → Get started** (production mode).
4. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable**.
5. **Project settings (gear) → Your apps → Web (</>)** → register an app → copy the `firebaseConfig` object.
6. Paste it into `firebase-config.js` as `window.REVORA_FIREBASE = { ... };` and push.
7. Deploy the security rules and create the admin user:

```bash
npm install
npx firebase-tools login
npx firebase-tools use <your-project-id>
npx firebase-tools deploy --only firestore:rules,storage
node scripts/setup-admin.js        # creates revoraadmin@revora.com
node scripts/seed.js               # optional: 10 sample cars with photos
```

Admin login: `revoraadmin@revora.com` / `Revora@1` (change it in Firebase Console → Authentication → Users).
