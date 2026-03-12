import React from "react";
import { Text, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { ZoomIn, FadeInUp } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { styles } from "../styles/stats.styles";

interface StatsEmptyStateProps {
  t: (key: string) => string;
}

export const StatsEmptyState: React.FC<StatsEmptyStateProps> = ({ t }) => {
  const router = useRouter();

  return (
    <View style={styles.emptyContainer}>
      <Animated.View entering={ZoomIn.duration(600)} style={styles.emptyIconWrapper}>
        <View style={styles.emptyIconBg}>
          <Ionicons name="sparkles" size={60} color="#EAB308" />
        </View>
        <View style={styles.pulseContainer}>
          <Animated.View entering={ZoomIn.delay(300).duration(1000)} style={styles.pulse} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(300)} style={styles.emptyTextWrapper}>
        <Text style={styles.emptyTitle}>{t("stats.empty_title")}</Text>
        <Text style={styles.emptyDesc}>{t("stats.empty_desc")}</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(500)}>
        <Pressable
          style={({ pressed }) => [styles.startNowButton, pressed && styles.startNowButtonPressed]}
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
        >
          <Text style={styles.startNowText}>{t("stats.start_now")}</Text>
          <Ionicons name="arrow-forward" size={20} color="#0F172A" style={{ marginLeft: 8 }} />
        </Pressable>
      </Animated.View>
    </View>
  );
};
