import React from "react";
import {
  Text,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { styles } from "../styles/settings.styles";
import { Colors } from "../constants/Colors";
import { useSettings } from "../hooks/useSettings";

export default function SettingsScreen() {
  const {
    t,
    text,
    setText,
    arabic,
    setArabic,
    target,
    setTarget,
    reminderEnabled,
    toggleReminder,
    reminderTime,
    onTimeChange,
    showTimePicker,
    setShowTimePicker,
    handleSave,
  } = useSettings();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
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
          <Text style={styles.sectionHeader}>{t("settings.system_settings")}</Text>

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>{t("settings.daily_reminder")}</Text>
              <Text style={styles.settingSubLabel}>{t("settings.daily_reminder_sub")}</Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={toggleReminder}
              trackColor={{ false: Colors.dark.border, true: "#8B5CF6" }}
              thumbColor="#FFFFFF"
            />
          </View>

          {reminderEnabled && (
            <Pressable onPress={() => setShowTimePicker(true)} style={styles.timeSelectRow}>
              <Text style={styles.settingLabel}>{t("home.reminder_time_label")}</Text>
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
