import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

const horoscopesCol = (uid) => collection(db, "users", uid, "horoscopes");

function todayId() {
  return new Date().toISOString().split("T")[0];
}

export async function getTodayHoroscope(uid) {
  const id = todayId();
  const snap = await getDoc(doc(horoscopesCol(uid), id));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (typeof data.content === "string") {
    try {
      return { id, ...data, ...JSON.parse(data.content) };
    } catch {
      return { id, ...data };
    }
  }
  return { id, ...data };
}

export async function saveTodayHoroscope(uid, { signe, parsed }) {
  const id = todayId();
  await setDoc(doc(horoscopesCol(uid), id), {
    signe,
    content: JSON.stringify(parsed),
    score: typeof parsed?.score === "number" ? parsed.score : null,
    momentCle: parsed?.momentCle || null,
    createdAt: serverTimestamp(),
  });
}

export async function getHoroscopeStats(uid) {
  try {
    const countSnap = await getCountFromServer(horoscopesCol(uid));
    const count = countSnap.data().count;

    const recentQ = query(horoscopesCol(uid), orderBy("createdAt", "desc"), limit(30));
    const recent = await getDocs(recentQ);
    let total = 0;
    let n = 0;
    recent.forEach((d) => {
      const score = d.data().score;
      if (typeof score === "number") {
        total += score;
        n++;
      }
    });
    const avgScore = n > 0 ? parseFloat((total / n).toFixed(1)) : null;
    return { count, avgScore };
  } catch (e) {
    return { count: 0, avgScore: null };
  }
}
