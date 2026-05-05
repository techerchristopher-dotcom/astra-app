import { View } from "react-native";
import { C } from "../theme";

export default function ProgressBar({ total = 4, current = 0, style }) {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          gap: 4,
          height: 3,
          borderRadius: 2,
          backgroundColor: "rgba(255,255,255,0.08)",
        },
        style,
      ]}
    >
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: "100%",
            borderRadius: 2,
            backgroundColor: i <= current ? C.gold : "rgba(255,255,255,0.12)",
          }}
        />
      ))}
    </View>
  );
}
