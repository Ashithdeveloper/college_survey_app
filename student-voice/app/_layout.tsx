import { Stack, useRouter } from "expo-router";
import "../global.css";
import { SafeAreaProvider, SafeAreaView, } from "react-native-safe-area-context";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import axiosInstance from "@/config/axiosInstance";

import useUserStore from "@/Zustand/store/authStore";


export default function RootLayout() {
  const router = useRouter();
  const { setUser , token , clearUser  } = useUserStore();
  

  useEffect(() => {
    const getData = async () => {
      try {
        // const token = await AsyncStorage.getItem("userToken");

        if (!token) {
          router.replace("/(auth)/Login");
          return;
        }

        // verify token by calling backend
        const res = await axiosInstance.get(`/api/user/getme`)

        if (res.status === 200) {
          router.replace("/(tabs)");
          setUser(res.data)
        } else {;
          clearUser();
          router.replace("/(auth)/Login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.replace("/(auth)/Login");
      }
    };

    getData();
  }, [token]);
  
  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "white",
        }}
        edges={["top" ,"left", "right"]}
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
