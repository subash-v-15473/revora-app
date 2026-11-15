import { readFileSync } from 'node:fs';
// Reads window.REVORA_FIREBASE from firebase-config.js without a browser.
const src = readFileSync(new URL('../firebase-config.js', import.meta.url), 'utf8');
const window = {};
new Function('window', src)(window);
if (!window.REVORA_FIREBASE) { console.error('firebase-config.js is still empty. Paste your Firebase config first.'); process.exit(1); }
export const config = window.REVORA_FIREBASE;
