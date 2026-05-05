import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { C, FONT, TODAY_FR } from "../theme";
import { GhostButton, LockBadge } from "../components/Buttons";
import { callClaude } from "../api/claude";
import { useAuth } from "../contexts/AuthContext";
import { getTodayHoroscope, saveTodayHoroscope } from "../services/horoscopeService";

const FIELDS = ["amour", "travail", "energie", "conseil"];
const SECTIONS = [
  { key: "amour",   icon: "❤️", label: "AMOUR" },
  { key: "travail", icon: "💼", label: "TRAVAIL" },
  { key: "energie", icon: "✨", label: "ÉNERGIE" },
];

function SpinningGlyph() {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);
  const rot = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  return (
    <Animated.Text style={{ fontSize: 40, color: C.gold, transform: [{ rotate: rot }] }}>
      ✦
    </Animated.Text>
  );
}

export default function Horoscope({ sign, name, horoscopeData, setHoroscopeData, go }) {
  const { user } = useAuth();
  const [status, setStatus] = useState(horoscopeData ? "success" : "idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [displayed, setDisplayed] = useState(
    horoscopeData
      ? { ...horoscopeData }
      : { amour: "", travail: "", energie: "", conseil: "" }
  );

  useEffect(() => {
    if (!user?.uid || horoscopeData) return;
    let cancelled = false;
    (async () => {
      const stored = await getTodayHoroscope(user.uid);
      if (!cancelled && stored) {
        setHoroscopeData(stored);
        setDisplayed({
          amour: stored.amour || "",
          travail: stored.travail || "",
          energie: stored.energie || "",
          conseil: stored.conseil || "",
        });
        setStatus("success");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.uid, horoscopeData, setHoroscopeData]);

  async function generate() {
    if (!sign || !user?.uid) return;
    setStatus("loading");
    setErrorMsg("");
    setDisplayed({ amour: "", travail: "", energie: "", conseil: "" });
    try {
      const txt = await callClaude({
        system: `Tu es Astra, une astrologue IA bienveillante, mystérieuse et légèrement directe. Tu parles exclusivement en français.
RÈGLE : Réponds UNIQUEMENT avec du JSON valide, aucun texte avant ou après, aucun backtick.
Format : {"amour":"...","travail":"...","energie":"...","conseil":"...","score":7,"momentCle":"..."}
- Chaque section : 2-3 phrases PRÉCISES, jamais vagues. Mentionne des planètes réelles.
- momentCle : 1 phrase percutante, mystérieuse (style "Tu ressens un tiraillement...")
- score : entier 1-10
- Ton : chaleureux mais direct, jamais alarmiste`,
        messages: [
          {
            role: "user",
            content: `Horoscope du jour pour ${name || "l'utilisateur"}, signe ${sign.name}. Date : ${TODAY_FR}.`,
          },
        ],
      });
      const parsed = JSON.parse(txt.trim());
      setHoroscopeData(parsed);
      setStatus("success");

      saveTodayHoroscope(user.uid, { signe: sign.name, parsed }).catch(() => {});

      let fi = 0;
      const nextField = () => {
        if (fi >= FIELDS.length) return;
        const f = FIELDS[fi];
        const t = parsed[f] || "";
        let i = 0;
        const iv = setInterval(() => {
          i++;
          setDisplayed((p) => ({ ...p, [f]: t.slice(0, i) }));
          if (i >= t.length) {
            clearInterval(iv);
            fi++;
            setTimeout(nextField, 80);
          }
        }, 15);
      };
      nextField();
    } catch (e) {
      setStatus("error");
      setErrorMsg(e?.message || "Erreur de connexion aux astres");
    }
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: C.border,
        }}
      >
        <LinearGradient
          colors={[C.violet, C.violetDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "rgba(124,58,237,0.6)",
          }}
        >
          <Text style={{ fontSize: 22, color: C.text }}>{sign?.glyph || "♏"}</Text>
        </LinearGradient>
        <View>
          <Text style={{ fontFamily: FONT.serif, fontSize: 20, color: C.text }}>
            {sign?.name || "Signe"}
          </Text>
          <Text
            style={{
              color: C.textMuted,
              fontSize: 11,
              fontFamily: FONT.body,
              letterSpacing: 0.8,
            }}
          >
            {TODAY_FR}
          </Text>
        </View>
      </View>

      {status === "idle" && (
        <View style={{ alignItems: "center", paddingVertical: 40 }}>
          <Pressable
            onPress={generate}
            style={({ pressed }) => ({
              backgroundColor: "rgba(124,58,237,0.2)",
              borderWidth: 1.5,
              borderColor: C.violetLight,
              borderRadius: 50,
              paddingVertical: 16,
              paddingHorizontal: 36,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text
              style={{
                fontSize: 15,
                fontFamily: FONT.bodySemi,
                color: C.violetLight,
              }}
            >
              ✨ Générer mon horoscope
            </Text>
          </Pressable>
        </View>
      )}

      {status === "loading" && (
        <View style={{ alignItems: "center", paddingVertical: 48 }}>
          <View style={{ marginBottom: 16 }}>
            <SpinningGlyph />
          </View>
          <Text style={{ color: C.textMuted, fontFamily: FONT.body, fontSize: 13 }}>
            Consultation des astres…
          </Text>
        </View>
      )}

      {status === "error" && (
        <View style={{ alignItems: "center", paddingVertical: 40 }}>
          <Text
            style={{
              color: C.danger,
              fontFamily: FONT.body,
              marginBottom: 16,
              textAlign: "center",
              paddingHorizontal: 16,
            }}
          >
            {errorMsg || "Erreur de connexion aux astres"}
          </Text>
          <View style={{ width: "60%" }}>
            <GhostButton onPress={generate}>Réessayer</GhostButton>
          </View>
        </View>
      )}

      {status === "success" && (
        <>
          {SECTIONS.map((c) => (
            <View
              key={c.key}
              style={{
                backgroundColor: C.bgCard,
                borderWidth: 1,
                borderColor: C.border,
                borderRadius: 16,
                padding: 16,
                marginBottom: 10,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Text style={{ fontSize: 14 }}>{c.icon}</Text>
                <Text
                  style={{
                    color: C.textMuted,
                    fontSize: 10,
                    fontFamily: FONT.bodyBold,
                    letterSpacing: 1.5,
                  }}
                >
                  {c.label}
                </Text>
              </View>
              <Text
                style={{
                  color: C.text,
                  fontSize: 14,
                  fontFamily: FONT.body,
                  lineHeight: 23,
                  minHeight: 36,
                }}
              >
                {displayed[c.key]}
              </Text>
            </View>
          ))}

          <View
            style={{
              backgroundColor: C.bgCard,
              borderWidth: 1,
              borderColor: C.border,
              borderRadius: 16,
              padding: 16,
              marginBottom: 10,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <View style={{ opacity: 0.5 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Text>🪐</Text>
                <Text
                  style={{
                    color: C.textMuted,
                    fontSize: 10,
                    fontFamily: FONT.bodyBold,
                    letterSpacing: 1.5,
                  }}
                >
                  ASCENDANT
                </Text>
              </View>
              <Text style={{ color: C.textMuted, fontSize: 14, fontFamily: FONT.body, lineHeight: 22 }}>
                Ton ascendant influence fortement ta manière d'aborder les défis de cette journée. La
                conjonction avec ta Maison 7 crée une dynamique particulière.
              </Text>
            </View>
            <BlurView
              intensity={28}
              tint="dark"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(7,4,15,0.45)",
              }}
            >
              <LockBadge onPress={() => go("premium")}>
                🔒 Ton ascendant influence ta journée — Débloquer
              </LockBadge>
            </BlurView>
          </View>

          <View
            style={{
              backgroundColor: C.bgCard,
              borderWidth: 1,
              borderColor: C.border,
              borderRadius: 16,
              padding: 16,
              marginBottom: 10,
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
              <Text style={{ fontFamily: FONT.serifBold, fontSize: 24, color: C.gold }}>
                {horoscopeData?.score || 7}
                <Text style={{ fontSize: 13, color: C.textMuted }}>/10</Text>
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                borderRadius: 50,
                height: 6,
                overflow: "hidden",
                marginBottom: 10,
              }}
            >
              <LinearGradient
                colors={[C.violet, C.gold]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: "100%",
                  borderRadius: 50,
                  width: `${((horoscopeData?.score || 7) / 10) * 100}%`,
                }}
              />
            </View>
            {!!displayed.conseil && (
              <Text
                style={{
                  color: C.goldLight,
                  fontSize: 13,
                  fontStyle: "italic",
                  fontFamily: FONT.serif,
                  lineHeight: 19,
                }}
              >
                💫 {displayed.conseil}
              </Text>
            )}
          </View>

          <GhostButton onPress={() => go("chat")}>💬 Poser une question à Astra</GhostButton>
          <Pressable onPress={generate} style={{ paddingVertical: 10, marginTop: 4 }}>
            <Text
              style={{
                color: C.textFaint,
                fontSize: 12,
                fontFamily: FONT.body,
                textAlign: "center",
              }}
            >
              ↺ Régénérer
            </Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}
