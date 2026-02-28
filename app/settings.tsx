import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Switch, Dimensions } from 'react-native';
import { useNotifications } from '../hooks/useNotifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
  const [text, setText] = useState('');
  const [arabic, setArabic] = useState('');
  const [target, setTarget] = useState('33');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date(new Date().setHours(20, 0, 0, 0)));
  const [showTimePicker, setShowTimePicker] = useState(false);
  const { scheduleDailyNotification, cancelAllNotifications } = useNotifications();
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      AsyncStorage.getItem('notification_time').then((val) => {
        if (val) {
          const { hour, minute } = JSON.parse(val);
          const date = new Date();
          date.setHours(hour, minute, 0, 0);
          setReminderTime(date);
          setReminderEnabled(true);
        }
      });
    }, [])
  );

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

  const handleSave = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      Alert.alert('Uyarı', 'Lütfen bir zikir metni girin.');
      return;
    }

    const sessionId = Date.now().toString();
    const newZikir = {
      id: sessionId,
      text: trimmed,
      arabic: arabic.trim() || undefined,
      target: parseInt(target, 10) || 33,
      count: 0,
    };
    
    // Save as active zikir
    await AsyncStorage.setItem('selected_zikir', JSON.stringify(newZikir));
    
    // Also initialize in history to prevent duplication during first count
    try {
      const historyVal = await AsyncStorage.getItem('zikir_history');
      let history = historyVal ? JSON.parse(historyVal) : [];
      history.push({
        id: sessionId,
        text: newZikir.text,
        arabic: newZikir.arabic,
        count: 0,
        target: newZikir.target,
        date: new Date().toISOString(),
        isFinished: false,
      });
      await AsyncStorage.setItem('zikir_history', JSON.stringify(history));
    } catch (e) {
      console.error('History init error:', e);
    }

    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.hint}>
          Yeni bir zikir ekleyerek hedefinizi belirleyebilir ve uygulama ayarlarını yönetebilirsiniz.
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>Zikir Metni (Türkçe / Okunuş)</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: La İlahe İllallah"
            placeholderTextColor={Colors.dark.textSecondary}
            value={text}
            onChangeText={setText}
            multiline
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Zikir Metni (Arapça - İsteğe Bağlı)</Text>
          <TextInput
            style={[styles.input, { textAlign: 'right', fontSize: 20 }]}
            placeholder="لَا إِلٰهَ إِلَّا اللّٰهُ"
            placeholderTextColor={Colors.dark.textSecondary}
            value={arabic}
            onChangeText={setArabic}
            multiline
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Hedef Sayı</Text>
          <TextInput
            style={styles.input}
            placeholder="33"
            placeholderTextColor={Colors.dark.textSecondary}
            value={target}
            onChangeText={setTarget}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
            <Text style={styles.sectionHeader}>SİSTEM AYARLARI</Text>
            
            <View style={styles.settingRow}>
                <View>
                    <Text style={styles.settingLabel}>Günlük Hatırlatıcı</Text>
                    <Text style={styles.settingSubLabel}>Günün zikrini hatırlatmak için bildirim gönderir.</Text>
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
                    style={styles.timeSelectRow}
                >
                    <Text style={styles.settingLabel}>Hatırlatma Saati</Text>
                    <View style={styles.timeBadge}>
                        <Text style={styles.timeText}>
                            {reminderTime.getHours().toString().padStart(2, '0')}:
                            {reminderTime.getMinutes().toString().padStart(2, '0')}
                        </Text>
                        <Ionicons name="time-outline" size={16} color={Colors.dark.primary} style={{ marginLeft: 6 }} />
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
          style={({ pressed }) => [
            styles.button,
            !text.trim() && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleSave}
          disabled={!text.trim()}
        >
          <Text style={styles.buttonText}>Kaydet ve Başla</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scroll: {
    padding: 20,
    flexGrow: 1,
  },
  hint: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    color: Colors.dark.textSecondary,
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    color: Colors.dark.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    minHeight: 52,
  },
  button: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: 32,
    opacity: 0.5,
  },
  sectionHeader: {
    color: Colors.dark.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  settingLabel: {
    color: Colors.dark.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingSubLabel: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    width: width * 0.6,
  },
  timeSelectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 179, 8, 0.05)',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.15)',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeText: {
    color: Colors.dark.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});
