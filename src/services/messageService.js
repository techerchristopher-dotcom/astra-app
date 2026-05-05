import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

const messagesCol = (uid) => collection(db, "users", uid, "messages");

export async function addMessage(uid, { role, content }) {
  if (role !== "user" && role !== "assistant") {
    throw new Error(`Invalid role: ${role}`);
  }
  const trimmed = String(content || "").slice(0, 5000);
  return addDoc(messagesCol(uid), {
    role,
    content: trimmed,
    createdAt: serverTimestamp(),
  });
}

export function subscribeMessages(uid, callback, max = 100) {
  const q = query(messagesCol(uid), orderBy("createdAt", "asc"), limit(max));
  return onSnapshot(q, (snap) => {
    const items = [];
    snap.forEach((d) => {
      const data = d.data();
      items.push({
        id: d.id,
        role: data.role,
        content: data.content,
        createdAt: data.createdAt?.toDate?.() || null,
      });
    });
    callback(items);
  });
}
