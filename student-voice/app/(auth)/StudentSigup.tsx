import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";

export default function StudentSigup() {
  const [name, setName] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="bg-white"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
          <Text className="text-2xl font-bold text-black mb-6 text-center">
            Student Signup
          </Text>

          {/* Name */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-bold text-[18px]">
              Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              className="border border-gray-300 rounded-lg px-3 py-4 bg-gray-50"
            />
          </View>

          {/* College ID */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-bold text-[18px]">
              College ID
            </Text>
            <TextInput
              value={collegeId}
              onChangeText={setCollegeId}
              placeholder="Enter your college ID"
              className="border border-gray-300 rounded-lg px-3 py-4 bg-gray-50"
            />
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-bold text-[18px]">
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

          {/* Password */}
          <View className="mb-6">
            <Text className="text-gray-700 mb-2 font-bold text-[18px]">
              Password
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              className="border border-gray-300 rounded-lg px-3 py-4 bg-gray-50"
              secureTextEntry
            />
          </View>

          {/* Signup Button */}
          <TouchableOpacity className="bg-blue-600 rounded-lg py-3 items-center mb-4">
            <Text className="text-white font-semibold text-lg">Signup</Text>
          </TouchableOpacity>

          {/* Optional: Login link */}
          <TouchableOpacity className="mt-2 items-center">
            <Text className="text-blue-600 font-medium">
              Already have an account? Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
});
