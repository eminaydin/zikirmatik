import React from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { FadeIn } from "react-native-reanimated";

import { Stack } from "expo-router";

import { styles } from "../styles/history.styles";
import { useHistory } from "../hooks/useHistory";
import { HistoryItem } from "../components/HistoryItem";
import { Colors } from "../constants/Colors";

export default function HistoryScreen() {
  const {
    history,
    activeTab,
    setActiveTab,
    deleteItem,
    clearHistory,
    selectItem,
    t,
    i18n,
  } = useHistory();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerRight: () => (
              <Pressable
                onPress={clearHistory}
                style={({ pressed }) => [
                  styles.headerIcon,
                  pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
                ]}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </Pressable>
            ),
          }}
        />
        <View style={styles.tabBar}>
          <Pressable
            style={[styles.tab, activeTab === "ongoing" && styles.tabActive]}
            onPress={() => setActiveTab("ongoing")}
          >
            <Text style={[styles.tabText, activeTab === "ongoing" && styles.tabTextActive]}>
              {t("history.ongoing_tab")}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === "finished" && styles.tabActive]}
            onPress={() => setActiveTab("finished")}
          >
            <Text style={[styles.tabText, activeTab === "finished" && styles.tabTextActive]}>
              {t("history.finished_tab")}
            </Text>
          </Pressable>
        </View>

        {history.length > 0 ? (
          <Animated.View 
            key={activeTab}
            entering={FadeIn.duration(300)} 
            style={{ flex: 1 }}
          >
            <FlatList
              data={history}
              renderItem={({ item }) => (
                <HistoryItem
                  item={item}
                  onDelete={deleteItem}
                  onSelect={selectItem}
                  t={t}
                  language={i18n.language}
                />
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
            />
          </Animated.View>
        ) : (
          <Animated.View 
            key={activeTab}
            entering={FadeIn.duration(300)} 
            style={styles.empty}
          >
            <Ionicons name="time-outline" size={64} color={Colors.dark.border} />
            <Text style={styles.emptyText}>
              {activeTab === "finished" ? t("history.empty_finished") : t("history.empty_ongoing")}
            </Text>
          </Animated.View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}
