import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useUserStore from "@/Zustand/store/authStore";

export default function Dashboard() {
  const { user } = useUserStore()
  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hi, {user?.name} 👋</Text>

      <View style={styles.cardContainer}>
        {/* Active Surveys */}
        <TouchableOpacity style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="newspaper" size={24} color="#1DA1F2" />
            <Text style={styles.cardTitle}>Active Surveys</Text>
          </View>
          <Text style={styles.cardSubtitle}>Share your thoughts</Text>
        </TouchableOpacity>

        {/* Results */}
        <TouchableOpacity style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="bar-chart" size={24} color="#10B981" />
            <Text style={styles.cardTitle}>Results</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            View your recent survey results .
          </Text>
        </TouchableOpacity>

        {/* AI Mentor Chat */}
        <TouchableOpacity style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="chatbubble-ellipses" size={24} color="#6366F1" />
            <Text style={styles.cardTitle}>AI Mentor Chat</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Chat with your AI mentor for guidance and support.
          </Text>
        </TouchableOpacity>

        {/* Community Discussions */}
        <TouchableOpacity style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="people" size={24} color="#F59E0B" />
            <Text style={styles.cardTitle}>Community Discussions</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Join the conversation and share your ideas.
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
    color: "#111827",
  },
  cardContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#4B5563",
  },
});
