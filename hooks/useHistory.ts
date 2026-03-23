import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { HistoryItem } from "../types/zikir";

export function useHistory() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"ongoing" | "finished">("ongoing");

  const loadHistory = useCallback(async () => {
    const val = await AsyncStorage.getItem("zikir_history");
    if (val) {
      const parsed = JSON.parse(val);
      const sorted = parsed.sort(
        (a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setHistory(sorted);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory]),
  );

  const deleteItem = async (id: string) => {
    const updatedHistory = history.filter((item) => item.id !== id);
    setHistory(updatedHistory);
    await AsyncStorage.setItem("zikir_history", JSON.stringify(updatedHistory));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const clearHistory = () => {
    Alert.alert(
      t("history.clear_confirm_title"),
      t("history.clear_confirm_body"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.yes_delete"),
          style: "destructive",
          onPress: async () => {
            setHistory([]);
            await AsyncStorage.removeItem("zikir_history");
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success,
            );
          },
        },
      ],
    );
  };

  const selectItem = async (item: any) => {
    if (item.isFinished && !item.isGroup) return;
    await Haptics.selectionAsync();

    if (item.isGroup && item.groupRoomId && item.memberId) {
      router.push({
        pathname: "/group-counter",
        params: { roomId: item.groupRoomId, memberId: item.memberId },
      });
      return;
    }

    await AsyncStorage.setItem(
      "selected_zikir",
      JSON.stringify({
        id: item.id,
        text: item.text,
        arabic: item.arabic,
        count: item.count,
        target: item.target,
      }),
    );
    router.back();
  };

  const editItem = (item: any) => {
    if (item.isGroup) {
      router.push("/group");
      return;
    }
    router.push({
      pathname: "/settings",
      params: {
        id: item.id,
        text: item.text,
        arabic: item.arabic,
        target: item.target.toString(),
      },
    });
  };

  const filteredHistory = history.filter((item) =>
    activeTab === "finished" ? item.isFinished : !item.isFinished,
  );

  return {
    history: filteredHistory,
    activeTab,
    setActiveTab,
    deleteItem,
    clearHistory,
    selectItem,
    editItem,
    t,
    i18n,
  };
}
