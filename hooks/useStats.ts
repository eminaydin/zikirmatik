import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import { HistoryItem, StatsData } from "../types/zikir";

export function useStats() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState<StatsData>({
    totalCount: 0,
    completedGoals: 0,
    totalSessions: 0,
    totalGroupCount: 0,
    completedGroupGoals: 0,
    totalGroupSessions: 0,
    dailyData: [],
  });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem("zikir_history");
      if (stored) {
        const history: HistoryItem[] = JSON.parse(stored);

        let total = 0;
        let completed = 0;
        let groupTotal = 0;
        let groupCompleted = 0;
        let groupSessions = 0;
        const dailyMap = new Map<string, number>();

        history.forEach((item) => {
          total += item.count;
          if (item.isFinished) completed++;

          if (item.isGroup) {
            groupTotal += item.count;
            if (item.isFinished) groupCompleted++;
            groupSessions++;
          }

          const dateKey = new Date(item.date).toLocaleDateString(
            i18n.language,
            {
              month: "short",
              day: "numeric",
            },
          );
          dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + item.count);
        });

        const chartData = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toLocaleDateString(i18n.language, {
            month: "short",
            day: "numeric",
          });
          chartData.push({
            date: key,
            count: dailyMap.get(key) || 0,
          });
        }

        setStats({
          totalCount: total,
          completedGoals: completed,
          totalSessions: history.length,
          totalGroupCount: groupTotal,
          completedGroupGoals: groupCompleted,
          totalGroupSessions: groupSessions,
          dailyData: chartData,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [i18n.language]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats]),
  );

  return {
    stats,
    loading,
    t,
    maxDaily: Math.max(...stats.dailyData.map((d) => d.count), 1),
  };
}
