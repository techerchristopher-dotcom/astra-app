import { useEffect, useRef } from "react";
import { Animated, Text } from "react-native";
import { C } from "../theme";

export default function PulseGlyph({ size = 40, color = C.gold, glyph = "✦" }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.06, duration: 1250, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 1250, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Text
        style={{
          fontSize: size,
          color,
          textShadowColor: color,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 16,
        }}
      >
        {glyph}
      </Text>
    </Animated.View>
  );
}
