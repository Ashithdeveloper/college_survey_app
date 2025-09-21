import { ApiUrl } from "@/config/ApiUrl";
import axiosInstance from "@/config/axiosInstance";
import { getUserDetails } from "@/Redux/Slices/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useDispatch } from "react-redux";

export default function UserSigup() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(true);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSigup = async () => {
    try {
      if (!userName || !email || !password) {
        return Alert.alert("Error", "All fields are required");
      }
      const response = await axiosInstance.post(`/api/user/userlogin`, {
        name: userName,
        email,
        password,
        role: "viewer",
      });
      if (response.status === 200) {
        Alert.alert("Success", "Signup successful");
        // Save token
        dispatch(getUserDetails(response.data.user));
        const token = response.data.token;
        await AsyncStorage.setItem("userToken", token);
        router.replace("/(tabs)");
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 items-center justify-center px-4 bg-white ">
        <View className="mb-19 pb-5">
          <Image
            source={require("../../assets/images/boyspeaking.png")}
            style={{ width: 200, height: 210, resizeMode: "contain" }}
          />
        </View>
        {/* Card container */}
        <View className="w-full max-w-md bg-white p-6 pt-0 rounded-xl shadow-lg ">
          <Text className="text-2xl font-bold text-black mb-6 mt-2 text-center">
            User Signup
          </Text>
          {/* Name */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2 text-[18px] font-bold">
              UserName
            </Text>
            <TextInput
              value={userName}
              onChangeText={setUserName}
              placeholder="Enter your email"
              className="border border-gray-300 rounded-lg px-3 py-4 bg-gray-50"
              autoCapitalize="none"
              autoComplete="off"
              textContentType="none"
            />
          </View>

          {/* Email input */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2 text-[18px] font-bold">
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              className="border border-gray-300 rounded-lg px-3 py-4 bg-gray-50"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password input */}
          <View className="mb-6">
            <Text className="text-gray-700 mb-2 text-[18px] font-bold">
              Password
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              className="border border-gray-300 rounded-lg px-3 py-4 bg-gray-50"
              secureTextEntry={passwordVisible}
            />
          </View>
          {/* show password checkbox */}
          <Pressable
            onPress={() => setPasswordVisible(!passwordVisible)}
            className="flex-row items-center mb-6"
          >
            <View
              className={`w-5 h-5 border border-gray-400 rounded-sm mr-2 items-center justify-center ${
                !passwordVisible ? "bg-blue-600" : "bg-white"
              }`}
            >
              {!passwordVisible && <View className="w-3 h-3 bg-white" />}
            </View>
            <Text className="text-gray-700">Show password</Text>
          </Pressable>
          {/* Login button */}
          <TouchableOpacity
            className="bg-blue-600 rounded-lg py-3 items-center"
            onPress={handleSigup}
          >
            <Text className="text-white font-semibold text-lg">Login</Text>
          </TouchableOpacity>

          {/* Optional: Signup link */}
          <TouchableOpacity
            className="mt-4 items-center"
            onPress={() => router.push("/(auth)/Login")}
          >
            <Text className="text-blue-600 font-medium">
              Already have an account ?
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
