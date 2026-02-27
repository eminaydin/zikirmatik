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
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface ZikirData {
  text: string;
  arabic?: string;
  target: number;
  count: number;
}

const DEFAULT_ZIKIR: ZikirData = {
  text: 'Sübhanallah',
  arabic: 'سُبْحَانَ اللَّهِ',
  target: 33,
  count: 0,
};

import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';

export default function CounterScreen() {
  const [zikir, setZikir] = useState<ZikirData>(DEFAULT_ZIKIR);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const scale = useSharedValue(1);
  const sidebarTranslateX = useSharedValue(-width);
  const sidebarOpacity = useSharedValue(0);
  const progressValue = useSharedValue(zikir.target > 0 ? zikir.count / zikir.target : 0);
  const router = useRouter();

  useEffect(() => {
    progressValue.value = withTiming(zikir.target > 0 ? Math.min(zikir.count / zikir.target, 1) : 0, {
      duration: 300,
    });
  }, [zikir.count, zikir.target]);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('selected_zikir').then((value) => {
        if (value) setZikir(JSON.parse(value));
      });
      AsyncStorage.getItem('haptics_enabled').then((val) => {
        if (val !== null) setHapticsEnabled(val === 'true');
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
      
      const now = new Date();
      let updated = false;
      
      if (history.length > 0) {
        const lastEntry = history[history.length - 1];
        const entryDate = new Date(lastEntry.date);
        const diffMs = now.getTime() - entryDate.getTime();
        
        if (lastEntry.text === data.text && diffMs < 3600000 && lastEntry.count < lastEntry.target) {
            lastEntry.count = data.count;
            lastEntry.target = data.target;
            lastEntry.arabic = data.arabic;
            lastEntry.isFinished = data.count >= data.target;
            updated = true;
        }
      }

      if (!updated) {
        history.push({
          id: Date.now().toString(),
          text: data.text,
          arabic: data.arabic,
          count: data.count,
          target: data.target,
          date: now.toISOString(),
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
      withSpring(1.08, { damping: 3, stiffness: 400 }),
      withSpring(1, { damping: 10 })
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
    await save({ ...zikir, count: 0 });
  };

  const nextRound = async () => {
    if (hapticsEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await save({ ...zikir, count: 0 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
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
                <Ionicons 
                  name={hapticsEnabled ? "pulse" : "pulse-outline"} 
                  size={18} 
                  color={hapticsEnabled ? Colors.dark.primary : Colors.dark.textSecondary} 
                />
              </Pressable>
            </View>
          </View>

          {/* Main Content Area */}
          <View style={styles.mainContent}>
            <View style={styles.zikirDisplay}>
              {zikir.arabic && (
                <Text style={styles.arabicTextDisplay}>{zikir.arabic}</Text>
              )}
              <Text style={styles.zikirTextDisplay}>{zikir.text}</Text>
              
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
            </View>

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
                  <View style={styles.innerCircle}>
                    <Text style={[styles.mainCount, isFinished && styles.mainCountFinished]}>
                      {zikir.count}
                    </Text>
                  </View>
                </Animated.View>
              </Pressable>
            </View>
          </View>


          {/* Sidebar Overlay */}
          <Animated.View style={[styles.overlay, overlayStyle]}>
            <Pressable style={styles.overlayPressable} onPress={toggleSidebar} />
          </Animated.View>

          {/* Sidebar Content */}
          <Animated.View style={[styles.sidebar, sidebarStyle]}>
            <View style={styles.sidebarHeader} />

            <View style={styles.sidebarContent}>
              <Pressable style={styles.sidebarItem} onPress={() => { router.push('/settings'); toggleSidebar(); }}>
                <Ionicons name="add-circle" size={24} color={Colors.dark.primary} />
                <Text style={styles.sidebarItemText}>Yeni Zikir Ekle</Text>
              </Pressable>

              <Pressable style={styles.sidebarItem} onPress={() => { router.push('/list'); toggleSidebar(); }}>
                <Ionicons name="list" size={24} color={Colors.dark.primary} />
                <Text style={styles.sidebarItemText}>Zikir Önerileri</Text>
              </Pressable>

              <Pressable style={styles.sidebarItem} onPress={() => { router.push('/history'); toggleSidebar(); }}>
                <Ionicons name="time" size={24} color={Colors.dark.primary} />
                <Text style={styles.sidebarItemText}>Zikir Geçmişim</Text>
              </Pressable>

              <View style={styles.sidebarDivider} />
            </View>

            <View style={styles.sidebarFooter}>
              <Text style={styles.versionText}>v1.5</Text>
            </View>
          </Animated.View>

          <View style={{ height: 40 }} />
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
    paddingTop: Platform.OS === 'ios' ? 40 : 15, // Reduced for Android, kept iOS for notch
    paddingHorizontal: 16,
    paddingBottom: 0, // Minimized
  },
  topBarIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarIconSmall: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarCenter: {
    alignItems: 'center',
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
    marginTop: -5, // Negative margin to pull it UP towards 'Zikirmatik'
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  arabicTextDisplay: {
    fontSize: 34,
    color: Colors.dark.primary,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Traditional Arabic' : 'serif',
    lineHeight: 48,
    marginBottom: 8,
  },
  zikirTextDisplay: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    height: 6,
  },
  progressTrack: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressActive: {
    height: '100%',
    backgroundColor: Colors.dark.primary,
    borderRadius: 3,
  },
  counterSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchArea: {
    width: width * 0.8,
    height: width * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    width: width * 0.76,
    height: width * 0.76,
    borderRadius: (width * 0.76) / 2,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  innerCircle: {
    width: width * 0.64,
    height: width * 0.64,
    borderRadius: (width * 0.64) / 2,
    backgroundColor: '#0F172A',
    borderWidth: 6,
    borderColor: Colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  circleFinished: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    shadowColor: '#10B981',
  },
  mainCount: {
    fontSize: 110,
    fontWeight: '900',
    color: Colors.dark.text,
    includeFontPadding: false,
  },
  mainCountFinished: {
    color: '#10B981',
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
    width: width * 0.75,
    backgroundColor: '#0F172A',
    zIndex: 101,
    paddingTop: 30,
    borderRightWidth: 1,
    borderRightColor: Colors.dark.border,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  sidebarTitleMain: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.dark.text,
  },
  sidebarSubTitle: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  sidebarContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  sidebarItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginLeft: 16,
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: 16,
    marginHorizontal: 16,
  },
  sidebarFooter: {
    padding: 24,
    alignItems: 'center',
  },
  versionText: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
  },
});
