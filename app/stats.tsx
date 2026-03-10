import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  Pressable,
} from "react-native";
import { Colors } from "../constants/Colors";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Animated, { FadeInUp } from "react-native-reanimated";

const { width } = Dimensions.get("window");

interface HistoryItem {
  id: string;
  text: string;
  count: number;
  target: number;
  date: string;
  isFinished: boolean;
}

export default function StatsScreen() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState({
    totalCount: 0,
    completedGoals: 0,
    dailyData: [] as { date: string; count: number }[],
  });

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, []),
  );

  const loadStats = async () => {
    try {
      const stored = await AsyncStorage.getItem("zikir_history");
      if (stored) {
        const history: HistoryItem[] = JSON.parse(stored);
        
        let total = 0;
        let completed = 0;
        const dailyMap = new Map<string, number>();

        history.forEach((item) => {
          total += item.count;
          if (item.isFinished) completed++;
          
          const dateKey = new Date(item.date).toLocaleDateString(i18n.language, {
            month: "short",
            day: "numeric",
          });
          dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + item.count);
        });

        // Get last 7 days
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
          dailyData: chartData,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const maxDaily = Math.max(...stats.dailyData.map(d => d.count), 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <Animated.View entering={FadeInUp.delay(100)} style={styles.summaryCard}>
          <View style={[styles.iconBox, { backgroundColor: "rgba(234, 179, 8, 0.1)" }]}>
            <Ionicons name="stats-chart" size={24} color="#EAB308" />
          </View>
          <Text style={styles.summaryValue}>{stats.totalCount}</Text>
          <Text style={styles.summaryLabel}>{t("stats.total_zikr")}</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200)} style={styles.summaryCard}>
          <View style={[styles.iconBox, { backgroundColor: "rgba(16, 185, 129, 0.1)" }]}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          </View>
          <Text style={styles.summaryValue}>{stats.completedGoals}</Text>
          <Text style={styles.summaryLabel}>{t("stats.completed_zikirs")}</Text>
        </Animated.View>
      </View>

      {/* Activity Chart */}
      <Animated.View entering={FadeInUp.delay(300)} style={styles.chartSection}>
        <Text style={styles.sectionTitle}>{t("stats.daily_activity")}</Text>
        <View style={styles.chartContainer}>
          {stats.dailyData.map((day, index) => (
            <View key={index} style={styles.chartBarWrapper}>
              <View style={styles.barBackground}>
                <View 
                  style={[
                    styles.barFill, 
                    { height: `${(day.count / maxDaily) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.chartDate}>{day.date}</Text>
              <Text style={styles.chartValue}>{day.count > 0 ? day.count : ""}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Placeholder for more detailed stats or tips */}
      <Animated.View entering={FadeInUp.delay(400)} style={styles.infoBox}>
        <Ionicons name="bulb-outline" size={20} color="#6366F1" style={{ marginRight: 12 }} />
        <Text style={styles.infoText}>
          {t("stats.motivation")}
        </Text>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 20,
    padding: 20,
    width: (width - 55) / 2,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryValue: {
    color: Colors.dark.text,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  summaryLabel: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  chartSection: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 24,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 180,
  },
  chartBarWrapper: {
    alignItems: "center",
    flex: 1,
  },
  barBackground: {
    width: 8,
    height: 120,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 4,
    justifyContent: "flex-end",
    marginBottom: 12,
  },
  barFill: {
    width: "100%",
    backgroundColor: Colors.dark.primary,
    borderRadius: 4,
  },
  chartDate: {
    color: Colors.dark.textSecondary,
    fontSize: 9,
    fontWeight: "600",
    transform: [{ rotate: "-45deg" }],
    marginTop: 4,
  },
  chartValue: {
    color: Colors.dark.primary,
    fontSize: 8,
    marginTop: 4,
    position: "absolute",
    top: -20,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(99, 102, 241, 0.05)",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.15)",
  },
  infoText: {
    color: Colors.dark.textSecondary,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
});
