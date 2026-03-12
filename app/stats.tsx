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
import { useFocusEffect, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Animated, {
  FadeInUp,
  ZoomIn,
} from "react-native-reanimated";

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
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCount: 0,
    completedGoals: 0,
    totalSessions: 0,
    dailyData: [] as { date: string; count: number }[],
  });

  const loadStats = useCallback(async () => {
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
          totalSessions: history.length,
          dailyData: chartData,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }, [i18n.language]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats]),
  );

  const maxDaily = Math.max(...stats.dailyData.map((d) => d.count), 1);

  if (stats.totalSessions === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Animated.View
          entering={ZoomIn.duration(600)}
          style={styles.emptyIconWrapper}
        >
          <View style={styles.emptyIconBg}>
            <Ionicons name="sparkles" size={60} color="#EAB308" />
          </View>
          <View style={styles.pulseContainer}>
            <Animated.View
              entering={ZoomIn.delay(300).duration(1000)}
              style={styles.pulse}
            />
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(300)}
          style={styles.emptyTextWrapper}
        >
          <Text style={styles.emptyTitle}>{t("stats.empty_title")}</Text>
          <Text style={styles.emptyDesc}>{t("stats.empty_desc")}</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500)}>
          <Pressable
            style={({ pressed }) => [
              styles.startNowButton,
              pressed && styles.startNowButtonPressed,
            ]}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/");
              }
            }}
          >
            <Text style={styles.startNowText}>{t("stats.start_now")}</Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#0F172A"
              style={{ marginLeft: 8 }}
            />
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <Animated.View
          entering={FadeInUp.delay(100)}
          style={styles.summaryCardLarge}
        >
          <View
            style={[
              styles.iconBox,
              { backgroundColor: "rgba(234, 179, 8, 0.1)" },
            ]}
          >
            <Ionicons name="stats-chart" size={24} color="#EAB308" />
          </View>
          <View>
            <Text style={styles.summaryValueLarge}>{stats.totalCount}</Text>
            <Text style={styles.summaryLabel}>{t("stats.total_zikr")}</Text>
          </View>
        </Animated.View>

        <View style={styles.summaryRow}>
          <Animated.View
            entering={FadeInUp.delay(200)}
            style={styles.summaryCardSmall}
          >
            <View
              style={[
                styles.iconBoxSmall,
                { backgroundColor: "rgba(16, 185, 129, 0.1)" },
              ]}
            >
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
            <Text style={styles.summaryValue}>{stats.completedGoals}</Text>
            <Text style={styles.summaryLabelSmall}>
              {t("stats.completed_zikirs")}
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(300)}
            style={styles.summaryCardSmall}
          >
            <View
              style={[
                styles.iconBoxSmall,
                { backgroundColor: "rgba(99, 102, 241, 0.1)" },
              ]}
            >
              <Ionicons name="time" size={20} color="#6366F1" />
            </View>
            <Text style={styles.summaryValue}>{stats.totalSessions}</Text>
            <Text style={styles.summaryLabelSmall}>
              {t("stats.total_sessions")}
            </Text>
          </Animated.View>
        </View>
      </View>

      {/* Activity Chart */}
      <Animated.View entering={FadeInUp.delay(400)} style={styles.chartSection}>
        <View style={styles.chartHeader}>
          <Text style={styles.sectionTitle}>{t("stats.daily_activity")}</Text>
          <View style={styles.legendDot}>
            <View style={styles.dot} />
            <Text style={styles.legendText}>{t("stats.total_zikr")}</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          {stats.dailyData.map((day, index) => (
            <View key={index} style={styles.chartBarWrapper}>
              <View style={styles.barBackground}>
                <View
                  style={[
                    styles.barFill,
                    { height: `${(day.count / maxDaily) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.chartDate}>{day.date}</Text>
              {day.count > 0 && (
                <View style={styles.chartValueBadge}>
                  <Text style={styles.chartValueText}>{day.count}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Info Box */}
      <Animated.View entering={FadeInUp.delay(500)} style={styles.infoBox}>
        <Ionicons
          name="bulb-outline"
          size={20}
          color="#6366F1"
          style={{ marginRight: 12 }}
        />
        <Text style={styles.infoText}>{t("stats.motivation")}</Text>
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
  summaryGrid: {
    marginBottom: 24,
  },
  summaryCardLarge: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 24,
    padding: 24,
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.dark.border,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryValueLarge: {
    color: Colors.dark.text,
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 38,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryCardSmall: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 20,
    padding: 16,
    width: (width - 52) / 2,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  iconBoxSmall: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryValue: {
    color: Colors.dark.text,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 2,
  },
  summaryLabel: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  summaryLabelSmall: {
    color: Colors.dark.textSecondary,
    fontSize: 11,
    fontWeight: "500",
  },
  chartSection: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 15,
    fontWeight: "700",
  },
  legendDot: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.primary,
    marginRight: 6,
  },
  legendText: {
    color: Colors.dark.textSecondary,
    fontSize: 11,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 160,
    paddingBottom: 20,
  },
  chartBarWrapper: {
    alignItems: "center",
    flex: 1,
  },
  barBackground: {
    width: 10,
    height: 100,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 5,
    justifyContent: "flex-end",
    marginBottom: 12,
  },
  barFill: {
    width: "100%",
    backgroundColor: Colors.dark.primary,
    borderRadius: 5,
  },
  chartDate: {
    color: Colors.dark.textSecondary,
    fontSize: 9,
    fontWeight: "600",
    transform: [{ rotate: "-45deg" }],
    marginTop: 4,
  },
  chartValueBadge: {
    position: "absolute",
    top: -24,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  chartValueText: {
    color: Colors.dark.primary,
    fontSize: 8,
    fontWeight: "700",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(99, 102, 241, 0.03)",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.1)",
  },
  infoText: {
    color: Colors.dark.textSecondary,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },

  // Empty State Styles
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  emptyIconWrapper: {
    marginBottom: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(234, 179, 8, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    borderWidth: 1,
    borderColor: "rgba(234, 179, 8, 0.2)",
  },
  pulseContainer: {
    position: "absolute",
    zIndex: 1,
  },
  pulse: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(234, 179, 8, 0.05)",
  },
  emptyTextWrapper: {
    alignItems: "center",
    marginBottom: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.dark.text,
    marginBottom: 16,
    textAlign: "center",
  },
  emptyDesc: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  startNowButton: {
    backgroundColor: Colors.dark.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 18,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  startNowButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  startNowText: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
  },
});
