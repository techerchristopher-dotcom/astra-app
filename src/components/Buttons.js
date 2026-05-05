import { Pressable, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { C, FONT } from "../theme";

export function GoldButton({ children, onPress, disabled, style }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          width: "100%",
          borderRadius: 50,
          overflow: "hidden",
          opacity: disabled ? 0.45 : pressed ? 0.92 : 1,
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      <LinearGradient
        colors={[C.gold, "#D4A017"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingVertical: 16, alignItems: "center", justifyContent: "center" }}
      >
        <Text
          style={{
            fontFamily: FONT.bodyBold,
            fontSize: 15,
            color: "#1a0900",
            letterSpacing: 0.3,
          }}
        >
          {children}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

export function GhostButton({ children, onPress, disabled, style, textStyle }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          width: "100%",
          backgroundColor: "rgba(255,255,255,0.05)",
          borderWidth: 1,
          borderColor: pressed ? C.violetLight : C.border,
          borderRadius: 50,
          paddingVertical: 14,
          alignItems: "center",
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          {
            fontFamily: FONT.bodyMedium,
            fontSize: 14,
            color: C.textMuted,
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

export function PremiumBadge({ onPress, children = "⭐ Premium" }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "rgba(245,193,66,0.15)",
        borderWidth: 1,
        borderColor: "rgba(245,193,66,0.4)",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
      }}
    >
      <Text
        style={{
          fontFamily: FONT.bodyBold,
          fontSize: 11,
          color: C.gold,
          letterSpacing: 0.5,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}

export function LockBadge({ children = "🔒 Premium", onPress, style, textStyle }) {
  const Wrap = onPress ? Pressable : Pressable;
  return (
    <Wrap
      onPress={onPress}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          backgroundColor: "rgba(245,193,66,0.12)",
          borderWidth: 1,
          borderColor: "rgba(245,193,66,0.3)",
          borderRadius: 20,
          paddingHorizontal: 12,
          paddingVertical: 4,
          alignSelf: "flex-start",
        },
        style,
      ]}
    >
      <Text
        style={[
          { fontFamily: FONT.bodySemi, fontSize: 11, color: C.gold },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </Wrap>
  );
}
