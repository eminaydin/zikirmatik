import React from "react";
import { View, StatusBar } from "react-native";
import { GestureHandlerRootView, GestureDetector, Gesture } from "react-native-gesture-handler";
import { useAnimatedStyle, withTiming, runOnJS } from "react-native-reanimated";

import { styles, SIDEBAR_WIDTH } from "../styles/index.styles";
import { useCounter } from "../hooks/useCounter";

import { DhikrDisplay } from "../components/DhikrDisplay";
import { CounterCircle } from "../components/CounterCircle";
import { DhikrSidebar } from "../components/DhikrSidebar";
import { ReminderModal } from "../components/ReminderModal";
import { TopControls } from "../components/TopControls";
import { RateAppModal } from "../components/RateAppModal";

export default function CounterScreen() {
  const {
    zikir,
    isFinished,
    hapticsEnabled,
    isSidebarOpen,
    isReminderModalVisible,
    isRateModalVisible,
    reminderEnabled,
    reminderTime,
    showTimePicker,
    scale,
    sidebarTranslateX,
    sidebarOpacity,
    progressValue,
    pulseValue,
    setIsSidebarOpen,
    setIsReminderModalVisible,
    setIsRateModalVisible,
    setShowTimePicker,
    handlePress,
    resetCount,
    startFreeMode,
    toggleSidebar,
    toggleHaptics,
    changeLanguage,
    toggleReminder,
    onTimeChange,
    t,
    i18n,
    languages,
  } = useCounter();

  // Sidebar gesture
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const startX = isSidebarOpen ? 0 : -SIDEBAR_WIDTH;
      const nextX = startX + event.translationX;
      if (nextX <= 0) {
        sidebarTranslateX.value = nextX;
        sidebarOpacity.value = 1 + nextX / SIDEBAR_WIDTH;
      }
    })
    .onEnd((event) => {
      if (event.translationX > 100 || event.velocityX > 500) {
        sidebarTranslateX.value = withTiming(0, { duration: 200 });
        sidebarOpacity.value = withTiming(1, { duration: 200 });
        runOnJS(setIsSidebarOpen)(true);
      } else {
        sidebarTranslateX.value = withTiming(-SIDEBAR_WIDTH, { duration: 200 });
        sidebarOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(setIsSidebarOpen)(false);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * (isFinished ? pulseValue.value : 1) }],
  }));

  const finishedGlowStyle = useAnimatedStyle(() => ({
    opacity: isFinished ? withTiming(1) : withTiming(0),
    transform: [{ scale: pulseValue.value * 1.02 }],
  }));

  const sidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sidebarTranslateX.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: sidebarOpacity.value,
    display: sidebarOpacity.value === 0 ? "none" : "flex",
  }));

  const progressAnimationStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <GestureDetector gesture={panGesture}>
        <View style={styles.container}>
          <TopControls
            toggleSidebar={toggleSidebar}
            resetCount={resetCount}
            toggleHaptics={toggleHaptics}
            hapticsEnabled={hapticsEnabled}
            openReminder={() => setIsReminderModalVisible(true)}
            reminderEnabled={reminderEnabled}
          />

          <View style={styles.mainContent}>
            <DhikrDisplay zikir={zikir} progressAnimationStyle={progressAnimationStyle} />
            <CounterCircle
              zikir={zikir}
              isFinished={isFinished}
              animatedStyle={animatedStyle}
              finishedGlowStyle={finishedGlowStyle}
              gesture={Gesture.Tap().onEnd(() => runOnJS(handlePress)())}
              t={t}
            />
          </View>

      <DhikrSidebar
        isVisible={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        sidebarStyle={sidebarStyle}
        overlayStyle={overlayStyle}
        languages={languages}
        changeLanguage={changeLanguage}
        currentLanguage={i18n.language}
        startFreeMode={startFreeMode}
        setIsRateModalVisible={setIsRateModalVisible}
        t={t}
      />

      <RateAppModal
        isVisible={isRateModalVisible}
        onClose={() => setIsRateModalVisible(false)}
        t={t}
      />

          <ReminderModal
            isVisible={isReminderModalVisible}
            onClose={() => setIsReminderModalVisible(false)}
            reminderEnabled={reminderEnabled}
            toggleReminder={toggleReminder}
            reminderTime={reminderTime}
            onTimeChange={onTimeChange}
            showTimePicker={showTimePicker}
            setShowTimePicker={setShowTimePicker}
            t={t}
          />
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}
