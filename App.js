import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import {
  useFonts as usePlayfair,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_500Medium_Italic,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import {
  useFonts as useDMSans,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";

import { C, FONT } from "./src/theme";
import { SIGNS } from "./src/data/signs";
import Stars from "./src/components/Stars";
import BottomNav from "./src/components/BottomNav";
import AuthGate from "./src/components/AuthGate";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";

import OnboardPrenom from "./src/screens/OnboardPrenom";
import OnboardSigne from "./src/screens/OnboardSigne";
import OnboardTeaser from "./src/screens/OnboardTeaser";
import OnboardPremium from "./src/screens/OnboardPremium";

import Home from "./src/screens/Home";
import Horoscope from "./src/screens/Horoscope";
import Chat from "./src/screens/Chat";
import Premium from "./src/screens/Premium";
import Profil from "./src/screens/Profil";

function LoadingScreen() {
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
      <Text style={{ color: C.textMuted, fontFamily: FONT.body, marginTop: 16 }}>
        Chargement des astres…
      </Text>
    </View>
  );
}

function resolveSign(profileSigne) {
  if (!profileSigne) return null;
  if (typeof profileSigne === "string") {
    return SIGNS.find((s) => s.name === profileSigne) || null;
  }
  if (profileSigne?.name) return profileSigne;
  return null;
}

function AppRouter() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();

  const sign = resolveSign(profile?.signe);
  const [screen, setScreen] = useState("home");
  const [extraStep, setExtraStep] = useState(0);
  const [horoscopeData, setHoroscopeData] = useState(null);

  const needsPrenom = !profile?.prenom;
  const needsSigne = !profile?.signe;
  const showTeaser = !needsPrenom && !needsSigne && extraStep === 0;
  const showPremiumIntro = !needsPrenom && !needsSigne && extraStep === 1;
  const inOnboarding = needsPrenom || needsSigne || showTeaser || showPremiumIntro;

  const showNav = !inOnboarding;
  const momentCle = horoscopeData?.momentCle;

  return (
    <View style={{ flex: 1, backgroundColor: C.bgPage }}>
      <LinearGradient
        colors={["#0A0418", "#02010A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <Stars />

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={{ flex: 1, paddingBottom: showNav ? 70 + insets.bottom : 0 }}>
          {needsPrenom && <OnboardPrenom />}
          {!needsPrenom && needsSigne && <OnboardSigne />}
          {showTeaser && (
            <OnboardTeaser
              sign={sign}
              onNext={() => setExtraStep(1)}
              onSkip={() => setExtraStep(2)}
            />
          )}
          {showPremiumIntro && (
            <OnboardPremium onUnlock={() => setExtraStep(2)} onSkip={() => setExtraStep(2)} />
          )}

          {!inOnboarding && screen === "home" && (
            <Home
              name={profile?.prenom}
              sign={sign}
              go={setScreen}
              horoscopeData={horoscopeData}
              momentCle={momentCle}
            />
          )}
          {!inOnboarding && screen === "horoscope" && (
            <Horoscope
              sign={sign}
              name={profile?.prenom}
              horoscopeData={horoscopeData}
              setHoroscopeData={setHoroscopeData}
              go={setScreen}
            />
          )}
          {!inOnboarding && screen === "chat" && (
            <Chat sign={sign} name={profile?.prenom} go={setScreen} />
          )}
          {!inOnboarding && screen === "premium" && <Premium sign={sign} />}
          {!inOnboarding && screen === "profil" && (
            <Profil sign={sign} name={profile?.prenom} go={setScreen} />
          )}
        </View>
      </SafeAreaView>

      {showNav && (
        <BottomNav active={screen} go={setScreen} sign={sign} bottomInset={insets.bottom} />
      )}

      <StatusBar style="light" />
    </View>
  );
}

export default function App() {
  const [playfairLoaded] = usePlayfair({
    PlayfairDisplay_500Medium,
    PlayfairDisplay_500Medium_Italic,
    PlayfairDisplay_700Bold,
  });
  const [dmLoaded] = useDMSans({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  if (!playfairLoaded || !dmLoaded) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AuthGate>
          <AppRouter />
        </AuthGate>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
