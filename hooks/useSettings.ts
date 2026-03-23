import { useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter, useLocalSearchParams } from "expo-router";
import { Alert, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { useNotifications } from "./useNotifications";

export function useSettings() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { scheduleDailyNotification, cancelAllNotifications } =
    useNotifications();

  const [text, setText] = useState("");
  const [arabic, setArabic] = useState("");
  const [target, setTarget] = useState("33");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(
    new Date(new Date().setHours(20, 0, 0, 0)),
  );
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (params.id) {
      setText((params.text as string) || "");
      setArabic((params.arabic as string) || "");
      setTarget((params.target as string) || "33");
    }
  }, [params.id, params.text, params.arabic, params.target]);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("notification_time").then((val) => {
        if (val) {
          const { hour, minute } = JSON.parse(val);
          const date = new Date();
          date.setHours(hour, minute, 0, 0);
          setReminderTime(date);
          setReminderEnabled(true);
        }
      });
    }, []),
  );

  const toggleReminder = async (value: boolean) => {
    setReminderEnabled(value);
    if (value) {
      await scheduleDailyNotification(
        reminderTime.getHours(),
        reminderTime.getMinutes(),
      );
    } else {
      await cancelAllNotifications();
    }
  };

  const onTimeChange = async (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedDate) {
      setReminderTime(selectedDate);
      if (reminderEnabled) {
        await scheduleDailyNotification(
          selectedDate.getHours(),
          selectedDate.getMinutes(),
        );
      }
    }
  };

  const handleSave = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      Alert.alert(t("common.warning"), t("settings.error_empty"));
      return;
    }

    try {
      const stored = await AsyncStorage.getItem("zikir_history");
      let history = stored ? JSON.parse(stored) : [];

      if (params.id) {
        // Edit existing
        history = history.map((item: any) => {
          if (item.id === params.id) {
            return {
              ...item,
              text: trimmed,
              arabic: arabic.trim(),
              target: parseInt(target, 10) || 33,
            };
          }
          return item;
        });

        // Update selected_zikir if it's the one we're editing
        const currentSelected = await AsyncStorage.getItem("selected_zikir");
        if (currentSelected) {
          const parsed = JSON.parse(currentSelected);
          if (parsed.id === params.id) {
            await AsyncStorage.setItem(
              "selected_zikir",
              JSON.stringify({
                ...parsed,
                text: trimmed,
                arabic: arabic.trim(),
                target: parseInt(target, 10) || 33,
              }),
            );
          }
        }
      } else {
        // Create new
        const newItem = {
          id: Date.now().toString(),
          text: trimmed,
          arabic: arabic.trim(),
          target: parseInt(target, 10) || 33,
          count: 0,
          date: new Date().toISOString(),
          isFinished: false,
        };
        history.push(newItem);
        await AsyncStorage.setItem("selected_zikir", JSON.stringify(newItem));
      }

      await AsyncStorage.setItem("zikir_history", JSON.stringify(history));
      router.back();
    } catch (error) {
      console.error(error);
    }
  };

  return {
    t,
    text,
    setText,
    arabic,
    setArabic,
    target,
    setTarget,
    reminderEnabled,
    toggleReminder,
    reminderTime,
    onTimeChange,
    showTimePicker,
    setShowTimePicker,
    handleSave,
    isEdit: !!params.id,
  };
}
