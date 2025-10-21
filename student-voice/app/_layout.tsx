import { Stack, useRouter, SplashScreen } from "expo-router";
import "../global.css";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import axiosInstance from "@/config/axiosInstance";
import useUserStore from "@/Zustand/store/authStore";
import { Alert } from "react-native";
import { useHasHydrated } from "@/hooks/useHasHydrated";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const { setUser, clearUser } = useUserStore();

  // 1. Select the token reactively.
  // This makes the component re-render whenever the token changes (e.g., after login).
  const token = useUserStore((state) => state.token);
  const hasHydrated = useHasHydrated();

  useEffect(() => {
    // Wait until the store has loaded its data.
    if (!hasHydrated) {
      return;
    }

    const verifyTokenAndNavigate = async () => {
      console.log(token);
      try {
        // Use the reactive 'token' from the line above.
        if (token) {
          const res = await axiosInstance.get("/api/user/getme");
          if (res.status === 200) {
            setUser(res.data); // Assuming user data is in res.data.user
            router.replace("/(tabs)");
          } else {
            clearUser();
            router.replace("/(auth)/Login");
          }
        } else {
          router.replace("/(auth)/Login");
        }
      } catch (error: any) {
        Alert.alert(
          "API Error",
          `Could not connect to server: ${error.message}`
        );
        clearUser();
        router.replace("/(auth)/Login");
      } finally {
        SplashScreen.hideAsync();
      }
    };

    verifyTokenAndNavigate();
  }, [hasHydrated, token]); // <-- 2. Add 'token' to the dependency array.

  if (!hasHydrated) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "white" }}
        edges={["top", "left", "right"]}
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="screens" />
        </Stack>
      </SafeAreaView>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
