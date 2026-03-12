import React, { useEffect } from "react";
import { Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { styles } from "../styles/list.styles";
import { Colors } from "../constants/Colors";

interface ZikirSectionHeaderProps {
  title: string;
  isExpanded: boolean;
  onPress: () => void;
  t: (key: string) => string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ZikirSectionHeader: React.FC<ZikirSectionHeaderProps> = ({
  title,
  isExpanded,
  onPress,
  t,
}) => {
  const progress = useSharedValue(isExpanded ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isExpanded ? 1 : 0, { duration: 300 });
  }, [isExpanded]);

  const animatedStyle = useAnimatedStyle(() => ({
    marginBottom: withTiming(isExpanded ? 0 : 8, { duration: 300 }),
    borderBottomLeftRadius: withTiming(isExpanded ? 0 : 16, { duration: 300 }),
    borderBottomRightRadius: withTiming(isExpanded ? 0 : 16, { duration: 300 }),
    borderColor: isExpanded ? Colors.dark.primary : Colors.dark.border,
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: isExpanded ? Colors.dark.primary : Colors.dark.text,
  }));

  return (
    <AnimatedPressable
      style={[styles.sectionHeader, animatedStyle]}
      onPress={onPress}
    >
      <Animated.Text style={[styles.sectionTitle, textStyle]}>
        {t(`list.categories.${title}`)}
      </Animated.Text>
      <Ionicons
        name={isExpanded ? "chevron-up" : "chevron-down"}
        size={20}
        color={isExpanded ? Colors.dark.primary : Colors.dark.textSecondary}
      />
    </AnimatedPressable>
  );
};
