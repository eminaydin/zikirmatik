import React from "react";
import { View, Text } from "react-native";
import { styles } from "../styles/stats.styles";

interface DailyStatsChartProps {
  dailyData: { date: string; count: number }[];
  maxDaily: number;
  t: (key: string) => string;
}

export const DailyStatsChart: React.FC<DailyStatsChartProps> = ({
  dailyData,
  maxDaily,
  t,
}) => {
  return (
    <View style={styles.chartSection}>
      <Text style={styles.sectionTitle}>{t("stats.daily_activity")}</Text>
      <View style={styles.chartContainer}>
        {dailyData.map((day, index) => (
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
            <Text style={styles.chartValue}>{day.count > 0 ? day.count : ""}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
