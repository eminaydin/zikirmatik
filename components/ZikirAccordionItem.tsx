import React, { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import { ZikirItem } from "../constants/Recommendations";
import { styles } from "../styles/list.styles";

interface ZikirAccordionItemProps {
  item: ZikirItem;
  index: number;
  isExpanded: boolean;
  onPress: () => void;
  t: (key: string) => string;
}

export const ZikirAccordionItem: React.FC<ZikirAccordionItemProps> = ({
  item,
  index,
  isExpanded,
  onPress,
  t,
}) => {
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);

  useEffect(() => {
    if (measuredHeight !== null) {
      height.value = withTiming(isExpanded ? measuredHeight : 0, {
        duration: 400,
        easing: Easing.out(Easing.quad),
      });
      opacity.value = withTiming(isExpanded ? 1 : 0, { duration: 300 });
    }
  }, [isExpanded, measuredHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
    overflow: "hidden",
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (h > 0 && h !== measuredHeight) {
            setMeasuredHeight(h);
            if (isExpanded && measuredHeight === null) {
              height.value = h;
              opacity.value = 1;
            }
          }
        }}
        style={{ position: "absolute", width: "100%" }}
      >
        <Pressable
          style={[
            styles.card,
            index === 0 ? styles.cardFirst : styles.cardSubsequent,
          ]}
          onPress={onPress}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              {t(`recommendations.${item.id}.text`)}
            </Text>
            <Text style={styles.cardTarget}>{item.target}×</Text>
          </View>
          {item.arabic && <Text style={styles.cardArabic}>{item.arabic}</Text>}
          <Text style={styles.cardTranslation}>
            {t(`recommendations.${item.id}.translation`)}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardSource}>
              📖 {t(`recommendations.${item.id}.source`)}
            </Text>
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );
};
