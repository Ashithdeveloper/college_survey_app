import { Stack, useRouter } from "expo-router";
import "../global.css";
import { SafeAreaProvider, SafeAreaView, } from "react-native-safe-area-context";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiUrl } from "@/config/ApiUrl";
import { StatusBar } from "expo-status-bar";
import axiosInstance from "@/config/axiosInstance";
import { Provider } from "react-redux";
import { store } from "@/Redux/Store/store";
import { getUserDetails } from "@/Redux/Slices/authSlice";


export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");

        if (!token) {
          router.replace("/(auth)/Login");
          return;
        }

        // verify token by calling backend
        const res = await axiosInstance.get(`/api/user/getme`)

        if (res.status === 200) {
          router.replace("/(tabs)");
          store.dispatch(getUserDetails(res.data));
          console.log()
          
        } else {
          await AsyncStorage.removeItem("userToken"); 
          router.replace("/(auth)/Login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.replace("/(auth)/Login");
      }
    };

    getData();
  }, []);

  return (
    <Provider store={store}>
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          flex: 1,
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
    </Provider>
  );
}
