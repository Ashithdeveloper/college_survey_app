import { Stack } from "expo-router";
import "../global.css";
import { StyleSheet, View } from "react-native";

import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
