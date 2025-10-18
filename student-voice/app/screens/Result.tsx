import React, { useEffect, useState } from "react";
import {
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { useRouter } from "expo-router";
import axiosInstance from "@/config/axiosInstance";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import useQuestionStore from "@/Zustand/store/question";

const screenWidth = Dimensions.get("window").width;

export default function MyBarChart() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { collegename } = useQuestionStore();
   
  console.log("Selected college:", collegename);

  const fetchResult = async () => {
    try {
      if (!collegename) return;
      const res = await axiosInstance.get("/api/questions/result/" + collegename);
      if (res.status === 200) {
        setData(res.data.result);
      }
    } catch (error) {
      console.log("Error fetching result:", error);
      Alert.alert("Error", "Failed to fetch result");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResult();
  }, [collegename]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (!data || !data.results) {
    Alert.alert("Error", "No data available for " + collegename);
    router.back();
    return null;
  }

  const ratings = data.results;

  const ratingItems = [
    { label: "Placement", value: ratings.placement_training, color: "#22c55e" },
    { label: "Mental Health", value: ratings.mental_health, color: "#3b82f6" },
    { label: "Skill Training", value: ratings.skill_training, color: "#eab308" },
    { label: "Total Score", value: ratings.total_score_college, color: "#8b5cf6" },
  ];

  const overallExplanation =
    ratings["overall_explanation"] || ratings["overall explanation"];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "white" }}
      contentContainerStyle={{ padding: 16 }}
    >
      {/* 🔙 Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          marginBottom: 20,
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 8,
          backgroundColor: "#22c55e",
          alignSelf: "flex-start",
        }}
      >
        <Ionicons name="arrow-back" size={18} color="#fff" />
        <Text style={{ color: "#fff", fontWeight: "600" }}>Back</Text>
      </TouchableOpacity>

      {/* 🏫 College Title */}
      <View
        style={{
          backgroundColor: "#dcfce7",
          borderLeftWidth: 4,
          borderLeftColor: "#16a34a",
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#166534" }}>
          {collegename}
        </Text>
        <Text style={{ color: "#15803d", marginTop: 2 }}>
          College Survey Results Overview
        </Text>
      </View>

      {/* 📊 Bar Chart */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 29,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 3,
          marginBottom: 24,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: "#111827",
            marginBottom: 8,
          }}
        >
          Performance Overview
        </Text>
        <BarChart
          data={{
            labels: ratingItems.map((item) => item.label),
            datasets: [
              {
                data: ratingItems.map((item) => item.value),
                colors: ratingItems.map((item) => () => item.color),
              },
            ],
          }}
          width={screenWidth - 32}
          height={300}
          fromZero
          yAxisLabel=""
          yAxisSuffix=""
          showValuesOnTopOfBars
          withCustomBarColorFromData
          flatColor
          chartConfig={{
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            propsForBackgroundLines: { stroke: "#e5e7eb" },
            propsForLabels: { fontSize: 12 },
          }}
          style={{
            borderRadius: 12,
            marginLeft: -29, 
          }}
        />
      </View>

      {/* 📋 Rating Cards */}
      <View style={{ gap: 12 }}>
        {ratingItems.map((item, index) => (
          <View
            key={index}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#fff",
              padding: 16,
              borderRadius: 12,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: item.color,
                  marginRight: 12,
                }}
              />
              <Text
                style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}
              >
                {item.label}
              </Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>
              {item.value}
            </Text>
          </View>
        ))}
      </View>

      {/* 🧠 Overall Explanation */}
      {overallExplanation && (
        <View
          style={{
            marginTop: 24,
            marginBottom: 32,
            padding: 16,
            backgroundColor: "#e0f2fe",
            borderRadius: 12,
            borderLeftWidth: 4,
            borderLeftColor: "#3b82f6",
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              marginBottom: 8,
              color: "#1e40af",
            }}
          >
            Overall Explanation
          </Text>
          <Text
            style={{
              fontSize: 14,
              lineHeight: 20,
              color: "#1f2937",
            }}
          >
            {overallExplanation}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
