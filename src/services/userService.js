import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

const userRef = (uid) => doc(db, "users", uid);

export async function ensureUserDoc(uid, { email = null } = {}) {
  const ref = userRef(uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid,
      prenom: "",
      signe: null,
      isPremium: false,
      email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    const created = await getDoc(ref);
    return created.data();
  }
  return snap.data();
}

export function subscribeUser(uid, callback) {
  return onSnapshot(userRef(uid), (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}

export async function updateUserProfile(uid, patch) {
  const allowed = ["prenom", "signe", "email"];
  const data = { updatedAt: serverTimestamp() };
  for (const k of allowed) {
    if (patch[k] !== undefined) data[k] = patch[k];
  }
  await updateDoc(userRef(uid), data);
}
