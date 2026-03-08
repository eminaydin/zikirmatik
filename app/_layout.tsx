import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../i18n";
import { useTranslation } from "react-i18next";

export default function RootLayout() {
  const { t } = useTranslation();
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#0F172A",
          },
          headerTintColor: "#EAB308",
          headerShadowVisible: false,
          gestureEnabled: true,
          animation: "slide_from_right",
          contentStyle: {
            backgroundColor: "#0F172A",
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: t("common.app_name"), headerShown: false }}
        />
        <Stack.Screen
          name="list"
          options={{ title: t("list.title"), presentation: "modal" }}
        />
        <Stack.Screen
          name="settings"
          options={{ title: t("settings.title"), presentation: "modal" }}
        />
        <Stack.Screen name="history" options={{ title: t("history.title") }} />
      </Stack>
    </>
  );
}
