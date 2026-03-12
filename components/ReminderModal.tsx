import React from "react";
import { View, Text, Pressable, Platform, Switch, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { styles } from "../styles/index.styles";
import { Colors } from "../constants/Colors";

interface ReminderModalProps {
  isVisible: boolean;
  onClose: () => void;
  reminderEnabled: boolean;
  toggleReminder: (val: boolean) => void;
  reminderTime: Date;
  onTimeChange: (event: any, date?: Date) => void;
  showTimePicker: boolean;
  setShowTimePicker: (val: boolean) => void;
  t: (key: string) => string;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isVisible,
  onClose,
  reminderEnabled,
  toggleReminder,
  reminderTime,
  onTimeChange,
  showTimePicker,
  setShowTimePicker,
  t,
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBg} onPress={onClose} />
        <View style={styles.reminderCard}>
          <View style={styles.reminderHeader}>
            <Text style={styles.reminderTitle}>{t("home.reminder_modal_title")}</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.dark.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.reminderContent}>
            <View style={styles.reminderRow}>
              <View>
                <Text style={styles.reminderLabel}>{t("settings.daily_reminder")}</Text>
                <Text style={styles.reminderSubLabel}>{t("settings.reminder_desc")}</Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={toggleReminder}
                trackColor={{ false: "#334155", true: Colors.dark.primary }}
                thumbColor={reminderEnabled ? "#FFF" : "#94A3B8"}
              />
            </View>

            {reminderEnabled && (
              <>
                <Pressable
                  style={styles.timeSelectBox}
                  onPress={() => setShowTimePicker(true)}
                >
                  <View>
                    <Text style={styles.timeLabel}>{t("settings.reminder_time")}</Text>
                  </View>
                  <View style={styles.timeDisplay}>
                    <Text style={styles.timeValue}>
                      {reminderTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color={Colors.dark.primary} />
                  </View>
                </Pressable>

                {showTimePicker && (
                  <DateTimePicker
                    value={reminderTime}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onTimeChange}
                    textColor={Colors.dark.text}
                  />
                )}
              </>
            )}
          </View>

          <Pressable style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>{t("common.done")}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};
