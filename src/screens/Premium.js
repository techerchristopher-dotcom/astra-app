import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { C, FONT } from "../theme";
import { GoldButton } from "../components/Buttons";

const FEATURES = [
  {
    icon: "🔮",
    title: "Thème natal complet",
    desc: "Ascendant, Lune, Maison 7… révèle qui tu es vraiment, pas juste ton signe.",
  },
  {
    icon: "💬",
    title: "Chat IA illimité",
    desc: "Parle à Astra autant que tu veux. Sans limite. Sans jugement.",
  },
  {
    icon: "🧿",
    title: "Analyse émotionnelle profonde",
    desc: "Comprends pourquoi tu te sens comme ça — chaque jour, pas des platitudes.",
  },
  {
    icon: "💝",
    title: "Compatibilité avancée",
    desc: "Va au-delà du signe solaire. Analyse multi-planètes avec n'importe qui.",
  },
];

const PLANS = [
  { id: "mensuel", label: "MENSUEL", price: "4,99", sub: "/mois", badge: null, extra: null },
  {
    id: "annuel",
    label: "ANNUEL",
    price: "3,33",
    sub: "/mois · 39,99€/an",
    badge: "2 mois offerts",
    extra: "Économise 20%",
  },
];

const TRUST = ["🔒 Paiement sécurisé", "🔄 Annulable en 2 clics", "🚫 Zéro piège"];

export default function Premium() {
  const [plan, setPlan] = useState("annuel");

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
    >
      <Text style={{ fontFamily: FONT.serif, fontSize: 24, color: C.text, marginBottom: 8 }}>
        Va au fond de qui tu es
      </Text>
      <Text
        style={{
          color: C.textMuted,
          fontSize: 13,
          fontFamily: FONT.body,
          lineHeight: 21,
          marginBottom: 20,
        }}
      >
        Ton signe solaire n'est que la surface. Astra Premium révèle la totalité de ton profil
        astral — et pourquoi certaines choses ne font que se répéter dans ta vie.
      </Text>

      {FEATURES.map((f) => (
        <View
          key={f.title}
          style={{
            flexDirection: "row",
            gap: 14,
            backgroundColor: C.bgCard,
            borderWidth: 1,
            borderColor: C.border,
            borderRadius: 16,
            padding: 16,
            marginBottom: 10,
          }}
        >
          <Text style={{ fontSize: 24 }}>{f.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: C.text,
                fontFamily: FONT.bodyBold,
                fontSize: 14,
                marginBottom: 3,
              }}
            >
              {f.title}
            </Text>
            <Text
              style={{
                color: C.textMuted,
                fontFamily: FONT.body,
                fontSize: 12,
                lineHeight: 19,
              }}
            >
              {f.desc}
            </Text>
          </View>
        </View>
      ))}

      <View style={{ flexDirection: "row", gap: 10, marginTop: 12, marginBottom: 16 }}>
        {PLANS.map((p) => {
          const on = plan === p.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => setPlan(p.id)}
              style={{
                flex: 1,
                backgroundColor: on ? "rgba(245,193,66,0.08)" : C.bgCard,
                borderWidth: on ? 2 : 1,
                borderColor: on ? C.gold : C.border,
                borderRadius: 16,
                paddingVertical: 16,
                paddingHorizontal: 12,
                alignItems: "center",
                position: "relative",
              }}
            >
              {!!p.badge && (
                <View
                  style={{
                    position: "absolute",
                    top: -10,
                    backgroundColor: C.gold,
                    paddingVertical: 3,
                    paddingHorizontal: 10,
                    borderRadius: 20,
                  }}
                >
                  <Text style={{ color: "#1a0900", fontSize: 10, fontFamily: FONT.bodyBold }}>
                    {p.badge}
                  </Text>
                </View>
              )}
              <Text
                style={{
                  color: C.textMuted,
                  fontSize: 10,
                  fontFamily: FONT.bodyBold,
                  letterSpacing: 1.5,
                  marginBottom: 6,
                }}
              >
                {p.label}
              </Text>
              <Text
                style={{
                  fontFamily: FONT.serifBold,
                  fontSize: 28,
                  color: on ? C.gold : C.text,
                }}
              >
                {p.price}
                <Text style={{ fontSize: 14, color: C.textMuted }}>€</Text>
              </Text>
              <Text style={{ color: C.textMuted, fontSize: 10, fontFamily: FONT.body, marginTop: 2 }}>
                {p.sub}
              </Text>
              {!!p.extra && (
                <Text
                  style={{
                    color: C.gold,
                    fontSize: 11,
                    fontFamily: FONT.bodyBold,
                    marginTop: 4,
                  }}
                >
                  {p.extra}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {TRUST.map((b) => (
          <Text key={b} style={{ color: C.textMuted, fontSize: 10, fontFamily: FONT.body }}>
            {b}
          </Text>
        ))}
      </View>

      <View style={{ marginBottom: 10 }}>
        <GoldButton>Commencer à {plan === "annuel" ? "3,33" : "4,99"}€/mois ✦</GoldButton>
      </View>
      <Text
        style={{
          color: C.textFaint,
          fontSize: 10,
          fontFamily: FONT.body,
          textAlign: "center",
          lineHeight: 15,
        }}
      >
        Pas de CB pré-cochée. Pas d'arnaque. Annulable quand tu veux depuis ton profil — en 2 clics,
        promis.
      </Text>
    </ScrollView>
  );
}
