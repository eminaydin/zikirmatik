import React from "react";
import { ScrollView, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { styles } from "../styles/stats.styles";
import { useStats } from "../hooks/useStats";
import { StatsSummary } from "../components/StatsSummary";
import { DailyStatsChart } from "../components/DailyStatsChart";
import { StatsEmptyState } from "../components/StatsEmptyState";

export default function StatsScreen() {
  const { stats, t, maxDaily } = useStats();

  if (stats.totalSessions === 0) {
    return <StatsEmptyState t={t} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInUp.duration(600)}>
        <StatsSummary
          totalCount={stats.totalCount}
          completedGoals={stats.completedGoals}
          totalSessions={stats.totalSessions}
          t={t}
        />

        <DailyStatsChart dailyData={stats.dailyData} maxDaily={maxDaily} t={t} />

        <Animated.View entering={FadeInUp.delay(400)} style={styles.infoBox}>
          <Ionicons name="bulb-outline" size={20} color="#6366F1" style={{ marginRight: 12 }} />
          <Text style={styles.infoText}>{t("stats.motivation")}</Text>
        </Animated.View>
      </Animated.View>
    </ScrollView>
  );
}
