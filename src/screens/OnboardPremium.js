import { Text, View } from "react-native";
import { C, FONT } from "../theme";
import { GhostButton, GoldButton, LockBadge } from "../components/Buttons";
import ProgressBar from "../components/ProgressBar";
import PulseGlyph from "../components/PulseGlyph";

const LOCKED_FIELDS = ["Heure de naissance (ex : 14h30)", "Ville de naissance"];

export default function OnboardPremium({ onUnlock, onSkip }) {
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
      <ProgressBar total={4} current={3} style={{ marginBottom: 16 }} />

      <View style={{ alignItems: "center" }}>
        <PulseGlyph size={26} color={C.gold} />
        <Text
          style={{
            fontFamily: FONT.serif,
            fontSize: 24,
            color: C.gold,
            marginTop: 6,
          }}
        >
          Astra
        </Text>
      </View>

      <View style={{ alignItems: "center", width: "100%" }}>
        <Text
          style={{
            fontFamily: FONT.serif,
            fontSize: 22,
            color: C.text,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          Pour aller plus loin…
        </Text>
        <Text
          style={{
            color: C.textMuted,
            fontSize: 13,
            fontFamily: FONT.body,
            marginBottom: 24,
            lineHeight: 20,
            textAlign: "center",
          }}
        >
          Ces données révèlent ton thème natal complet.{"\n"}Facultatif, mais puissant.
        </Text>

        {LOCKED_FIELDS.map((ph) => (
          <View
            key={ph}
            style={{
              width: "100%",
              backgroundColor: "rgba(0,0,0,0.2)",
              borderWidth: 1,
              borderColor: C.border,
              borderRadius: 14,
              paddingVertical: 14,
              paddingHorizontal: 16,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ color: C.textFaint, fontSize: 14, fontFamily: FONT.body }}>{ph}</Text>
            <LockBadge>🔒 Premium</LockBadge>
          </View>
        ))}
      </View>

      <View style={{ gap: 10, marginTop: 8 }}>
        <GoldButton onPress={onUnlock}>Débloquer le thème natal — 4,99€/mois</GoldButton>
        <GhostButton onPress={onSkip}>Continuer sans — rester gratuit</GhostButton>
      </View>
    </View>
  );
}
