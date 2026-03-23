import React from "react";
import { View, Text } from "react-native";
import Animated from "react-native-reanimated";
import { GestureDetector } from "react-native-gesture-handler";
import { styles } from "../styles/index.styles";

interface CounterCircleProps {
  zikir: any;
  isFinished: boolean;
  animatedStyle: any;
  finishedGlowStyle: any;
  gesture: any;
  t: (key: string) => string;
}

export const CounterCircle: React.FC<CounterCircleProps> = ({
  zikir,
  isFinished,
  animatedStyle,
  finishedGlowStyle,
  gesture,
  t,
}) => {
  return (
    <View style={styles.counterSection}>
      <GestureDetector gesture={gesture}>
        <View style={styles.touchArea}>
          <Animated.View
            style={[
              styles.outerCircle,
              isFinished && styles.circleFinished,
              animatedStyle,
            ]}
          >
            <Animated.View style={[styles.finishedGlow, finishedGlowStyle]} />
            <View style={[styles.innerCircle, isFinished && styles.innerCircleFinished]}>
              <View style={styles.finishedContent}>
                {isFinished && (
                  <Text style={styles.targetReachedText}>{t("home.target_reached")}</Text>
                )}
                <Text style={[styles.mainCount, isFinished && styles.mainCountFinished]}>
                  {zikir.count}
                </Text>
                {zikir.target > 0 && !isFinished && (
                  <Text style={styles.targetCount}>/ {zikir.target}</Text>
                )}
              </View>
            </View>
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
};
