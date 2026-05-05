import { useEffect, useRef, useState } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import { C, FONT, TODAY_FR } from "../theme";
import { GoldButton, PremiumBadge } from "../components/Buttons";
import { callClaude } from "../api/claude";
import { useAuth } from "../contexts/AuthContext";
import { addMessage, subscribeMessages } from "../services/messageService";

const SUGGESTIONS = [
  "Cette semaine propice pour changer de job ?",
  "Suis-je compatible avec un Scorpion ?",
  "Mon avenir amoureux ce mois-ci ?",
];

const FREE_LIMIT = 1;

const WELCOME = {
  role: "assistant",
  content: "Bonjour ✨ Je suis là. Qu'est-ce qui te pèse ou te questionne aujourd'hui ?",
};

function isToday(date) {
  if (!(date instanceof Date)) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export default function Chat({ sign, name, go }) {
  const { user, profile } = useAuth();
  const isPremium = !!profile?.isPremium;

  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeMessages(user.uid, (items) => {
      setHistory(items);
      if (items.length > 0) setShowSuggestions(false);
    });
    return unsub;
  }, [user?.uid]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [history, typing]);

  const todayUserCount = history.filter(
    (m) => m.role === "user" && isToday(m.createdAt)
  ).length;

  const remainingFreeToday = isPremium ? Infinity : Math.max(0, FREE_LIMIT - todayUserCount);
  const reachedLimit = remainingFreeToday <= 0;

  async function send(text) {
    if (!user?.uid) return;
    if (!text.trim() || loading) return;
    if (reachedLimit) {
      go("premium");
      return;
    }
    setShowSuggestions(false);
    const trimmed = text.trim();
    setInput("");
    setLoading(true);

    try {
      await addMessage(user.uid, { role: "user", content: trimmed });
    } catch (e) {
      setLoading(false);
      return;
    }

    const allMessages = [WELCOME, ...history, { role: "user", content: trimmed }].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const reply = await callClaude({
        system: `Tu es Astra, une astrologue IA francophone, mystérieuse, bienveillante et légèrement directe.
${sign ? `L'utilisateur est ${sign.name}.` : ""} Nous sommes le ${TODAY_FR}.
Réponds en français. Maximum 100 mots. Direct et personnel. Commence par une phrase d'accroche liée à son signe.
Style : émotionnellement intelligent, jamais banal, jamais vague.`,
        messages: allMessages,
      });
      const finalReply = reply || "Les astres sont silencieux…";

      let i = 0;
      setTyping("");
      const iv = setInterval(() => {
        i++;
        setTyping(finalReply.slice(0, i));
        if (i >= finalReply.length) {
          clearInterval(iv);
          setTyping("");
          addMessage(user.uid, { role: "assistant", content: finalReply }).catch(() => {});
          setLoading(false);
        }
      }, 18);
    } catch (e) {
      addMessage(user.uid, {
        role: "assistant",
        content: "Une erreur s'est produite. Réessaie ✦",
      }).catch(() => {});
      setLoading(false);
    }
  }

  const display = history.length === 0 ? [WELCOME] : history;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        style={{
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: C.border,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <LinearGradient
            colors={[C.violet, C.violetDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 16, color: C.text }}>✦</Text>
          </LinearGradient>
          <View>
            <Text style={{ color: C.text, fontFamily: FONT.bodySemi, fontSize: 15 }}>Astra IA</Text>
            <Text style={{ color: C.success, fontSize: 11, fontFamily: FONT.body }}>● En ligne</Text>
          </View>
        </View>
        {isPremium ? (
          <View
            style={{
              backgroundColor: "rgba(245,193,66,0.15)",
              borderWidth: 1,
              borderColor: "rgba(245,193,66,0.4)",
              borderRadius: 20,
              paddingVertical: 4,
              paddingHorizontal: 10,
            }}
          >
            <Text style={{ fontSize: 11, fontFamily: FONT.bodySemi, color: C.gold }}>
              ⭐ Premium
            </Text>
          </View>
        ) : remainingFreeToday > 0 ? (
          <View
            style={{
              backgroundColor: "rgba(245,193,66,0.15)",
              borderWidth: 1,
              borderColor: "rgba(245,193,66,0.4)",
              borderRadius: 20,
              paddingVertical: 4,
              paddingHorizontal: 10,
            }}
          >
            <Text style={{ fontSize: 11, fontFamily: FONT.bodySemi, color: C.gold }}>
              {remainingFreeToday} message gratuit
            </Text>
          </View>
        ) : (
          <PremiumBadge onPress={() => go("premium")}>⭐ Débloquer</PremiumBadge>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 8, gap: 10 }}
      >
        {display.map((m, i) => (
          <View
            key={m.id || `welcome-${i}`}
            style={{
              flexDirection: "row",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              gap: 8,
              alignItems: "flex-end",
            }}
          >
            {m.role === "assistant" && (
              <LinearGradient
                colors={[C.violet, C.violetDeep]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 11, color: C.text }}>✦</Text>
              </LinearGradient>
            )}
            <View style={{ maxWidth: "78%" }}>
              {m.role === "user" ? (
                <LinearGradient
                  colors={[C.violet, C.violetDeep]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingVertical: 11,
                    paddingHorizontal: 14,
                    borderRadius: 18,
                    borderBottomRightRadius: 4,
                  }}
                >
                  <Text style={{ color: C.text, fontSize: 14, lineHeight: 22, fontFamily: FONT.body }}>
                    {m.content}
                  </Text>
                </LinearGradient>
              ) : (
                <View
                  style={{
                    paddingVertical: 11,
                    paddingHorizontal: 14,
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderWidth: 1,
                    borderColor: C.border,
                    borderRadius: 18,
                    borderBottomLeftRadius: 4,
                  }}
                >
                  <Text style={{ color: C.text, fontSize: 14, lineHeight: 22, fontFamily: FONT.body }}>
                    {m.content}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}

        {!!typing && (
          <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-end" }}>
            <LinearGradient
              colors={[C.violet, C.violetDeep]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 11, color: C.text }}>✦</Text>
            </LinearGradient>
            <View
              style={{
                maxWidth: "78%",
                paddingVertical: 11,
                paddingHorizontal: 14,
                backgroundColor: "rgba(255,255,255,0.05)",
                borderWidth: 1,
                borderColor: C.border,
                borderRadius: 18,
                borderBottomLeftRadius: 4,
              }}
            >
              <Text style={{ color: C.text, fontSize: 14, lineHeight: 22, fontFamily: FONT.body }}>
                {typing}
              </Text>
            </View>
          </View>
        )}

        {showSuggestions && history.length === 0 && (
          <View style={{ gap: 7, marginTop: 4, paddingLeft: 34 }}>
            {SUGGESTIONS.map((s) => (
              <Pressable
                key={s}
                onPress={() => send(s)}
                style={{
                  backgroundColor: "rgba(124,58,237,0.1)",
                  borderWidth: 1,
                  borderColor: C.border,
                  borderRadius: 16,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                }}
              >
                <Text style={{ color: C.text, fontSize: 13, fontFamily: FONT.body }}>{s}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {reachedLimit && !loading && (
          <View
            style={{
              backgroundColor: "rgba(245,193,66,0.08)",
              borderWidth: 1,
              borderColor: "rgba(245,193,66,0.3)",
              borderRadius: 14,
              padding: 14,
              alignItems: "center",
              marginVertical: 8,
            }}
          >
            <Text
              style={{
                color: C.gold,
                fontFamily: FONT.body,
                fontSize: 13,
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              Tu veux creuser plus ? ✨
            </Text>
            <GoldButton onPress={() => go("premium")}>Débloquer le chat illimité</GoldButton>
          </View>
        )}
      </ScrollView>

      <View
        style={{
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderTopWidth: 1,
          borderTopColor: C.border,
          flexDirection: "row",
          gap: 8,
          alignItems: "center",
        }}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => send(input)}
          placeholder={reachedLimit ? "Débloquer pour continuer…" : "Pose ta question à Astra…"}
          placeholderTextColor={C.textFaint}
          editable={!reachedLimit}
          returnKeyType="send"
          style={{
            flex: 1,
            backgroundColor: "rgba(255,255,255,0.05)",
            borderWidth: 1,
            borderColor: C.border,
            borderRadius: 50,
            paddingVertical: 11,
            paddingHorizontal: 16,
            color: C.text,
            fontSize: 14,
            fontFamily: FONT.body,
            opacity: reachedLimit ? 0.5 : 1,
          }}
        />
        <Pressable
          onPress={() => send(input)}
          disabled={loading || !input.trim() || reachedLimit}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor:
              loading || !input.trim() || reachedLimit ? "rgba(124,58,237,0.2)" : C.gold,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator size="small" color={C.violetLight} />
          ) : (
            <Text style={{ fontSize: 16, color: "#1a0900" }}>➤</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
