import axios from "axios";
import { ApiUrl } from "./ApiUrl";
import useUserStore from "@/Zustand/store/authStore";


const axiosInstance = axios.create({
  baseURL: ApiUrl,
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = useUserStore.getState().token; 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;

