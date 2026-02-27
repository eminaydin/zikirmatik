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
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const [text, setText] = useState('');
  const [target, setTarget] = useState('33');
  const router = useRouter();

  const handleSave = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      Alert.alert('Uyarı', 'Lütfen bir zikir metni girin.');
      return;
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newZikir = {
      text: trimmed,
      target: parseInt(target, 10) || 33,
      count: 0,
    };
    await AsyncStorage.setItem('selected_zikir', JSON.stringify(newZikir));
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.hint}>
          Kendi zikirini ekleyerek sayısını takip edebilirsin.
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>Zikir Metni</Text>
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
});
