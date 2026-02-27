import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { Link, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface ZikirData {
  text: string;
  target: number;
  count: number;
}

const DEFAULT_ZIKIR: ZikirData = {
  text: 'Subhanallah',
  target: 33,
  count: 0,
};

export default function CounterScreen() {
  const [zikir, setZikir] = useState<ZikirData>(DEFAULT_ZIKIR);
  const scale = useSharedValue(1);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('selected_zikir').then((value) => {
        if (value) setZikir(JSON.parse(value));
      });
    }, [])
  );

  const save = async (data: ZikirData) => {
    setZikir(data);
    await AsyncStorage.setItem('selected_zikir', JSON.stringify(data));
  };

  const handlePress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSequence(
      withSpring(1.08, { damping: 3, stiffness: 400 }),
      withSpring(1, { damping: 10 })
    );
    await save({ ...zikir, count: zikir.count + 1 });
  }, [zikir]);

  const resetCount = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await save({ ...zikir, count: 0 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const progress = zikir.target > 0 ? Math.min(zikir.count / zikir.target, 1) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.zikirText}>{zikir.text}</Text>
        <Text style={styles.targetText}>
          {zikir.count} / {zikir.target}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      <Pressable onPress={handlePress} style={styles.counterArea}>
        <Animated.View style={[styles.circle, animatedStyle]}>
          <Text style={styles.countText}>{zikir.count}</Text>
        </Animated.View>
      </Pressable>

      <View style={styles.footer}>
        <Link href="/list" asChild>
          <Pressable style={styles.iconButton}>
            <Ionicons name="list-outline" size={28} color={Colors.dark.primary} />
            <Text style={styles.iconLabel}>Öneriler</Text>
          </Pressable>
        </Link>

        <Pressable onPress={resetCount} style={styles.iconButton}>
          <Ionicons name="refresh-outline" size={28} color={Colors.dark.primary} />
          <Text style={styles.iconLabel}>Sıfırla</Text>
        </Pressable>

        <Link href="/settings" asChild>
          <Pressable style={styles.iconButton}>
            <Ionicons name="add-circle-outline" size={28} color={Colors.dark.primary} />
            <Text style={styles.iconLabel}>Yeni Zikir</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 32,
    width: '100%',
  },
  zikirText: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  targetText: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    marginBottom: 12,
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: Colors.dark.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.dark.primary,
    borderRadius: 2,
  },
  counterArea: {
    width: width * 0.78,
    height: width * 0.78,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: width * 0.72,
    height: width * 0.72,
    borderRadius: (width * 0.72) / 2,
    backgroundColor: Colors.dark.surface,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  countText: {
    fontSize: 86,
    fontWeight: '700',
    color: Colors.dark.primary,
  },
  footer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
    paddingHorizontal: 16,
  },
  iconButton: {
    alignItems: 'center',
    padding: 8,
  },
  iconLabel: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
});
