import React, { useState } from "react";
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
} from "react-native";
import { Colors } from "../constants/Colors";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Switch, Dimensions } from "react-native";
import { useNotifications } from "../hooks/useNotifications";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const [text, setText] = useState("");
  const [arabic, setArabic] = useState("");
  const [target, setTarget] = useState("33");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(
    new Date(new Date().setHours(20, 0, 0, 0)),
  );
  const [showTimePicker, setShowTimePicker] = useState(false);
  const { scheduleDailyNotification, cancelAllNotifications } =
    useNotifications();
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      AsyncStorage.getItem("notification_time").then((val) => {
        if (val) {
          const { hour, minute } = JSON.parse(val);
          const date = new Date();
          date.setHours(hour, minute, 0, 0);
          setReminderTime(date);
          setReminderEnabled(true);
        }
      });
    }, []),
  );

  const toggleReminder = async (value: boolean) => {
    setReminderEnabled(value);
    if (value) {
      await scheduleDailyNotification(
        reminderTime.getHours(),
        reminderTime.getMinutes(),
      );
    } else {
      await cancelAllNotifications();
    }
  };

  const onTimeChange = async (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedDate) {
      setReminderTime(selectedDate);
      if (reminderEnabled) {
        await scheduleDailyNotification(
          selectedDate.getHours(),
          selectedDate.getMinutes(),
        );
      }
    }
  };

  const handleSave = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      Alert.alert(t("common.warning"), t("settings.error_empty"));
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      text: trimmed,
      arabic: arabic.trim(),
      target: parseInt(target) || 33,
      count: 0,
      date: new Date().toISOString(),
      isFinished: false,
    };

    try {
      const stored = await AsyncStorage.getItem("zikir_history");
      const history = stored ? JSON.parse(stored) : [];
      await AsyncStorage.setItem(
        "zikir_history",
        JSON.stringify([newItem, ...history]),
      );
      await AsyncStorage.setItem("selected_zikir", JSON.stringify(newItem));
      router.replace("/");
    } catch (error) {
      console.error(error);
    }
  };

  const changeLanguage = async (lng: string) => {
    try {
      await i18n.changeLanguage(lng);
      await AsyncStorage.setItem("user_language", lng);
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };

  const languages = [
    { code: "tr", label: t("common.languages.tr"), flag: "🇹🇷" },
    { code: "en", label: t("common.languages.en"), flag: "🇺🇸" },
    { code: "de", label: t("common.languages.de"), flag: "🇩🇪" },
    { code: "fr", label: t("common.languages.fr"), flag: "🇫🇷" },
    { code: "ru", label: t("common.languages.ru"), flag: "🇷🇺" },
    { code: "bs", label: t("common.languages.bs"), flag: "🇧🇦" },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.hint}>{t("settings.hint")}</Text>

        <View style={styles.section}>
          <Text style={styles.label}>{t("settings.label_text")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("settings.zikir_text_placeholder_example")}
            placeholderTextColor={Colors.dark.textSecondary}
            value={text}
            onChangeText={setText}
            multiline
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t("settings.label_arabic")}</Text>
          <TextInput
            style={[styles.input, { textAlign: "right", fontSize: 20 }]}
            placeholder="لَا إِلٰهَ إِلَّا اللّٰهُ"
            placeholderTextColor={Colors.dark.textSecondary}
            value={arabic}
            onChangeText={setArabic}
            multiline
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t("settings.label_target")}</Text>
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
          <Text style={styles.sectionHeader}>
            {t("settings.system_settings")}
          </Text>

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>
                {t("settings.daily_reminder")}
              </Text>
              <Text style={styles.settingSubLabel}>
                {t("settings.daily_reminder_sub")}
              </Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={toggleReminder}
              trackColor={{ false: Colors.dark.border, true: "#8B5CF6" }}
              thumbColor="#FFFFFF"
            />
          </View>

          {reminderEnabled && (
            <Pressable
              onPress={() => setShowTimePicker(true)}
              style={styles.timeSelectRow}
            >
              <Text style={styles.settingLabel}>
                {t("home.reminder_time_label")}
              </Text>
              <View style={styles.timeBadge}>
                <Text style={styles.timeText}>
                  {reminderTime.getHours().toString().padStart(2, "0")}:
                  {reminderTime.getMinutes().toString().padStart(2, "0")}
                </Text>
              </View>
            </Pressable>
          )}

          {showTimePicker && (
            <DateTimePicker
              value={reminderTime}
              mode="time"
              is24Hour={true}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onTimeChange}
              textColor="#FFF"
            />
          )}

          <View style={styles.divider} />

          <Text style={[styles.sectionHeader, { marginTop: 10 }]}>
            {t("common.language").toUpperCase()}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.langList}
          >
            {languages.map((lang) => (
              <Pressable
                key={lang.code}
                onPress={() => changeLanguage(lang.code)}
                style={[
                  styles.langItem,
                  i18n.language.startsWith(lang.code) && styles.langItemActive,
                ]}
              >
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text
                  style={[
                    styles.langLabel,
                    i18n.language.startsWith(lang.code) &&
                      styles.langLabelActive,
                  ]}
                >
                  {lang.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
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
          <Text style={styles.buttonText}>{t("settings.save_start")}</Text>
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
    fontWeight: "600",
    textTransform: "uppercase",
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
    alignItems: "center",
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "700",
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
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  settingLabel: {
    color: Colors.dark.text,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  settingSubLabel: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    width: width * 0.6,
  },
  timeSelectRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(234, 179, 8, 0.05)",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(234, 179, 8, 0.15)",
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(234, 179, 8, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeText: {
    color: "#8B5CF6",
    fontSize: 14,
    fontWeight: "600",
  },
  langList: {
    marginTop: 12,
    flexDirection: "row",
  },
  langItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#1F2937",
    marginRight: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#374151",
    flexDirection: "row",
    gap: 8,
  },
  langItemActive: {
    backgroundColor: "#8B5CF615",
    borderColor: "#8B5CF6",
  },
  langFlag: {
    fontSize: 18,
  },
  langLabel: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
  },
  langLabelActive: {
    color: "#8B5CF6",
    fontWeight: "700",
  },
});
