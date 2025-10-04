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

const screenWidth = Dimensions.get("window").width;

export default function MyBarChart() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const collegename = useSelector(
    (state: any) => state.resultCollege.collegename
  );
  console.log("Selected college:", collegename);

  const fetchResult = async () => {
    try {
      if (!collegename) return;
      const res = await axiosInstance.get(
        "/api/questions/result/" + collegename
      );
      if (res.status === 200) {
        console.log("Backend response:", res.data);
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
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
    { label: "Placement", value: ratings.placement_training, color: "#FF6384" },
    { label: "Mental Health", value: ratings.mental_health, color: "#36A2EB" },
    {
      label: "Skill Training",
      value: ratings.skill_training,
      color: "#FFCE56",
    },
    {
      label: "Total Score",
      value: ratings.total_score_college,
      color: "#4BC0C0",
    },
  ];

  const overallExplanation =
    ratings["overall_explanation"] || ratings["overall explanation"];

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: "#f9fafb" }}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          marginBottom: 16,
          padding: 8,
          borderRadius: 8,
          backgroundColor: "#007AFF",
          alignSelf: "flex-start",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>← Back</Text>
      </TouchableOpacity>

      {/* Bar Chart */}
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
        height={350}
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
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          propsForBackgroundLines: { stroke: "#e3e3e3" },
          propsForLabels: { fontSize: 12 },
        }}
        style={{ marginVertical: 16, borderRadius: 16 }}
      />

      {/* Ratings Cards */}
      <View style={{ marginTop: 16 }}>
        {ratingItems.map((item, index) => (
          <View
            key={index}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#fff",
              padding: 16,
              marginBottom: 12,
              borderRadius: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
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
              <Text style={{ fontSize: 16, fontWeight: "600" }}>
                {item.label}
              </Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: "700" }}>
              {item.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Overall Explanation */}
      {overallExplanation && (
        <View
          style={{
            marginTop: 16,
            marginBottom: 32,
            padding: 16,
            backgroundColor: "#e0f2ff",
            borderRadius: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
            Overall Explanation
          </Text>
          <Text style={{ fontSize: 14, lineHeight: 20, color: "#333" }}>
            {overallExplanation}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
