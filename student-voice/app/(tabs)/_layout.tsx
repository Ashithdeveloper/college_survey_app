import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'

export default function _layout() {
  return (
    <Tabs screenOptions={
      {
        headerShown: false
      }
    }>
      <Tabs.Screen name="index"  />
      <Tabs.Screen name="profile"  />
      <Tabs.Screen name="Rank"  />
    </Tabs>
  )
}