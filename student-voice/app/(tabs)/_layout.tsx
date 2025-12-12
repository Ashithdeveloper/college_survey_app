import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import Dashboard from ".";
import Home from "./home";
import Rank from "./Rank";
import Profile from "./profile";

const TopTabs = createMaterialTopTabNavigator();

export default function TabsLayout() {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fff" }}
      edges={["left", "right", "bottom"]}
    >
      <TopTabs.Navigator
        tabBarPosition="bottom"
        screenOptions={{
          swipeEnabled: true,
          tabBarShowIcon: true,
          tabBarShowLabel: true,
          tabBarActiveTintColor: "#1DA1F2",
          tabBarInactiveTintColor: "#657786",
          tabBarIndicatorStyle: { backgroundColor: "#1DA1F2", top: 0 },
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderTopColor: "#E1E8ED",
            elevation: 4,
            height: 68,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginBottom: 4,
          },
        }}
        screenListeners={
          {
            // optional: to customize animation behavior or analytics
          }
        }
      >
        <TopTabs.Screen
          name="Dashboard"
          component={Dashboard}
          options={{
            tabBarLabel: "Dashboard",
            tabBarIcon: ({ color }) => (
              <Ionicons name="grid-outline" size={20} color={color} />
            ),
          }}
        />
        <TopTabs.Screen
          name="home"
          component={Home}
          options={{
            tabBarLabel: "Survey",
            tabBarIcon: ({ color }) => (
              <Ionicons name="school" size={20} color={color} />
            ),
          }}
        />
        <TopTabs.Screen
          name="Rank"
          component={Rank}
          options={{
            tabBarLabel: "Rank",
            tabBarIcon: ({ color }) => (
              <Ionicons name="trophy" size={20} color={color} />
            ),
          }}
        />
        <TopTabs.Screen
          name="Profile"
          component={Profile}
          options={{
            tabBarLabel: "Profile",
            tabBarIcon: ({ color }) => (
              <Ionicons name="person" size={20} color={color} />
            ),
          }}
        />
      </TopTabs.Navigator>
    </SafeAreaView>
  );
}
