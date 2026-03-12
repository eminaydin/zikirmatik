import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles/stats.styles";

interface StatsSummaryProps {
  totalCount: number;
  completedGoals: number;
  totalSessions: number; // kept for interface parity, but skipped in original layout
  t: (key: string) => string;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({
  totalCount,
  completedGoals,
  t,
}) => {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryCard}>
        <View style={[styles.iconBox, { backgroundColor: "rgba(234, 179, 8, 0.1)" }]}>
          <Ionicons name="stats-chart" size={24} color="#EAB308" />
        </View>
        <Text style={styles.summaryValue}>{totalCount}</Text>
        <Text style={styles.summaryLabel}>{t("stats.total_zikr")}</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={[styles.iconBox, { backgroundColor: "rgba(16, 185, 129, 0.1)" }]}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
        </View>
        <Text style={styles.summaryValue}>{completedGoals}</Text>
        <Text style={styles.summaryLabel}>{t("stats.completed_zikirs")}</Text>
      </View>
    </View>
  );
};
