import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { styles } from "../styles/index.styles";
import { Colors } from "../constants/Colors";

interface TopControlsProps {
  toggleSidebar: () => void;
  resetCount: () => void;
  toggleHaptics: () => void;
  hapticsEnabled: boolean;
  openReminder: () => void;
  reminderEnabled: boolean;
}

export const TopControls: React.FC<TopControlsProps> = ({
  toggleSidebar,
  resetCount,
  toggleHaptics,
  hapticsEnabled,
  openReminder,
  reminderEnabled,
}) => {
  return (
    <View style={styles.topBar}>
      <Pressable onPress={toggleSidebar} style={styles.topBarIcon}>
        <Ionicons name="menu-outline" size={24} color={Colors.dark.primary} />
      </Pressable>

      <View style={styles.topBarRight}>
        <Pressable onPress={resetCount} style={styles.topBarIconSmall}>
          <Ionicons name="refresh" size={18} color="#EF4444" />
        </Pressable>

        <Pressable onPress={toggleHaptics} style={[styles.topBarIconSmall, { marginLeft: 12 }]}>
          <MaterialCommunityIcons
            name={hapticsEnabled ? "vibrate" : "vibrate-off"}
            size={20}
            color={hapticsEnabled ? Colors.dark.primary : Colors.dark.textSecondary}
          />
        </Pressable>

        <Pressable onPress={openReminder} style={[styles.topBarIconSmall, { marginLeft: 8 }]}>
          <Ionicons
            name={reminderEnabled ? "notifications" : "notifications-outline"}
            size={18}
            color={reminderEnabled ? Colors.dark.primary : Colors.dark.textSecondary}
          />
        </Pressable>
      </View>
    </View>
  );
};
