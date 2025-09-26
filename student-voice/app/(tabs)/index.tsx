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
import { useDispatch, useSelector } from "react-redux";
import { setQuestion } from "@/Redux/Slices/questionSlice";
import { useRouter } from "expo-router";
import { setResultCollege } from "@/Redux/Slices/resultCollege";


export default function Home() {
  const [colleges, setColleges] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: any) => state.auth.user);

  const getAllCollege = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get<string[]>(
        "/api/questions/allcollege"
      );
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
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch colleges:", err);
      const fallback = CollegeName.slice(0, 5).map((c) =>
        typeof c === "string" ? c : c.name
      );

      // Move user's college to top in fallback too
      const reorderedFallback = user?.collegename
        ? [user.collegename, ...fallback.filter((c) => c !== user.collegename)]
        : fallback;

      setColleges(reorderedFallback);
      setIsLoading(false);
    }
    setIsLoading(false);
  };
  const guestion = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get(`/api/questions/`);
      if (res.status === 200) {
        console.log("res.data:", JSON.stringify(res.data, null, 2));
        dispatch(setQuestion(res.data.question));
        router.push("/screens/Question");
        setIsLoading(false);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching question:", error);
      setIsLoading(false);
    }
    setIsLoading(false);
  };

  const notforyou = (college: string) => {
    Alert.alert("Notice", `This question is only for ${college}.`);
  };
  const result = (College: string) => {
    router.push("/screens/Result");
    dispatch(setResultCollege(College));
  };
  useEffect(() => {
    getAllCollege();
  }, []);
  if(isLoading){
    return <View className="flex-1 items-center justify-center px-4 bg-white">
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
  }

  return (
    <View className="bg-white flex-1">
      <ScrollView
        contentContainerStyle={{ alignItems: "center", paddingVertical: 20 }}
      >
        {colleges.map((college, index) => {
          const isUserCollege = user?.collegename === college;
          return (
            <View key={index} style={styles.card}>
              <Text style={styles.collegeName}>{college}</Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: isUserCollege ? "#2563eb" : "#9ca3af" },
                  ]}
                  onPress={() =>
                    isUserCollege ? guestion() : notforyou(college)
                  }
                >
                 
                  <Text style={styles.buttonText}>Question</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "#22c55e" }]}
                  onPress={() => result(college)}
                >
                  <Text style={styles.buttonText}>Result</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: "center",
  },
  collegeName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#111827",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
