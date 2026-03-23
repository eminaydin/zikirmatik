import React from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  FadeIn,
} from "react-native-reanimated";
import { styles } from "../styles/history.styles";
import { HistoryItem as HistoryItemType } from "../types/zikir";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface HistoryItemProps {
  item: HistoryItemType;
  onDelete: (id: string) => void;
  onSelect: (item: HistoryItemType) => void;
  onEdit: (item: HistoryItemType) => void;
  t: (key: string) => string;
  language: string;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({
  item,
  onDelete,
  onSelect,
  onEdit,
  t,
  language,
}) => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const handleDelete = () => {
    translateX.value = withTiming(
      -SCREEN_WIDTH,
      { duration: 300 },
      (finished) => {
        if (finished) {
          runOnJS(onDelete)(item.id);
        }
      },
    );
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
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 4,
                }}
              >
                {item.isGroup && (
                  <View
                    style={{
                      backgroundColor: "#EAB308",
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 9,
                        fontWeight: "900",
                        color: "#0F172A",
                      }}
                    >
                      {t("group.tag")}
                    </Text>
                  </View>
                )}
                {item.roomCode && (
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: "#EAB308",
                    }}
                  >
                    #{item.roomCode}
                  </Text>
                )}
              </View>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.text}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  !item.isFinished && styles.statusBadgeOngoing,
                ]}
              >
                <Ionicons
                  name={
                    item.isGroup
                      ? "people"
                      : item.isFinished
                        ? "checkmark-circle"
                        : "time"
                  }
                  size={12}
                  color={item.isFinished ? "#10B981" : "#EAB308"}
                />
                <Text
                  style={[
                    styles.statusText,
                    !item.isFinished && styles.statusTextOngoing,
                  ]}
                >
                  {item.isFinished
                    ? item.isGroup
                      ? t("group.all_done")
                      : t("history.status_finished")
                    : t("history.status_ongoing")}
                </Text>
              </View>
            </View>
            <View style={styles.countContainer}>
              <Text
                style={[
                  styles.cardCount,
                  item.isFinished && styles.cardCountFinished,
                ]}
              >
                {item.count}
              </Text>
              {item.target > 0 && (
                <Text style={styles.cardTarget}>/ {item.target}</Text>
              )}
            </View>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.cardDate}>
              {new Date(item.date).toLocaleString(
                language === "tr" ? "tr-TR" : "en-US",
              )}
            </Text>
            {!item.isFinished && (
              <Pressable
                onPress={() => onEdit(item)}
                style={({ pressed }) => [
                  styles.editButton,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Ionicons name="create-outline" size={18} color="#EAB308" />
              </Pressable>
            )}
          </View>
        </Pressable>
      </Swipeable>
    </Animated.View>
  );
};
