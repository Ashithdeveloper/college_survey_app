import axiosInstance from "@/config/axiosInstance";
import { getUserDetails } from "@/Redux/Slices/authSlice";
import { store } from "@/Redux/Store/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";


export const getData = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) return null;

    const res = await axiosInstance.get(`/api/user/getme`);
    if (res && res.status === 200) {
      store.dispatch(getUserDetails(res.data));
      router.replace("/(tabs)");
    } else {
      await AsyncStorage.removeItem("userToken");
      router.replace("/(auth)/Login");
    }
    return null;
  } catch (error) {
    console.error("Auth check failed:", error);
    return null;
  }
};
