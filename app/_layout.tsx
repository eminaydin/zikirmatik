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
          contentStyle: {
            backgroundColor: '#0F172A',
          },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Zikirmatik' }} />
        <Stack.Screen
          name="list"
          options={{ title: 'Tesbih Önerileri', presentation: 'modal' }}
        />
        <Stack.Screen
          name="settings"
          options={{ title: 'Yeni Zikir Ekle', presentation: 'modal' }}
        />
      </Stack>
    </>
  );
}
