import { useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions, View } from "react-native";

const { width: W, height: H } = Dimensions.get("window");

function Star({ size, x, y, delay, dur }) {
  const opacity = useRef(new Animated.Value(0.15)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const half = dur / 2;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0.9, duration: half, useNativeDriver: true }),
          Animated.timing(scale,   { toValue: 1.2, duration: half, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0.15, duration: half, useNativeDriver: true }),
          Animated.timing(scale,   { toValue: 0.8, duration: half, useNativeDriver: true }),
        ]),
      ])
    );
    const t = setTimeout(() => loop.start(), delay);
    return () => {
      clearTimeout(t);
      loop.stop();
    };
  }, [dur, delay, opacity, scale]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#fff",
        opacity,
        transform: [{ scale }],
      }}
      pointerEvents="none"
    />
  );
}

export default function Stars() {
  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * W,
        y: Math.random() * H,
        size: Math.random() * 1.8 + 0.6,
        delay: Math.random() * 5000,
        dur: Math.random() * 3000 + 2000,
      })),
    []
  );

  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden" }}
    >
      {stars.map((s) => (
        <Star key={s.id} {...s} />
      ))}
      <View
        style={{
          position: "absolute",
          top: -W * 0.2,
          left: W * 0.3,
          width: 400,
          height: 400,
          borderRadius: 200,
          backgroundColor: "rgba(124,58,237,0.06)",
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: H * 0.1,
          right: W * 0.2,
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: "rgba(232,164,200,0.04)",
        }}
      />
    </View>
  );
}
