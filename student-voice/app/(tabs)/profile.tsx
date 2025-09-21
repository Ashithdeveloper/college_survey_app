import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { removeUserDetails } from "@/Redux/Slices/authSlice";

export default function Profile() {
  const user = useSelector((state: any) => state.auth.user);
  const router = useRouter();
  const dispatch = useDispatch();


  if (!user) {
    return (
      <View style={styles.center}>
        <Text >No user data available</Text>
      </View>
    );
  }

  
  const logout = async () =>{
    try {
      await AsyncStorage.removeItem('userToken');
      router.replace('/(auth)/Login')
      dispatch(removeUserDetails())
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} className="bg-white">
      <View style={styles.card}>
        <Image
          source={require("../../assets/images/boyspeaking.png")}
          style={styles.image}
        />
        <View className="w-full">
          <View className="flex-row ">
            <Text className="font-bold text-lg mb-2">Name: </Text>
            <Text className="font-semibold text-lg">{user.name}</Text>
          </View>
          {user.role === "student" ? (
            <View>
              <View className="flex-row flex-wrap mb-2">
                <Text className="font-bold text-lg">College Name: </Text>
                <Text className="font-semibold text-lg">
                  {user.collegename}
                </Text>
              </View>
              <View className="flex-row mb-2">
                <Text className="font-bold text-lg">College ID: </Text>
                <Text className="font-semibold text-lg">{user.collegeId}</Text>
              </View>
            </View>
          ) : null}

          <View className="flex-row mb-2">
            <Text className="font-bold text-lg">Email: </Text>
            <Text className="font-semibold text-lg">{user.email}</Text>
          </View>
          <View className="flex-row mb-2">
            <Text className="font-bold text-lg">Role: </Text>
            <Text className="font-semibold text-lg">{user.role}</Text>
          </View>
          <View className="flex-row mb-2">
            <Text className="font-bold text-lg">Date: </Text>
            <Text className="font-semibold text-lg">{user.createdAt.split("T")[0]}</Text>
          </View>

          <View className="flex-row ">
            <Text className="font-bold text-lg">Verified: </Text>
            <Text
              className={`font-semibold text-lg ${user.isVerified ? "text-green-500" : "text-red-500"}`}
            >
              {user.isVerified ? "Verified✅" : "Not Verified❌"}
            </Text>
          </View>
        </View>
        {/**logout */}
        <View>
          <TouchableOpacity
            onPress={logout}
            style={{
              marginTop: 20,
              backgroundColor: "red",
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 18 }}>Logout</Text>
          </TouchableOpacity>
        </View>
        <View className="mt-4 ">
          <Text className="font-semibold text-lg">
            {user.isVerified
              ? ""
              : "Your account not verified because verifying only for the Student account for user account not given verified"}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: "center",
  },
  image: {
    width: 160,
    height: 220,
    borderRadius: 20,
    marginBottom: 20,
    resizeMode: "cover",
  },
 
});
