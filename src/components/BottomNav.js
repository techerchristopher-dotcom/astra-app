import { Pressable, Text, View } from "react-native";
import { C, FONT } from "../theme";

const TABS = [
  { id: "home",      icon: "✦",  label: "Accueil" },
  { id: "horoscope", icon: "🌙", label: "Horoscope" },
  { id: "chat",      icon: "💬", label: "Chat" },
  { id: "premium",   icon: "⭐", label: "Premium" },
  { id: "profil",    icon: null, label: "Profil" },
];

export default function BottomNav({ active, go, sign, bottomInset = 0 }) {
  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(7,4,15,0.95)",
        borderTopWidth: 1,
        borderTopColor: C.border,
        flexDirection: "row",
        justifyContent: "space-around",
        paddingTop: 10,
        paddingBottom: 10 + bottomInset,
        zIndex: 10,
      }}
    >
      {TABS.map((t) => {
        const on = active === t.id;
        const icon = t.id === "profil" ? sign?.glyph || "♏" : t.icon;
        return (
          <Pressable
            key={t.id}
            onPress={() => go(t.id)}
            style={{
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              paddingHorizontal: 6,
            }}
          >
            <Text style={{ fontSize: on ? 22 : 19, color: on ? C.gold : C.textMuted }}>
              {icon}
            </Text>
            <Text
              style={{
                fontFamily: on ? FONT.bodyBold : FONT.body,
                fontSize: 9,
                color: on ? C.gold : C.textMuted,
              }}
            >
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
