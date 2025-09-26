import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Button,
  Alert,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { CollegeName } from "@/config/CollegeName";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { getUserDetails } from "@/Redux/Slices/authSlice";
import axiosInstance from "@/config/axiosInstance";
import { ActivityIndicator } from "react-native";

export default function StudentSignup() {
  const [name, setName] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [collegename, setCollegeName] = useState("");
  const [imagePick, setImagePick] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();

  // Pick ID card image
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setImagePick(true);
    }
  };

  // Take live selfie
  const pickSelfie = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelfie(result.assets[0].uri);
    }
  };
  

  // Handle signup
  const handleStudentLogin = async (
    name: string,
    collegename: string,
    collegeId: string,
    email: string,
    password: string,
    idCardUri: string,
    selfieUri: string,
    router: ReturnType<typeof useRouter>
  ) => {
    try {
      if (
        !name ||
        !collegename ||
        !collegeId ||
        !email ||
        !password ||
        !imagePick ||
        !selfieUri
      ) {
        return alert("All fields are required");
      }
      setIsLoading(true);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("collegename", collegename);
      formData.append("collegeId", collegeId);
      formData.append("email", email);
      formData.append("password", password);

      // ID card
      formData.append("idCard", {
        uri: idCardUri,
        type: "image/jpeg",
        name: "idCard.jpg",
      } as any);

      // Live selfie
      formData.append("liveselfie", {
        uri: selfieUri,
        type: "image/jpeg",
        name: "selfie.jpg",
      } as any);

      const response = await axiosInstance.post(`/api/user/signup`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201) {
        Alert.alert("Success", "Signup successful");
        dispatch(getUserDetails(response.data.user));
        await AsyncStorage.setItem("userToken", response.data.token);
        router.replace("/(tabs)");

        // Reset form
        setName("");
        setCollegeId("");
        setEmail("");
        setPassword("");
        setCollegeName("");
        setImagePick(false);
        setImage(null);
        setSelfie(null);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong");
    }
    finally {
      setIsLoading(false);
    }
  };
  if(isLoading) return <View className="flex-1 items-center justify-center bg-white">
    <ActivityIndicator  size="large" color="blue" />
  </View>

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.scrollContainer}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={90}
      className="bg-white"
    >
      <View className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
        <View className="ml-12">
          <Image
            source={require("../../assets/images/boyspeaking.png")}
            style={{ width: 200, height: 190, resizeMode: "contain" }}
          />
        </View>
        <Text className="text-2xl font-bold text-black mb-6 text-center">
          Student Signup
        </Text>

        {/** Take live selfie */}
        <View className="mb-4">
          <Button
            title={selfie ? "Selfie Taken" : "Take a Selfie"}
            onPress={pickSelfie}
          />
          {selfie && (
            <Image
              source={{ uri: selfie }}
              style={{ width: 200, height: 200, marginTop: 20 }}
            />
          )}
        </View>

        {/* Name */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-bold text-[16px]">Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            className="border border-gray-300 rounded-lg px-3 py-4 bg-gray-50"
          />
        </View>

        {/* College Name */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-bold text-[16px]">
            College Name
          </Text>
          <View className="border border-gray-300 rounded-lg px-3 bg-gray-50 mb-1">
            <Picker
              selectedValue={collegename}
              onValueChange={(itemValue) => setCollegeName(itemValue)}
            >
              <Picker.Item label="Select a college" value="" />
              {CollegeName.map((college, index) => (
                <Picker.Item
                  key={index}
                  label={college.name}
                  value={college.name}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* College ID */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-2 font-bold text-[16px]">
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
          <Text className="text-gray-700 mb-2 font-bold text-[16px]">
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
          <Text className="text-gray-700 mb-2 font-bold text-[16px]">
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

        {/* ID Card Image */}
        <View className="mb-4">
          <Button
            title={imagePick ? "Image Picked" : "Pick an ID Card Image"}
            onPress={pickImage}
          />
          {image && (
            <Image
              source={{ uri: image }}
              style={{ width: 200, height: 200, marginTop: 20 }}
            />
          )}
        </View>

        {/* Signup Button */}
        <TouchableOpacity
          className="bg-blue-600 rounded-lg py-3 items-center mb-4"
          onPress={() =>
            handleStudentLogin(
              name,
              collegename,
              collegeId,
              email,
              password,
              image!,
              selfie!,
              router
            )
          }
        >
          <Text className="text-white font-semibold text-lg">Signup</Text>
        </TouchableOpacity>

        {/* Optional: Login link */}
        <TouchableOpacity
          className="mt-2 items-center"
          onPress={() => router.push("/Login")}
        >
          <Text className="text-blue-600 font-medium">
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    paddingBottom: 50,
  },
});
