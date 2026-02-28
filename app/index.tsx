import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
  Animated as RNAnimated,
  Platform,
  Modal,
  Switch,
  Image,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  runOnJS,
  LinearTransition,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotifications } from '../hooks/useNotifications';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');

interface ZikirData {
  id: string; // Dynamic session ID
  text: string;
  arabic?: string;
  target: number;
  count: number;
}

const DEFAULT_ZIKIR: ZikirData = {
  id: 'default',
  text: 'Sübhanallah',
  arabic: 'سُبْحَانَ اللَّهِ',
  target: 33,
  count: 0,
};

import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function CounterScreen() {
  const [zikir, setZikir] = useState<ZikirData>(DEFAULT_ZIKIR);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const [naturalTextHeight, setNaturalTextHeight] = useState(0);
  const [isReminderModalVisible, setIsReminderModalVisible] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date(new Date().setHours(20, 0, 0, 0)));
  const [showTimePicker, setShowTimePicker] = useState(false);

  const { scheduleDailyNotification, cancelAllNotifications } = useNotifications();

  // Constants for collision detection
  const COUNTER_TOP_MARGIN = height * 0.18;
  const CIRCLE_RADIUS = (width * 0.70) / 2; // Slightly smaller visual radius
  const COUNTER_CENTER_Y = height / 2 + COUNTER_TOP_MARGIN;
  const SAFE_Y_BOUNDARY = COUNTER_CENTER_Y - CIRCLE_RADIUS - 120; // Significant 120px buffer

  const scale = useSharedValue(1);
  const sidebarTranslateX = useSharedValue(-width);
  const sidebarOpacity = useSharedValue(0);
  const progressValue = useSharedValue(zikir.target > 0 ? zikir.count / zikir.target : 0);
  const router = useRouter();

  useEffect(() => {
    progressValue.value = withTiming(zikir.target > 0 ? Math.min(zikir.count / zikir.target, 1) : 0, {
      duration: 300,
    });
    setIsTextExpanded(false); // Reset expansion when zikir changes
  }, [zikir.count, zikir.target, zikir.text]);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('selected_zikir').then((value) => {
        if (value) setZikir(JSON.parse(value));
      });
      AsyncStorage.getItem('haptics_enabled').then((val) => {
        if (val !== null) setHapticsEnabled(val === 'true');
      });

      // Load reminder settings
      AsyncStorage.getItem('notification_time').then((val) => {
        if (val) {
          const { hour, minute } = JSON.parse(val);
          const date = new Date();
          date.setHours(hour, minute, 0, 0);
          setReminderTime(date);
          setReminderEnabled(true);
        } else {
          setReminderEnabled(false);
        }
      });
    }, [])
  );

  const toggleSidebar = useCallback(() => {
    const nextState = !isSidebarOpen;
    setIsSidebarOpen(nextState);
    sidebarTranslateX.value = withTiming(nextState ? 0 : -width, { duration: 250 });
    sidebarOpacity.value = withTiming(nextState ? 1 : 0, { duration: 250 });
  }, [isSidebarOpen]);

  const panGesture = Gesture.Pan()
    .onStart((_)=> {
      // No context needed for simple swipe
    })
    .onUpdate((event) => {
        const startX = isSidebarOpen ? 0 : -width;
        const nextX = startX + event.translationX;
        
        if (nextX <= 0) {
            sidebarTranslateX.value = nextX;
            sidebarOpacity.value = 1 + nextX / width;
        }
    })
    .onEnd((event) => {
        if (event.translationX > 100 || event.velocityX > 500) {
            sidebarTranslateX.value = withTiming(0, { duration: 200 });
            sidebarOpacity.value = withTiming(1, { duration: 200 });
            runOnJS(setIsSidebarOpen)(true);
        } else {
            sidebarTranslateX.value = withTiming(-width, { duration: 200 });
            sidebarOpacity.value = withTiming(0, { duration: 200 });
            runOnJS(setIsSidebarOpen)(false);
        }
    });

  const toggleHaptics = async () => {
    const newState = !hapticsEnabled;
    setHapticsEnabled(newState);
    await AsyncStorage.setItem('haptics_enabled', newState.toString());
    if (newState) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const save = async (data: ZikirData) => {
    setZikir(data);
    await AsyncStorage.setItem('selected_zikir', JSON.stringify(data));
    updateHistory(data);
  };

  const updateHistory = async (data: ZikirData) => {
    try {
      const historyVal = await AsyncStorage.getItem('zikir_history');
      let history = historyVal ? JSON.parse(historyVal) : [];
      
      const index = history.findIndex((h: any) => h.id === data.id);
      
      if (index !== -1) {
        // Update existing specific session
        history[index] = {
          ...history[index],
          count: data.count,
          target: data.target,
          arabic: data.arabic,
          isFinished: data.count >= data.target,
          date: new Date().toISOString(), // Update last activity time
        };
      } else {
        // Fallback for older data or manual entry
        history.push({
          id: data.id || Date.now().toString(),
          text: data.text,
          arabic: data.arabic,
          count: data.count,
          target: data.target,
          date: new Date().toISOString(),
          isFinished: data.count >= data.target,
        });
      }

      await AsyncStorage.setItem('zikir_history', JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }
  };

  const isFinished = zikir.count >= zikir.target;

  const handlePress = useCallback(async () => {
    if (isFinished) return;

    if (hapticsEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    scale.value = withSequence(
      withTiming(0.95, { duration: 50 }),
      withSpring(1.05, { damping: 10, stiffness: 500 }),
      withSpring(1, { damping: 15, stiffness: 300 })
    );

    const newCount = zikir.count + 1;
    if (newCount === zikir.target && hapticsEnabled) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    await save({ ...zikir, count: newCount });
  }, [zikir, isFinished, hapticsEnabled]);

  const resetCount = async () => {
    if (hapticsEnabled) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    
    if (isFinished) {
      // If finished, start a brand NEW session
      const newZikir = {
        ...zikir,
        id: Date.now().toString(),
        count: 0
      };
      setZikir(newZikir);
      await AsyncStorage.setItem('selected_zikir', JSON.stringify(newZikir));
      await updateHistory(newZikir);
    } else {
      await save({ ...zikir, count: 0 });
    }
  };

  const nextRound = async () => {
    if (hapticsEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Create a new session for the next round
    const newZikir = {
      ...zikir,
      id: Date.now().toString(),
      count: 0
    };
    setZikir(newZikir);
    await AsyncStorage.setItem('selected_zikir', JSON.stringify(newZikir));
    await updateHistory(newZikir);
  };

  const toggleReminder = async (value: boolean) => {
    setReminderEnabled(value);
    if (value) {
      await scheduleDailyNotification(reminderTime.getHours(), reminderTime.getMinutes());
    } else {
      await cancelAllNotifications();
    }
  };

  const onTimeChange = async (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setReminderTime(selectedDate);
      if (reminderEnabled) {
        await scheduleDailyNotification(selectedDate.getHours(), selectedDate.getMinutes());
      }
    }
  };

  const pulseValue = useSharedValue(1);

  useEffect(() => {
    if (isFinished) {
      pulseValue.value = withRepeat(
        withTiming(1.1, { duration: 1500 }),
        -1,
        true
      );
    } else {
      pulseValue.value = 1;
    }
  }, [isFinished]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * (isFinished ? pulseValue.value : 1) }],
    shadowRadius: withTiming(isFinished ? 40 : (scale.value > 1 ? 30 : 20), { duration: 100 }),
    shadowOpacity: withTiming(isFinished ? 0.8 : (scale.value > 1 ? 0.5 : 0.3), { duration: 100 }),
  }));

  const finishedGlowStyle = useAnimatedStyle(() => ({
    opacity: isFinished ? withTiming(1) : withTiming(0),
    transform: [{ scale: pulseValue.value * 1.05 }],
  }));

  const sidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sidebarTranslateX.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: sidebarOpacity.value,
    display: sidebarOpacity.value === 0 ? 'none' : 'flex' as any,
  }));

  const progressAnimationStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }));


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.container}>
          {/* Top Bar - Integrated look */}
          <View style={styles.topBar}>
            <Pressable onPress={toggleSidebar} style={styles.topBarIcon}>
              <Ionicons name="menu-outline" size={24} color={Colors.dark.primary} />
            </Pressable>

            <View style={styles.topBarCenter}>
              <Text style={styles.topBarTitle}>ZİKİRMATİK</Text>
              <Text style={styles.topBarCount}>
                {zikir.count} / {zikir.target}
              </Text>
            </View>
            
            <View style={styles.topBarRight}>
              <Pressable onPress={resetCount} style={styles.topBarIconSmall}>
                <Ionicons name="refresh" size={18} color="#EF4444" />
              </Pressable>

              <Pressable onPress={toggleHaptics} style={[styles.topBarIconSmall, { marginLeft: 12 }]}>
                <MaterialCommunityIcons 
                  name={hapticsEnabled ? "vibrate" : "vibrate-off"} 
                  size={20} 
                  color={isFinished ? '#10B981' : (hapticsEnabled ? Colors.dark.primary : Colors.dark.textSecondary)} 
                />
              </Pressable>

              <Pressable 
                onPress={() => setIsReminderModalVisible(true)} 
                style={[styles.topBarIconSmall, { marginLeft: 8 }]}
              >
                <Ionicons 
                  name={reminderEnabled ? "notifications" : "notifications-outline"} 
                  size={18} 
                  color={reminderEnabled ? Colors.dark.primary : Colors.dark.textSecondary} 
                />
              </Pressable>
            </View>
          </View>

          {/* Main Content Area */}
          <View style={styles.mainContent}>

            {/* Counter Section - Absolutely Centered */}
            <View style={styles.counterSection}>
              <Pressable
                onPress={handlePress}
                style={styles.touchArea}
                disabled={isFinished}
              >
                <Animated.View
                  style={[
                    styles.outerCircle,
                    animatedStyle,
                    isFinished && styles.circleFinished,
                  ]}
                >
                  {isFinished && (
                    <Animated.View 
                      style={[styles.finishedGlow, finishedGlowStyle]} 
                    />
                  )}
                  <View style={[styles.innerCircle, isFinished && styles.innerCircleFinished]}>
                    {isFinished ? (
                      <View style={styles.finishedContent}>
                        <Ionicons name="checkmark-circle" size={40} color="#10B981" style={{ marginBottom: 10 }} />
                        <Text style={styles.mainCountFinished}>
                          {zikir.count}
                        </Text>
                        <Text style={styles.targetReachedText}>TAMAMLANDI</Text>
                      </View>
                    ) : (
                      <Text style={styles.mainCount}>
                        {zikir.count}
                      </Text>
                    )}
                  </View>
                </Animated.View>
              </Pressable>
            </View>

            {/* Hidden measurement view to get natural height */}
            <View 
              style={[styles.zikirDisplay, { opacity: 0, position: 'absolute', zIndex: -1 }]}
              pointerEvents="none"
            >
              <View 
                style={styles.zikirContentContainer}
                onLayout={(e) => {
                  const h = e.nativeEvent.layout.height;
                  if (h > 0) setNaturalTextHeight(h);
                }}
              >
                {zikir.arabic && <Text style={styles.arabicTextDisplay}>{zikir.arabic}</Text>}
                <Text style={styles.zikirTextDisplay}>{zikir.text}</Text>
              </View>
            </View>

            {/* Zikir Display - Floating Top */}
            <AnimatedPressable 
              layout={LinearTransition.duration(300)}
              onPress={() => {
                if (naturalTextHeight > SAFE_Y_BOUNDARY) {
                  setIsTextExpanded(!isTextExpanded);
                }
              }}
              style={[
                styles.zikirDisplay,
                isTextExpanded && styles.zikirDisplayExpanded,
                isFinished && { borderColor: '#10B981' }
              ]}
            >
              <View style={styles.zikirContentContainer}>
                {zikir.arabic && (
                  <Text 
                    style={[styles.arabicTextDisplay, isFinished && { color: '#10B981' }]}
                    numberOfLines={isTextExpanded || naturalTextHeight <= SAFE_Y_BOUNDARY ? 0 : 1}
                  >
                    {zikir.arabic}
                  </Text>
                )}
                <Text 
                  style={styles.zikirTextDisplay}
                  numberOfLines={isTextExpanded || naturalTextHeight <= SAFE_Y_BOUNDARY ? 0 : 2}
                >
                  {zikir.text}
                </Text>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressTrack}>
                    <Animated.View
                      style={[
                        styles.progressActive,
                        progressAnimationStyle,
                        isFinished && { backgroundColor: '#10B981' },
                      ]}
                    />
                  </View>
                </View>

                {naturalTextHeight > SAFE_Y_BOUNDARY && (
                  <Animated.View style={[
                    styles.expandHint,
                    { transform: [{ rotate: isTextExpanded ? '180deg' : '0deg' }] }
                  ]}>
                    <Ionicons name="chevron-down" size={14} color={isFinished ? '#10B981' : Colors.dark.primary} />
                  </Animated.View>
                )}
              </View>
            </AnimatedPressable>
          </View>


          {/* Sidebar Overlay */}
          <Animated.View style={[styles.overlay, overlayStyle]}>
            <Pressable style={styles.overlayPressable} onPress={toggleSidebar} />
          </Animated.View>

          {/* Sidebar Content */}
          <Animated.View style={[styles.sidebar, sidebarStyle]}>
            <View style={styles.sidebarHeader}>
              <View>
                <Text style={styles.sidebarTitleMain}>MENÜ</Text>
                <View style={styles.titleUnderline} />
              </View>
              <Pressable onPress={toggleSidebar} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.dark.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.sidebarContent}>
              <Pressable 
                style={({ pressed }) => [styles.sidebarItem, pressed && styles.sidebarItemPressed]} 
                onPress={() => { router.push('/settings'); toggleSidebar(); }}
              >
                <View style={[styles.sidebarIconWrapper, { backgroundColor: 'rgba(234, 179, 8, 0.1)' }]}>
                  <Ionicons name="add-outline" size={22} color="#EAB308" />
                </View>
                <Text style={styles.sidebarItemText}>Yeni Zikir Ekle</Text>
              </Pressable>

              <Pressable 
                style={({ pressed }) => [styles.sidebarItem, pressed && styles.sidebarItemPressed]} 
                onPress={() => { router.push('/list'); toggleSidebar(); }}
              >
                <View style={[styles.sidebarIconWrapper, { backgroundColor: 'rgba(20, 184, 166, 0.1)' }]}>
                  <Ionicons name="bookmarks-outline" size={20} color="#14B8A6" />
                </View>
                <Text style={styles.sidebarItemText}>Zikir Önerileri</Text>
              </Pressable>

              <Pressable 
                style={({ pressed }) => [styles.sidebarItem, pressed && styles.sidebarItemPressed]} 
                onPress={() => { router.push('/history'); toggleSidebar(); }}
              >
                <View style={[styles.sidebarIconWrapper, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                  <Ionicons name="time-outline" size={22} color="#6366F1" />
                </View>
                <Text style={styles.sidebarItemText}>Zikir Geçmişim</Text>
              </Pressable>

              <View style={styles.sidebarDivider} />
            </View>

            <View style={styles.sidebarFooter}>
              <Text style={styles.versionText}>Zikirmatik v1.5</Text>
            </View>
          </Animated.View>

          <View style={{ height: 40 }} />

          {/* Reminder Modal */}
          <Modal
            visible={isReminderModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setIsReminderModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <Pressable style={styles.modalBg} onPress={() => setIsReminderModalVisible(false)} />
              <View style={styles.reminderCard}>
                <View style={styles.reminderHeader}>
                  <Text style={styles.reminderTitle}>Zikir Hatırlatıcısı</Text>
                  <Pressable onPress={() => setIsReminderModalVisible(false)}>
                    <Ionicons name="close" size={24} color={Colors.dark.textSecondary} />
                  </Pressable>
                </View>

                <View style={styles.reminderContent}>
                  <View style={styles.reminderRow}>
                    <View>
                      <Text style={styles.reminderLabel}>Günlük Bildirim</Text>
                      <Text style={styles.reminderSubLabel}>Sizin için sessiz bir huzur vakti ayıralım.</Text>
                    </View>
                    <Switch
                      value={reminderEnabled}
                      onValueChange={toggleReminder}
                      trackColor={{ false: '#334155', true: Colors.dark.primary }}
                      thumbColor={reminderEnabled ? '#FFF' : '#94A3B8'}
                    />
                  </View>

                  {reminderEnabled && (
                    <Pressable 
                      onPress={() => setShowTimePicker(true)}
                      style={styles.timeSelectBox}
                    >
                      <Text style={styles.timeLabel}>Hatırlatma Saati</Text>
                      <View style={styles.timeDisplay}>
                        <Text style={styles.timeValue}>
                          {reminderTime.getHours().toString().padStart(2, '0')}:
                          {reminderTime.getMinutes().toString().padStart(2, '0')}
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color={Colors.dark.primary} />
                      </View>
                    </Pressable>
                  )}

                  {showTimePicker && (
                    <DateTimePicker
                      value={reminderTime}
                      mode="time"
                      is24Hour={true}
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onTimeChange}
                      textColor="#FFF"
                    />
                  )}
                </View>

                <Pressable 
                  style={styles.doneButton}
                  onPress={() => setIsReminderModalVisible(false)}
                >
                  <Text style={styles.doneButtonText}>Tamam</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40, // Increased back to account for StatusBar since header is gone
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  topBarCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: Platform.OS === 'ios' ? 60 : 40, // Matches topBar paddingTop
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  topBarIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  topBarIconSmall: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  topBarRight: {
    flexDirection: 'row',
  },
  topBarTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.dark.textSecondary,
    letterSpacing: 2,
    marginBottom: 4,
  },
  topBarCount: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.dark.text,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  zikirDisplay: {
    position: 'absolute',
    top: 5,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 20,
    overflow: 'hidden',
  },
  zikirDisplayExpanded: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderColor: Colors.dark.primary,
  },
  zikirContentContainer: {
    padding: 16,
    alignItems: 'center',
  },
  arabicTextDisplay: {
    fontSize: 28,
    color: Colors.dark.primary,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Traditional Arabic' : 'serif',
    lineHeight: 40,
    marginBottom: 4,
  },
  zikirTextDisplay: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  progressContainer: {
    width: '100%',
    height: 4,
    marginTop: 4,
  },
  expandHint: {
    position: 'absolute',
    bottom: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressActive: {
    height: '100%',
    backgroundColor: Colors.dark.primary,
    borderRadius: 2,
  },
  counterSection: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: height * 0.18, // Moved lower
  },
  touchArea: {
    width: width * 0.8,
    height: width * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    width: width * 0.70,
    height: width * 0.70,
    borderRadius: (width * 0.70) / 2,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: Colors.dark.primary,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  innerCircle: {
    width: width * 0.62,
    height: width * 0.62,
    borderRadius: (width * 0.62) / 2,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleFinished: {
    backgroundColor: 'rgba(16, 185, 129, 0.02)',
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 20,
  },
  finishedGlow: {
    position: 'absolute',
    width: width * 0.72,
    height: width * 0.72,
    borderRadius: (width * 0.72) / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  innerCircleFinished: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
  },
  finishedContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetReachedText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#10B981',
    letterSpacing: 4,
    marginTop: 8,
    opacity: 0.9,
  },
  mainCount: {
    fontSize: 110,
    fontWeight: '900',
    color: Colors.dark.text,
    includeFontPadding: false,
  },
  mainCountFinished: {
    fontSize: 85,
    fontWeight: '900',
    color: '#F8FAFC',
    textShadowColor: 'rgba(16, 185, 129, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  
  // Sidebar Styles
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 100,
  },
  overlayPressable: {
    flex: 1,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.8,
    backgroundColor: '#0F172A',
    zIndex: 101,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 25,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  sidebarTitleMain: {
    fontSize: 24,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 1,
  },
  titleUnderline: {
    width: 30,
    height: 4,
    backgroundColor: Colors.dark.primary,
    marginTop: 4,
    borderRadius: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  sidebarItemPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  sidebarIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sidebarItemText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 20,
    marginHorizontal: 12,
  },
  sidebarFooter: {
    padding: 30,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  versionText: {
    color: Colors.dark.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Reminder Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalBg: {
    ...StyleSheet.absoluteFillObject,
  },
  reminderCard: {
    width: width * 0.85,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  reminderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.dark.text,
  },
  reminderContent: {
    marginBottom: 24,
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  reminderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  reminderSubLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    width: width * 0.5,
  },
  timeSelectBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 179, 8, 0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.2)',
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.dark.primary,
    marginRight: 6,
  },
  doneButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  footerNote: {
    display: 'none',
  },
});
