import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiUrl } from "./ApiUrl";


const axiosInstance = axios.create({
  baseURL: ApiUrl,
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
