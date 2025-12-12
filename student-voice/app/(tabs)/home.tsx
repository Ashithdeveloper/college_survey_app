import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import axiosInstance from "@/config/axiosInstance";
import { CollegeName } from "@/config/CollegeName";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useQuestionStore from "@/Zustand/store/question";
import useUserStore from "@/Zustand/store/authStore";

export default function Home() {
  const [colleges, setColleges] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { setQuestion , setCollege } = useQuestionStore();
  const { user } = useUserStore();


 
  const getAllCollege = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get<string[]>("/api/questions/allcollege");
      let fetchedColleges = res.data || [];

      if (fetchedColleges.length < 5) {
        const needed = 5 - fetchedColleges.length;
        const additional = CollegeName.slice(0, needed).map((c) =>
          typeof c === "string" ? c : c.name
        );
        fetchedColleges = [...fetchedColleges, ...additional];
      }

      // Move user's college to top
      if (user?.collegename) {
        fetchedColleges = [
          user.collegename,
          ...fetchedColleges.filter((c) => c !== user.collegename),
        ];
      }

      setColleges(fetchedColleges);
    } catch (err) {
      console.error("Failed to fetch colleges:", err);
      const fallback = CollegeName.slice(0, 5).map((c) =>
        typeof c === "string" ? c : c.name
      );

      const reorderedFallback = user?.collegename
        ? [user.collegename, ...fallback.filter((c) => c !== user.collegename)]
        : fallback;

      setColleges(reorderedFallback);
    } finally {
      setIsLoading(false);
    }
  };

  const question = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get(`/api/questions/`);
      if (res.status === 200) {
        setQuestion(res.data.question);
        router.push("/screens/Question");
      }
    } catch (error) {
      console.error("Error fetching question:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const notForYou = (college: string) => {
    Alert.alert("Notice", `This question is only for ${college}.`);
  };

  const result = (College: string) => {
    router.push("/screens/Result");
    setCollege(College);
  };
  // const logout = async () => {
  //   try {
  //     await AsyncStorage.removeItem("userToken");
  //     router.replace("/(auth)/Login");
  //     dispatch(removeUserDetails());
  //   } catch (error) {
  //     console.error("Error removing token:", error);
  //   }
  // }
  useEffect(() => {
    getAllCollege();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center px-4 bg-white">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  const userCollege = user?.collegename
    ? colleges.filter((c) => c === user.collegename)
    : [];
  const otherColleges = colleges.filter((c) => c !== user?.collegename);

  return (
    <View className="bg-white flex-1">
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          paddingVertical: 20,
          paddingHorizontal: 10,
        }}
      >
        {/* <Button>
          <Ionicons name="log-out-outline" size={24} color="black" onPress={logout} />
        </Button> */}
        {/* 🔹 Your College Section */}
        {userCollege.length > 0 && (
          <View className="w-full mb-2">
            <View className="bg-green-100 border-l-4 border-green-600 p-3 rounded-md mb-4">
              <Text className="text-lg font-bold text-green-800">
                🎓 Your College
              </Text>
              <Text className="text-sm text-green-700">
                Participate in your college’s survey and view results
              </Text>
            </View>

            {userCollege.map((college, index) => (
              <View
                key={index}
                style={[
                  styles.card,
                  { borderColor: "#22c55e", borderWidth: 1.2 },
                ]}
              >
                <Text style={[styles.collegeName, { color: "#166534" }]}>
                  {college}
                </Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={() => question()}
                    className="flex-1 mx-[5px] py-3 rounded-[10px] items-center border border-green-600 flex-row justify-center gap-2"
                  >
                    <Ionicons name="pencil" size={15} color="black" />
                    <Text className="text-black font-bold text-[15px]">
                      Question
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 mx-[5px] py-3 rounded-[10px] items-center bg-[#22c55e] flex-row justify-center gap-2"
                    onPress={() => result(college)}
                  >
                    <Ionicons name="stats-chart" size={15} color="#fff" />
                    <Text style={styles.buttonText}>Result</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 🔹 Other Colleges Section */}
        {otherColleges.length > 0 && (
          <View className="w-full">
            <View className="bg-blue-100 border-l-4 border-blue-600 p-3 rounded-md mb-4">
              <Text className="text-lg font-bold text-blue-800">
                {/**for see user view and student view */}
                {userCollege.length > 0
                  ? "🏫 Other Colleges"
                  : "🏫 Colleges"}
              </Text>
              <Text className="text-sm text-blue-700">
                View results and updates from other colleges
              </Text>
            </View>

            {otherColleges.map((college, index) => (
              <View
                key={index}
                style={[
                  styles.card,
                  { borderColor: "#60a5fa", borderWidth: 1 },
                ]}
              >
                <Text style={[styles.collegeName, { color: "#1e3a8a" }]}>
                  {college}
                </Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={() => notForYou(college)}
                    className="flex-1 mx-[5px] py-3 rounded-[10px] items-center bg-gray-300 border border-white flex-row justify-center gap-2"
                  >
                    <Ionicons name="pencil" size={15} color="black" />
                    <Text className="text-black font-bold text-[15px]">
                      Question
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 mx-[5px] py-3 rounded-[10px] items-center bg-blue-500 flex-row justify-center gap-2"
                    onPress={() => result(college)}
                  >
                    <Ionicons name="stats-chart" size={15} color="#fff" />
                    <Text style={styles.buttonText}>Result</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignItems: "center",
  },
  collegeName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
