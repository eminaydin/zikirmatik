import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import Animated from "react-native-reanimated";
import { ZikirData } from "../types/zikir";
import { styles } from "../styles/index.styles";

interface DhikrDisplayProps {
  zikir: ZikirData;
  progressAnimationStyle: any;
}

export const DhikrDisplay: React.FC<DhikrDisplayProps> = ({
  zikir,
  progressAnimationStyle,
}) => {
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const [naturalTextHeight, setNaturalTextHeight] = useState(0);

  const needsExpansion = naturalTextHeight > 25;

  return (
    <Animated.View
      style={[
        styles.zikirDisplay,
        isTextExpanded && styles.zikirDisplayExpanded,
      ]}
    >
      <Pressable
        onPress={() => needsExpansion && setIsTextExpanded(!isTextExpanded)}
        style={styles.zikirContentContainer}
      >
        {zikir.arabic && (
          <Text
            style={[
              styles.arabicTextDisplay,
              !isTextExpanded && { fontSize: 24, marginBottom: 0 },
            ]}
            numberOfLines={isTextExpanded ? undefined : 1}
            onLayout={(e) => {
              if (naturalTextHeight === 0) {
                setNaturalTextHeight(e.nativeEvent.layout.height);
              }
            }}
          >
            {zikir.arabic}
          </Text>
        )}
        <Text
          style={[styles.zikirTextDisplay, !isTextExpanded && { fontSize: 13 }]}
          numberOfLines={isTextExpanded ? undefined : 1}
        >
          {zikir.text}
        </Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressActive, progressAnimationStyle]} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};
