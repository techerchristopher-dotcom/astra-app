import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { C, FONT } from "../theme";
import { SIGNS } from "../data/signs";
import { GoldButton } from "../components/Buttons";
import ProgressBar from "../components/ProgressBar";
import PulseGlyph from "../components/PulseGlyph";
import { useAuth } from "../contexts/AuthContext";

export default function OnboardSigne() {
  const { updateProfile } = useAuth();
  const [sel, setSel] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    if (!sel) return;
    setSaving(true);
    setError(null);
    try {
      await updateProfile({ signe: sel.name });
    } catch (e) {
      setError(e?.message || "Impossible de sauvegarder. Réessaie.");
      setSaving(false);
    }
  }

  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}>
      <ProgressBar total={4} current={1} style={{ marginBottom: 16 }} />

      <View style={{ alignItems: "center", marginBottom: 16 }}>
        <PulseGlyph size={28} color={C.gold} />
        <Text
          style={{
            fontFamily: FONT.serif,
            fontSize: 26,
            color: C.gold,
            marginTop: 8,
            marginBottom: 12,
          }}
        >
          Astra
        </Text>
        <Text
          style={{
            fontFamily: FONT.serif,
            fontSize: 22,
            color: C.text,
            marginBottom: 4,
            textAlign: "center",
          }}
        >
          Ton signe du zodiaque ?
        </Text>
        <Text style={{ color: C.textMuted, fontSize: 13, fontFamily: FONT.body, textAlign: "center" }}>
          La base de ton profil astral personnel.
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          paddingBottom: 8,
        }}
      >
        {SIGNS.map((s) => {
          const on = sel?.name === s.name;
          return (
            <Pressable
              key={s.name}
              onPress={() => setSel(s)}
              disabled={saving}
              style={{
                width: "23.5%",
                backgroundColor: on ? "rgba(124,58,237,0.3)" : C.bgCard,
                borderWidth: 1.5,
                borderColor: on ? C.violetLight : C.border,
                borderRadius: 14,
                paddingVertical: 12,
                paddingHorizontal: 6,
                alignItems: "center",
                gap: 4,
              }}
            >
              <LinearGradient
                colors={[C.violet, C.violetDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(124,58,237,0.5)",
                }}
              >
                <Text style={{ fontSize: 22, color: C.text }}>{s.glyph}</Text>
              </LinearGradient>
              <Text
                style={{
                  fontSize: 9,
                  fontFamily: FONT.bodyBold,
                  color: on ? C.violetLight : C.textMuted,
                  letterSpacing: 0.8,
                }}
              >
                {s.name.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {!!error && (
        <Text
          style={{
            color: C.danger,
            fontSize: 12,
            fontFamily: FONT.body,
            textAlign: "center",
            marginTop: 8,
          }}
        >
          {error}
        </Text>
      )}

      <View style={{ paddingTop: 12 }}>
        <GoldButton disabled={!sel || saving} onPress={handleSubmit}>
          {saving ? <ActivityIndicator size="small" color="#1a0900" /> : "Confirmer mon signe"}
        </GoldButton>
      </View>
    </View>
  );
}
