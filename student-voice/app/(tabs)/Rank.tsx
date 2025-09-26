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

  return (
    <View className="flex-1 p-4 px-5 pb-0 bg-slate-300">
      <Text className="text-2xl font-bold mb-6 text-center">
        College Rankings
      </Text>

      <FlatList
        data={sortedColleges}
        keyExtractor={(_, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <View className="flex-row justify-between items-center p-4 mb-3 bg-white rounded-xl shadow-lg">
            <View className="flex-1 mr-4">
              <Text className="text-lg font-semibold flex-wrap">
                {item.name}
              </Text>
              <Text className="text-gray-500">{item.location}</Text>
            </View>
            <View className="bg-blue-500 px-4 py-2 rounded-lg">
              <Text className="text-white font-bold text-lg">
                {getDummyMark(index)}%
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
