import { View, Text, FlatList } from "react-native";
import React from "react";
import { CollegeName } from "@/config/CollegeName";

export default function Rank() {
  const sortedColleges = [
    ...CollegeName.filter(
      (c) => c.name === "Mar Ephraem College of Engineering and Technology"
    ),
    ...CollegeName.filter(
      (c) => c.name !== "Mar Ephraem College of Engineering and Technology"
    ),
  ];

  const getDummyMark = (index: number) => {
    if (index === 0) return 95;
    return 70 + Math.floor(Math.random() * 26);
  };

  const getRankLabel = (index: number) => {
    switch (index) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return `#${index + 1}`;
    }
  };

  return (
    <View className="flex-1 bg-white px-5 py-4 pb-0">
      {/* Title */}
      <Text className="text-3xl font-extrabold text-center text-gray-800 mb-6">
        College Rankings
      </Text>

      <FlatList
        data={sortedColleges}
        keyExtractor={(_, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item, index }) => {
          const isUserCollege =
            item.name === "Mar Ephraem College of Engineering and Technology";
          const score = getDummyMark(index);

          return (
            <View
              className={`flex-row justify-between items-center p-5 mb-4 rounded-xl shadow-sm ${
                isUserCollege
                  ? "bg-blue-600 shadow-blue-300"
                  : "bg-white shadow-gray-200"
              }`}
            >
              {/* Left Side: College Info */}
              <View className="flex-1 mr-4">
                <View className="flex-row items-center mb-1">
                  <Text
                    className={`text-xl font-bold ${
                      isUserCollege ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {getRankLabel(index)}
                  </Text>
                  <Text
                    className={`ml-2 text-lg font-semibold ${
                      isUserCollege ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {item.name}
                  </Text>
                </View>
                <Text
                  className={`text-sm ${
                    isUserCollege ? "text-blue-200" : "text-gray-500"
                  }`}
                >
                  {item.location}
                </Text>
              </View>

              {/* Right Side: Score Badge */}
              <View
                className={`px-4 py-2 rounded-full ${
                  isUserCollege ? "bg-white" : "bg-blue-500"
                }`}
              >
                <Text
                  className={`font-bold text-lg ${
                    isUserCollege ? "text-blue-600" : "text-white"
                  }`}
                >
                  {score}%
                </Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
