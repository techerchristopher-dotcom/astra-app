import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { C, FONT, TODAY_FR } from "../theme";
import { LockBadge, PremiumBadge } from "../components/Buttons";
import { useAuth } from "../contexts/AuthContext";
import { getHoroscopeStats } from "../services/horoscopeService";

const DAY_LETTERS = ["L", "M", "M", "J", "V", "S", "D"];

export default function Home({ name, sign, go, horoscopeData, momentCle }) {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ count: 0, avgScore: null });

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

  const streak = Math.max(1, Math.min(stats.count, 7));
  const score = horoscopeData?.score || 7;
  const todayIdx = (new Date().getDay() + 6) % 7;
  const isPremium = !!profile?.isPremium;

  const actions = [
    {
      icon: "🌙",
      title: "Horoscope du jour",
      sub: `Généré par IA · ${sign?.name || "ton signe"}`,
      nav: "horoscope",
      lock: false,
    },
    {
      icon: "💬",
      title: "Poser une question",
      sub: isPremium ? "Chat illimité" : "1 message gratuit / jour",
      nav: "chat",
      lock: false,
    },
    { icon: "🪐", title: "Compatibilité avancée", sub: null, nav: "premium", lock: !isPremium },
    { icon: "🔮", title: "Thème natal complet", sub: null, nav: "premium", lock: !isPremium },
  ];

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <View>
          <Text
            style={{
              color: C.textMuted,
              fontSize: 11,
              fontFamily: FONT.body,
              letterSpacing: 1,
              marginBottom: 2,
            }}
          >
            {TODAY_FR}
          </Text>
          <Text style={{ fontFamily: FONT.serif, fontSize: 28, color: C.text }}>
            Bonjour, <Text style={{ color: C.gold }}>✦</Text>
          </Text>
          {!!name && (
            <Text style={{ color: C.violetLight, fontSize: 14, fontFamily: FONT.body }}>
              {name}
            </Text>
          )}
        </View>
        {isPremium ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: "rgba(245,193,66,0.18)",
              borderWidth: 1,
              borderColor: "rgba(245,193,66,0.5)",
              borderRadius: 20,
              paddingHorizontal: 10,
              paddingVertical: 3,
            }}
          >
            <Text style={{ fontFamily: FONT.bodyBold, fontSize: 11, color: C.gold }}>
              ✦ PREMIUM
            </Text>
          </View>
        ) : (
          <PremiumBadge onPress={() => go("premium")} />
        )}
      </View>

      <View
        style={{
          backgroundColor: C.bgCard,
          borderWidth: 1,
          borderColor: C.border,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={{ fontSize: 22 }}>🔥</Text>
          <View>
            <Text style={{ fontFamily: FONT.serifBold, fontSize: 28, color: C.gold }}>
              {streak}
            </Text>
            <Text
              style={{
                color: C.textMuted,
                fontSize: 11,
                fontFamily: FONT.body,
                marginTop: -2,
              }}
            >
              jours consécutifs
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {DAY_LETTERS.map((l, i) => (
            <View
              key={i}
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                backgroundColor:
                  i <= todayIdx ? "rgba(245,193,66,0.2)" : "rgba(255,255,255,0.04)",
                borderWidth: 1,
                borderColor: i <= todayIdx ? C.gold : C.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 9,
                  fontFamily: FONT.bodyBold,
                  color: i === todayIdx ? C.gold : i < todayIdx ? C.goldDeep : C.textFaint,
                }}
              >
                {l}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View
        style={{
          backgroundColor: "rgba(124,58,237,0.12)",
          borderWidth: 1,
          borderColor: "rgba(124,58,237,0.3)",
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            color: C.violetLight,
            fontSize: 10,
            fontFamily: FONT.bodyBold,
            letterSpacing: 1.5,
            marginBottom: 8,
          }}
        >
          ● MOMENT CLÉ DU JOUR
        </Text>
        <Text
          style={{
            fontFamily: FONT.serif,
            fontSize: 16,
            color: C.text,
            fontStyle: "italic",
            lineHeight: 25,
          }}
        >
          "
          {momentCle ||
            `Tu ressens un tiraillement intérieur aujourd'hui… et ce n'est pas un hasard. Ton signe traverse une période charnière.`}
          "
        </Text>
      </View>

      <View
        style={{
          backgroundColor: C.bgCard,
          borderWidth: 1,
          borderColor: C.border,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 10,
          }}
        >
          <Text
            style={{
              color: C.textMuted,
              fontSize: 10,
              fontFamily: FONT.bodyBold,
              letterSpacing: 1.5,
            }}
          >
            SCORE DU JOUR
          </Text>
          <Text style={{ fontFamily: FONT.serifBold, fontSize: 26, color: C.gold }}>
            {score}
            <Text style={{ fontSize: 14, color: C.textMuted }}>/10</Text>
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 4 }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 28,
                borderRadius: 6,
                backgroundColor:
                  i < score
                    ? i === score - 1
                      ? C.gold
                      : `rgba(124,58,237,${0.4 + i * 0.05})`
                    : "rgba(255,255,255,0.05)",
              }}
            />
          ))}
        </View>
      </View>

      {actions.map((a) => (
        <Pressable
          key={a.title}
          onPress={() => go(a.nav)}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            backgroundColor: pressed ? C.bgCardHover : C.bgCard,
            borderWidth: 1,
            borderColor: pressed ? "rgba(124,58,237,0.45)" : C.border,
            borderRadius: 14,
            paddingVertical: 14,
            paddingHorizontal: 16,
            marginBottom: 8,
          })}
        >
          <Text style={{ fontSize: 22 }}>{a.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: C.text,
                fontSize: 14,
                fontFamily: FONT.bodySemi,
                marginBottom: 2,
              }}
            >
              {a.title}
            </Text>
            {!!a.sub && (
              <Text style={{ color: C.textMuted, fontSize: 12, fontFamily: FONT.body }}>
                {a.sub}
              </Text>
            )}
            {a.lock && (
              <View style={{ marginTop: 4 }}>
                <LockBadge>🔒 Premium</LockBadge>
              </View>
            )}
          </View>
          <Text style={{ color: C.textFaint, fontSize: 14 }}>›</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
