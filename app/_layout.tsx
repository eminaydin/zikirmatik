import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0F172A',
          },
          headerTintColor: '#EAB308',
          headerShadowVisible: false,
          gestureEnabled: true,
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: '#0F172A',
          },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Zikirmatik', headerShown:false }} />
        <Stack.Screen
          name="list"
          options={{ title: 'Tesbih Önerileri', presentation: 'modal' }}
        />
        <Stack.Screen
          name="settings"
          options={{ title: 'Yeni Zikir Ekle', presentation: 'modal' }}
        />
        <Stack.Screen
          name="history"
          options={{ 
            title: 'Zikir Geçmişi',
            headerTitleAlign: 'center',
          }}
        />
      </Stack>
    </>
  );
}
