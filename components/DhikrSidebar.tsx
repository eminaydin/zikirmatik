import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import Animated from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { styles } from "../styles/index.styles";
import { Colors } from "../constants/Colors";

interface DhikrSidebarProps {
  isVisible: boolean;
  toggleSidebar: () => void;
  sidebarStyle: any;
  overlayStyle: any;
  languages: any[];
  changeLanguage: (code: string) => void;
  currentLanguage: string;
  startFreeMode: () => void;
  setIsRateModalVisible: (val: boolean) => void;
  t: (key: string) => string;
}

export const DhikrSidebar: React.FC<DhikrSidebarProps> = ({
  toggleSidebar,
  sidebarStyle,
  overlayStyle,
  languages,
  changeLanguage,
  currentLanguage,
  startFreeMode,
  setIsRateModalVisible,
  t,
}) => {
  const router = useRouter();

  return (
    <>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable style={styles.overlayPressable} onPress={toggleSidebar} />
      </Animated.View>

      <Animated.View style={[styles.sidebar, sidebarStyle]}>
        <View style={styles.sidebarHeader}>
          <View>
            <Text style={styles.sidebarTitleMain}>{t("menu.title")}</Text>
            <View style={styles.titleUnderline} />
          </View>
          <Pressable onPress={toggleSidebar} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.dark.text} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.sidebarContent}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={startFreeMode}
            style={({ pressed }) => [
              styles.sidebarItem,
              pressed && styles.sidebarItemPressed,
            ]}
          >
            <View style={styles.sidebarIconYellow}>
              <Ionicons name="infinite" size={22} color="#EAB308" />
            </View>
            <Text style={styles.sidebarItemText}>{t("menu.free_mode")}</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              toggleSidebar();
              router.push("/settings");
            }}
            style={({ pressed }) => [
              styles.sidebarItem,
              pressed && styles.sidebarItemPressed,
            ]}
          >
            <View style={styles.sidebarIconBlue}>
              <Ionicons name="add-circle" size={22} color="#3B82F6" />
            </View>
            <Text style={styles.sidebarItemText}>{t("menu.new_zikir")}</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              toggleSidebar();
              router.push("/list");
            }}
            style={({ pressed }) => [
              styles.sidebarItem,
              pressed && styles.sidebarItemPressed,
            ]}
          >
            <View style={styles.sidebarIconIndigo}>
              <Ionicons name="bookmarks" size={22} color="#6366F1" />
            </View>
            <Text style={styles.sidebarItemText}>
              {t("menu.recommendations")}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              toggleSidebar();
              router.push("/history");
            }}
            style={({ pressed }) => [
              styles.sidebarItem,
              pressed && styles.sidebarItemPressed,
            ]}
          >
            <View
              style={[
                styles.sidebarIconWrapper,
                { backgroundColor: "rgba(139, 92, 246, 0.1)" },
              ]}
            >
              <Ionicons name="time" size={22} color="#8B5CF6" />
            </View>
            <Text style={styles.sidebarItemText}>{t("menu.history")}</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              toggleSidebar();
              router.push("/stats");
            }}
            style={({ pressed }) => [
              styles.sidebarItem,
              pressed && styles.sidebarItemPressed,
            ]}
          >
            <View style={styles.sidebarIconTeal}>
              <Ionicons name="stats-chart" size={20} color="#14B8A6" />
            </View>
            <Text style={styles.sidebarItemText}>{t("menu.stats")}</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              toggleSidebar();
              router.push("/group");
            }}
            style={({ pressed }) => [
              styles.sidebarItem,
              pressed && styles.sidebarItemPressed,
            ]}
          >
            <View
              style={[
                styles.sidebarIconWrapper,
                { backgroundColor: "rgba(234, 179, 8, 0.1)" },
              ]}
            >
              <Ionicons name="people" size={22} color="#EAB308" />
            </View>
            <Text style={styles.sidebarItemText}>{t("group.title")}</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              toggleSidebar();
              setIsRateModalVisible(true);
            }}
            style={({ pressed }) => [
              styles.sidebarItem,
              pressed && styles.sidebarItemPressed,
            ]}
          >
            <View
              style={[
                styles.sidebarIconWrapper,
                { backgroundColor: "rgba(236, 72, 153, 0.1)" },
              ]}
            >
              <Ionicons name="star" size={22} color="#EC4899" />
            </View>
            <Text style={styles.sidebarItemText}>{t("menu.rate_app")}</Text>
          </Pressable>

          <View style={styles.sidebarDivider} />
          <Text style={styles.sectionHeader}>{t("common.language")}</Text>

          <View style={styles.langGrid}>
            {languages.map((lang) => (
              <Pressable
                key={lang.code}
                onPress={() => changeLanguage(lang.code)}
                style={[
                  styles.langItem,
                  currentLanguage === lang.code && styles.langItemActive,
                ]}
              >
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text
                  style={[
                    styles.langLabel,
                    currentLanguage === lang.code && styles.langLabelActive,
                  ]}
                >
                  {lang.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={styles.sidebarFooter}>
          <Text style={styles.versionText}>
            v{Constants.expoConfig?.version}
          </Text>
        </View>
      </Animated.View>
    </>
  );
};
