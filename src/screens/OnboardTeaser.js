import { Text, View } from "react-native";
import { C, FONT } from "../theme";
import { GhostButton, GoldButton } from "../components/Buttons";
import ProgressBar from "../components/ProgressBar";
import PulseGlyph from "../components/PulseGlyph";

export default function OnboardTeaser({ sign, onNext, onSkip }) {
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
      <ProgressBar total={4} current={2} style={{ marginBottom: 16 }} />

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
      </View>

      <View
        style={{
          backgroundColor: "rgba(124,58,237,0.1)",
          borderWidth: 1,
          borderColor: C.border,
          borderRadius: 20,
          padding: 24,
          alignItems: "center",
          width: "100%",
        }}
      >
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 12,
            marginBottom: 16,
            backgroundColor: "#1a0a3a",
            borderWidth: 1,
            borderColor: C.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 32 }}>🌌</Text>
        </View>
        <Text
          style={{
            fontFamily: FONT.serif,
            fontSize: 20,
            color: C.text,
            fontStyle: "italic",
            lineHeight: 28,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Ton profil est plus complexe qu'il n'y paraît…
        </Text>
        <Text
          style={{
            color: C.textMuted,
            fontSize: 13,
            fontFamily: FONT.body,
            lineHeight: 21,
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          En tant que{" "}
          <Text style={{ color: C.violetLight, fontFamily: FONT.bodySemi }}>{sign?.name}</Text>, tu
          portes une énergie particulière — mais ce n'est que la surface. Ton ascendant, ta Lune, ta
          Maison 7… influencent ta journée sans que tu t'en rendes compte.
        </Text>
        <View
          style={{
            backgroundColor: "rgba(0,0,0,0.25)",
            borderWidth: 1,
            borderColor: C.border,
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Text style={{ fontSize: 18 }}>🔒</Text>
          <Text
            style={{
              flex: 1,
              color: C.textMuted,
              fontSize: 12,
              fontFamily: FONT.body,
              lineHeight: 17,
            }}
          >
            Heure et lieu de naissance · débloque ton thème natal complet avec{" "}
            <Text style={{ color: C.gold }}>Astra Premium</Text>
          </Text>
        </View>
      </View>

      <View style={{ gap: 10, marginTop: 16 }}>
        <GoldButton onPress={onNext}>Je veux en savoir plus</GoldButton>
        <GhostButton onPress={onSkip}>Plus tard</GhostButton>
      </View>
    </View>
  );
}
