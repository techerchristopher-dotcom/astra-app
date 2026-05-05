import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  linkWithCredential,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "../config/firebase";
import { ensureUserDoc, subscribeUser, updateUserProfile } from "../services/userService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const profileUnsubRef = useRef(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setAuthError(
        "Firebase n'est pas configuré. Crée un fichier .env à la racine avec les EXPO_PUBLIC_FIREBASE_* depuis ta console Firebase."
      );
      setLoading(false);
      return;
    }

    let cancelled = false;

    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (cancelled) return;

      if (profileUnsubRef.current) {
        profileUnsubRef.current();
        profileUnsubRef.current = null;
      }

      if (!fbUser) {
        try {
          await signInAnonymously(auth);
        } catch (e) {
          setAuthError(`Auth anonyme échouée : ${e?.message || e}`);
          setLoading(false);
        }
        return;
      }

      setUser(fbUser);

      try {
        await ensureUserDoc(fbUser.uid, { email: fbUser.email || null });
      } catch (e) {
        setAuthError(`Création profil échouée : ${e?.message || e}`);
        setLoading(false);
        return;
      }

      profileUnsubRef.current = subscribeUser(fbUser.uid, (data) => {
        setProfile(data);
        setLoading(false);
      });
    });

    return () => {
      cancelled = true;
      unsubAuth();
      if (profileUnsubRef.current) profileUnsubRef.current();
    };
  }, []);

  async function updateProfile(patch) {
    if (!user) throw new Error("Aucun utilisateur connecté");
    await updateUserProfile(user.uid, patch);
  }

  async function signUpWithEmail(email, password) {
    if (!user) throw new Error("Aucun utilisateur connecté");
    if (user.isAnonymous) {
      const credential = EmailAuthProvider.credential(email, password);
      const result = await linkWithCredential(user, credential);
      await updateUserProfile(result.user.uid, { email: result.user.email });
      return result.user;
    }
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  }

  async function signInWithEmail(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  }

  async function signOut() {
    await fbSignOut(auth);
  }

  const value = {
    user,
    profile,
    loading,
    authError,
    isAnonymous: user?.isAnonymous ?? true,
    isAuthenticated: Boolean(user) && !user?.isAnonymous,
    updateProfile,
    signUpWithEmail,
    signInWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}
