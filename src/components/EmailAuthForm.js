import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { C, FONT } from "../theme";
import { GhostButton, GoldButton } from "./Buttons";
import { useAuth } from "../contexts/AuthContext";

const FRIENDLY_ERRORS = {
  "auth/email-already-in-use": "Cet email est déjà utilisé. Essaie de te connecter à la place.",
  "auth/invalid-email": "Email invalide.",
  "auth/weak-password": "Mot de passe trop faible (6 caractères minimum).",
  "auth/wrong-password": "Mot de passe incorrect.",
  "auth/user-not-found": "Aucun compte associé à cet email.",
  "auth/invalid-credential": "Email ou mot de passe incorrect.",
  "auth/too-many-requests": "Trop de tentatives. Réessaie dans quelques minutes.",
  "auth/credential-already-in-use": "Ce compte existe déjà. Connecte-toi à la place.",
};

function friendlyError(error) {
  const code = error?.code || "";
  return FRIENDLY_ERRORS[code] || error?.message || "Erreur inconnue.";
}

export default function EmailAuthForm({ onClose }) {
  const { isAnonymous, signUpWithEmail, signInWithEmail } = useAuth();

  const [mode, setMode] = useState(isAnonymous ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    setError(null);
    if (!email.trim() || !password) {
      setError("Email et mot de passe requis.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUpWithEmail(email.trim(), password);
      } else {
        await signInWithEmail(email.trim(), password);
      }
      onClose?.();
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }

  const title = mode === "signup"
    ? isAnonymous ? "Sécurise ton compte" : "Crée ton compte"
    : "Se connecter";

  const subtitle = mode === "signup" && isAnonymous
    ? "Tes données actuelles seront conservées et liées à ton email."
    : null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={{
            fontFamily: FONT.serif,
            fontSize: 26,
            color: C.text,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          {title}
        </Text>
        {!!subtitle && (
          <Text
            style={{
              color: C.textMuted,
              fontSize: 13,
              fontFamily: FONT.body,
              textAlign: "center",
              marginBottom: 20,
              lineHeight: 19,
            }}
          >
            {subtitle}
          </Text>
        )}

        <Text
          style={{
            color: C.textMuted,
            fontSize: 11,
            fontFamily: FONT.bodyBold,
            letterSpacing: 1.2,
            marginBottom: 6,
            marginTop: 12,
          }}
        >
          EMAIL
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="ton@email.com"
          placeholderTextColor={C.textFaint}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          editable={!loading}
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            borderWidth: 1,
            borderColor: C.border,
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 16,
            color: C.text,
            fontSize: 15,
            fontFamily: FONT.body,
            marginBottom: 12,
          }}
        />

        <Text
          style={{
            color: C.textMuted,
            fontSize: 11,
            fontFamily: FONT.bodyBold,
            letterSpacing: 1.2,
            marginBottom: 6,
          }}
        >
          MOT DE PASSE
        </Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={C.textFaint}
          secureTextEntry
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          editable={!loading}
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            borderWidth: 1,
            borderColor: C.border,
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 16,
            color: C.text,
            fontSize: 15,
            fontFamily: FONT.body,
            marginBottom: 12,
          }}
        />

        {!!error && (
          <View
            style={{
              backgroundColor: "rgba(248,113,113,0.12)",
              borderWidth: 1,
              borderColor: "rgba(248,113,113,0.4)",
              borderRadius: 10,
              padding: 12,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: C.danger, fontSize: 13, fontFamily: FONT.body }}>
              {error}
            </Text>
          </View>
        )}

        <View style={{ marginTop: 8 }}>
          <GoldButton onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#1a0900" />
            ) : mode === "signup" ? (
              "Créer mon compte"
            ) : (
              "Me connecter"
            )}
          </GoldButton>
        </View>

        <Pressable
          onPress={() => {
            setError(null);
            setMode((m) => (m === "signup" ? "login" : "signup"));
          }}
          disabled={loading}
          style={{ alignSelf: "center", marginTop: 16, padding: 8 }}
        >
          <Text style={{ color: C.violetLight, fontSize: 13, fontFamily: FONT.body }}>
            {mode === "signup"
              ? "J'ai déjà un compte → Me connecter"
              : "Pas encore de compte ? → Créer un compte"}
          </Text>
        </Pressable>

        {!!onClose && (
          <View style={{ marginTop: 20 }}>
            <GhostButton onPress={onClose} disabled={loading}>
              Annuler
            </GhostButton>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
