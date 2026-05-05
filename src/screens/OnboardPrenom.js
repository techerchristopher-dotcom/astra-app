import { useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { C, FONT } from "../theme";
import { GoldButton } from "../components/Buttons";
import ProgressBar from "../components/ProgressBar";
import PulseGlyph from "../components/PulseGlyph";
import { useAuth } from "../contexts/AuthContext";

export default function OnboardPrenom() {
  const { updateProfile } = useAuth();
  const [name, setName] = useState("");
  const [focused, setFocused] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    setError(null);
    try {
      await updateProfile({ prenom: trimmed });
    } catch (e) {
      setError(e?.message || "Impossible de sauvegarder. Réessaie.");
      setSaving(false);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
        justifyContent: "space-between",
      }}
    >
      <ProgressBar total={4} current={0} />

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 24 }}>
        <PulseGlyph size={40} color={C.gold} />
        <Text style={{ fontFamily: FONT.serif, fontSize: 36, color: C.gold, letterSpacing: 1 }}>
          Astra
        </Text>
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              fontFamily: FONT.serif,
              fontSize: 26,
              color: C.text,
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Comment tu t'appelles ?
          </Text>
          <Text
            style={{
              color: C.textMuted,
              fontSize: 14,
              fontFamily: FONT.body,
              lineHeight: 21,
              textAlign: "center",
            }}
          >
            Astra te parle directement — pas à n'importe qui.
          </Text>
        </View>
        <TextInput
          value={name}
          onChangeText={setName}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={handleSubmit}
          placeholder="Ton prénom"
          placeholderTextColor={C.textFaint}
          autoFocus
          editable={!saving}
          returnKeyType="done"
          maxLength={40}
          style={{
            width: "100%",
            backgroundColor: "rgba(124,58,237,0.12)",
            borderWidth: 1,
            borderColor: focused || name ? C.violetLight : C.border,
            borderRadius: 16,
            paddingVertical: 16,
            paddingHorizontal: 20,
            color: C.text,
            fontSize: 16,
            fontFamily: FONT.serif,
            textAlign: "center",
          }}
        />
        {!!error && (
          <Text style={{ color: C.danger, fontSize: 12, fontFamily: FONT.body, textAlign: "center" }}>
            {error}
          </Text>
        )}
      </View>

      <GoldButton disabled={!name.trim() || saving} onPress={handleSubmit}>
        {saving ? <ActivityIndicator size="small" color="#1a0900" /> : "Continuer →"}
      </GoldButton>
    </View>
  );
}
