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



export default function StudentSigup() {
  const [name, setName] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ collegename, setCollegeName] = useState("");
  const [ imagePick , setImagePick] = useState(false);
  const [ selfie , setSelfie ] = useState<string|null>(null)
  const router = useRouter();
    const [image, setImage] = useState<string|null>(null);
    const dispatch = useDispatch();
    

    const pickImage = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1,
      });
      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
      setImagePick(true);
    };
    //StudentSigup
   const pickSelfie = async () =>{
    let selfie = await ImagePicker.launchCameraAsync({
    mediaTypes: ["image"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
    })
    if(!selfie.canceled){
      setSelfie(selfie.assets[0].uri);
    }
   }

    const handleStudentLogin = async (
      name: string,
      collegename: string,
      collegeId: string,
      email: string,
      password: string,
      imageUri: string,
      router: ReturnType<typeof useRouter>
    ) => {
      try {
        if( !name || !collegename || !collegeId || !email || !password || !imagePick){
          return alert("All fields are required");
        }
        const formData = new FormData();
        formData.append("name", name);
        formData.append("collegename", collegename);
        formData.append("collegeId", collegeId);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("file", {
         uri: imageUri, 
         type: "image/jpeg", 
         name: "profile.jpg", 
        } as any);
        console.log(formData);

        const response = await axiosInstance.post(
          `/api/user/signup`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log(response.data);

        if (response.status === 201) {
          Alert.alert("Success", "Login successful");
          dispatch(getUserDetails(response.data.user));
          // Save token
          const token = response.data.token;
          await AsyncStorage.setItem("userToken", token);
          router.replace("/(tabs)");
          setName("");
          setCollegeId("");
          setEmail("");
          setPassword("");
          setCollegeName("");
          setImagePick(false);
        }
      } catch (error) {
        console.error(error);
      }
    };


  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.scrollContainer}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={90}
      className="bg-white"
    >
      <View className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg  ">
        <View className="ml-12">
          <Image
            source={require("../../assets/images/boyspeaking.png")}
            style={{ width: 200, height: 190, resizeMode: "contain" }}
          />
        </View>
        <Text className="text-2xl font-bold text-black mb-6 text-center">
          Student Signup
        </Text>
        {/**Take selfie */}
        <View>
          
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
          <View className="border border-gray-300 rounded-lg px-3  bg-gray-50 mb-1">
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
            secureTextEntry={false}
          />
        </View>
        <View className="mb-4">
          <Button
            title={`${imagePick ? "Image picked" : "Pick an image"}`}
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
