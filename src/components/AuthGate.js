import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { C, FONT } from "../theme";
import { useAuth } from "../contexts/AuthContext";

export default function AuthGate({ children }) {
  const { loading, authError, user, profile } = useAuth();

  if (authError) {
    return (
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: C.bgPage,
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
        }}
      >
        <Text
          style={{
            fontFamily: FONT.serifBold,
            fontSize: 22,
            color: C.danger,
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Connexion impossible
        </Text>
        <Text
          style={{
            fontFamily: FONT.body,
            fontSize: 14,
            color: C.text,
            textAlign: "center",
            lineHeight: 22,
          }}
        >
          {authError}
        </Text>
        <Text
          style={{
            fontFamily: FONT.body,
            fontSize: 12,
            color: C.textMuted,
            textAlign: "center",
            marginTop: 24,
            lineHeight: 18,
          }}
        >
          Voir README.md → section "Configuration Firebase"
        </Text>
      </ScrollView>
    );
  }

  if (loading || !user || !profile) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: C.bgPage,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={C.violetLight} />
        <Text
          style={{
            color: C.textMuted,
            fontFamily: FONT.body,
            marginTop: 16,
          }}
        >
          Connexion aux astres…
        </Text>
      </View>
    );
  }

  return children;
}
