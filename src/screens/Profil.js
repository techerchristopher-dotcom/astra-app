import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { C, FONT } from "../theme";
import { GhostButton, GoldButton, LockBadge } from "../components/Buttons";
import { useAuth } from "../contexts/AuthContext";
import { getHoroscopeStats } from "../services/horoscopeService";
import EmailAuthForm from "../components/EmailAuthForm";

const LOCKED = [
  "Signe ascendant",
  "Lune natale",
  "Maison 7",
  "Planète dominante",
  "Thème natal PDF",
];

export default function Profil({ sign, name, go }) {
  const { user, profile, isAnonymous, signOut } = useAuth();
  const [stats, setStats] = useState({ count: 0, avgScore: null });
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    getHoroscopeStats(user.uid).then((s) => {
      if (!cancelled) setStats(s);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const isPremium = !!profile?.isPremium;
  const streak = Math.max(0, Math.min(stats.count, 99));
  const avgDisplay = stats.avgScore != null ? stats.avgScore : "—";

  const baseRows = [
    { l: "Signe solaire", v: `${sign?.name || "—"} ${sign?.glyph || ""}` },
    { l: "Élément", v: sign?.el || "—" },
    { l: "Planète", v: sign?.planet || "—" },
    { l: "Période", v: sign?.dates || "—" },
  ];

  const statTiles = [
    { v: streak, l: "STREAK" },
    { v: stats.count, l: "HOROSCOPES" },
    { v: avgDisplay, l: "SCORE MOY." },
  ];

  return (
    <>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
      >
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <LinearGradient
            colors={[C.violet, C.violetDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: "rgba(124,58,237,0.6)",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 36, color: C.text }}>{sign?.glyph || "♏"}</Text>
          </LinearGradient>
          {!!name && (
            <Text style={{ color: C.text, fontFamily: FONT.serif, fontSize: 18, marginBottom: 2 }}>
              {name}
            </Text>
          )}
          <Text style={{ color: C.textMuted, fontSize: 13, fontFamily: FONT.body }}>
            {sign?.name || "—"} · {sign?.el || "—"}
          </Text>
          {!!user?.email && (
            <Text style={{ color: C.violetLight, fontSize: 12, fontFamily: FONT.body, marginTop: 4 }}>
              {user.email}
            </Text>
          )}
          {isPremium && (
            <View
              style={{
                marginTop: 8,
                backgroundColor: "rgba(245,193,66,0.18)",
                borderWidth: 1,
                borderColor: "rgba(245,193,66,0.5)",
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 4,
              }}
            >
              <Text style={{ fontFamily: FONT.bodyBold, fontSize: 11, color: C.gold }}>
                ✦ PREMIUM
              </Text>
            </View>
          )}
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
          {statTiles.map((s) => (
            <View
              key={s.l}
              style={{
                flex: 1,
                backgroundColor: C.bgCard,
                borderWidth: 1,
                borderColor: C.border,
                borderRadius: 16,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: FONT.serifBold,
                  fontSize: 24,
                  color: C.gold,
                  marginBottom: 2,
                }}
              >
                {s.v}
              </Text>
              <Text
                style={{
                  color: C.textMuted,
                  fontSize: 9,
                  fontFamily: FONT.bodyBold,
                  letterSpacing: 1,
                }}
              >
                {s.l}
              </Text>
            </View>
          ))}
        </View>

        <Text
          style={{
            color: C.textMuted,
            fontSize: 10,
            fontFamily: FONT.bodyBold,
            letterSpacing: 1.5,
            marginBottom: 8,
          }}
        >
          PROFIL DE BASE · GRATUIT
        </Text>
        <View
          style={{
            backgroundColor: C.bgCard,
            borderWidth: 1,
            borderColor: C.border,
            borderRadius: 16,
            paddingHorizontal: 16,
            marginBottom: 16,
          }}
        >
          {baseRows.map((r, i) => (
            <View
              key={r.l}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 10,
                borderTopWidth: i > 0 ? 1 : 0,
                borderTopColor: C.border,
              }}
            >
              <Text style={{ color: C.textMuted, fontSize: 13, fontFamily: FONT.body }}>{r.l}</Text>
              <Text style={{ color: C.text, fontSize: 13, fontFamily: FONT.bodySemi }}>{r.v}</Text>
            </View>
          ))}
        </View>

        <Text
          style={{
            color: C.textMuted,
            fontSize: 10,
            fontFamily: FONT.bodyBold,
            letterSpacing: 1.5,
            marginBottom: 8,
          }}
        >
          PROFIL COMPLET · PREMIUM
        </Text>
        <View
          style={{
            backgroundColor: C.bgCard,
            borderWidth: 1,
            borderColor: C.border,
            borderRadius: 16,
            paddingHorizontal: 16,
            marginBottom: 16,
          }}
        >
          {LOCKED.map((label, i) => (
            <View
              key={label}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 10,
                borderTopWidth: i > 0 ? 1 : 0,
                borderTopColor: C.border,
              }}
            >
              <Text style={{ color: C.textFaint, fontSize: 13, fontFamily: FONT.body }}>{label}</Text>
              <LockBadge onPress={() => go("premium")} textStyle={{ fontSize: 10 }}>
                🔒 Débloquer
              </LockBadge>
            </View>
          ))}
        </View>

        {!isPremium && (
          <View style={{ marginBottom: 10 }}>
            <GoldButton onPress={() => go("premium")}>Débloquer mon profil complet ✦</GoldButton>
          </View>
        )}

        <Text
          style={{
            color: C.textMuted,
            fontSize: 10,
            fontFamily: FONT.bodyBold,
            letterSpacing: 1.5,
            marginTop: 16,
            marginBottom: 8,
          }}
        >
          COMPTE
        </Text>

        {isAnonymous ? (
          <View style={{ marginBottom: 8 }}>
            <GhostButton
              onPress={() => setShowAuthModal(true)}
              textStyle={{ color: C.text, fontFamily: FONT.bodySemi }}
            >
              🔐 Sécuriser mon compte (Email)
            </GhostButton>
            <Text
              style={{
                color: C.textFaint,
                fontSize: 11,
                fontFamily: FONT.body,
                textAlign: "center",
                marginTop: 6,
                lineHeight: 16,
              }}
            >
              Tu navigues en mode invité. Ajoute un email pour retrouver tes données sur un autre
              appareil.
            </Text>
          </View>
        ) : (
          <View style={{ marginBottom: 8 }}>
            <GhostButton onPress={signOut}>Se déconnecter</GhostButton>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showAuthModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAuthModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(2,1,10,0.85)", justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: C.bgPage,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderTopWidth: 1,
              borderTopColor: C.border,
              maxHeight: "85%",
            }}
          >
            <Pressable
              onPress={() => setShowAuthModal(false)}
              style={{
                alignSelf: "center",
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: C.border,
                marginTop: 10,
                marginBottom: 4,
              }}
            />
            <EmailAuthForm onClose={() => setShowAuthModal(false)} />
          </View>
        </View>
      </Modal>
    </>
  );
}
