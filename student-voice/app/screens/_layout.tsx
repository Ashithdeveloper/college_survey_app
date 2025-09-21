import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Screen() {
  return (
    <SafeAreaView style={{ flex: 1 }}
     edges={['bottom', 'left', 'right']}>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}