import React from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import Animated, { 
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  FadeIn
} from "react-native-reanimated";
import { styles } from "../styles/history.styles";
import { HistoryItem as HistoryItemType } from "../types/zikir";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface HistoryItemProps {
  item: HistoryItemType;
  onDelete: (id: string) => void;
  onSelect: (item: HistoryItemType) => void;
  t: (key: string) => string;
  language: string;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({
  item,
  onDelete,
  onSelect,
  t,
  language,
}) => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const handleDelete = () => {
    translateX.value = withTiming(-SCREEN_WIDTH, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(onDelete)(item.id);
      }
    });
    opacity.value = withTiming(0, { duration: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const renderRightActions = () => (
    <View style={styles.deleteActionContainer}>
      <View style={styles.deleteAction}>
        <Ionicons name="trash-outline" size={24} color="#EF4444" />
      </View>
    </View>
  );

  return (
    <Animated.View entering={FadeIn.duration(300)} style={animatedStyle}>
      <Swipeable
        renderRightActions={renderRightActions}
        onSwipeableWillOpen={(direction) => {
          if (direction === "right") {
            handleDelete();
          }
        }}
        friction={2}
        overshootRight={false}
      >
        <Pressable
          style={[styles.card, item.isFinished && styles.cardFinished]}
          onPress={() => onSelect(item)}
        >
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.text}
              </Text>
              <View style={[styles.statusBadge, !item.isFinished && styles.statusBadgeOngoing]}>
                <Ionicons
                  name={item.isFinished ? "checkmark-circle" : "time"}
                  size={12}
                  color={item.isFinished ? "#10B981" : "#EAB308"}
                />
                <Text style={[styles.statusText, !item.isFinished && styles.statusTextOngoing]}>
                  {item.isFinished ? t("history.status_finished") : t("history.status_ongoing")}
                </Text>
              </View>
            </View>
            <View style={styles.countContainer}>
              <Text style={[styles.cardCount, item.isFinished && styles.cardCountFinished]}>
                {item.count}
              </Text>
              {item.target > 0 && <Text style={styles.cardTarget}>/ {item.target}</Text>}
            </View>
          </View>
          <Text style={styles.cardDate}>
            {new Date(item.date).toLocaleString(language === "tr" ? "tr-TR" : "en-US")}
          </Text>
        </Pressable>
      </Swipeable>
    </Animated.View>
  );
};
