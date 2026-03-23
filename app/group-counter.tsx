import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
  useAnimatedStyle,
  FadeIn,
} from "react-native-reanimated";
import { useGroupDhikr } from "../hooks/useGroupDhikr";
import { Colors } from "../constants/Colors";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function GroupCounterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { roomId, memberId } = useLocalSearchParams<{
    roomId: string;
    memberId: string;
  }>();
  const {
    room,
    increment,
    leaveRoom,
    totalCount,
    allFinished,
    subscribeToRoom,
  } = useGroupDhikr();

  const [showMembers, setShowMembers] = useState(false);
  const [wasAllFinished, setWasAllFinished] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const scale = useSharedValue(1);
  const celebrationOpacity = useSharedValue(0);

  // Attach Firebase listener on mount; also persist roomId/memberId for resume
  useEffect(() => {
    if (roomId && memberId) {
      subscribeToRoom(roomId as string, memberId as string);
      // Persist so user can resume if they navigate away
      AsyncStorage.setItem(
        "active_group_room",
        JSON.stringify({ roomId, memberId }),
      );
    }
    return () => {
      // Don't clear on unmount — only clear when user explicitly leaves the room
    };
  }, [roomId, memberId]);

  const myMember = room?.members?.[memberId ?? ""];
  const myCount = myMember?.count ?? 0;
  const myTarget = myMember?.target ?? 1;
  const myProgress = Math.min(myCount / myTarget, 1);
  const totalProgress = Math.min(totalCount / (room?.totalTarget ?? 1), 1);
  const members = room ? Object.entries(room.members) : [];

  useEffect(() => {
    if (allFinished && !wasAllFinished && room) {
      setWasAllFinished(true);
      setShowCelebration(true);
      celebrationOpacity.value = withTiming(1, { duration: 600 });
      saveToHistory(true);
    }
  }, [allFinished]);

  // Sync with local history and main counter whenever my count changes
  useEffect(() => {
    if (room && memberId && myCount > 0) {
      saveToHistory(false);
      syncToSelectedZikir();
    }
  }, [myCount, memberId, room?.id]);

  // Ensure it exists in history as soon as we join/create, and save on exit
  useEffect(() => {
    if (room && memberId) {
      saveToHistory(false);
      syncToSelectedZikir();
    }
    return () => {
      // One last save on unmount if we have data
      if (room && memberId) {
        saveToHistory(false);
        syncToSelectedZikir();
      }
    };
  }, [room?.id, memberId]);

  const syncToSelectedZikir = React.useCallback(async () => {
    if (!room || !memberId) return;
    const zikirData = {
      id: `group_${room.id}_${memberId}`,
      text: room.dhikrText,
      arabic: room.dhikrArabic,
      target: room.members[memberId]?.target || 0,
      count: room.members[memberId]?.count || 0,
      isGroup: true,
      groupRoomId: room.id,
      memberId: memberId,
    };
    await AsyncStorage.setItem("selected_zikir", JSON.stringify(zikirData));
  }, [room, memberId]);

  const saveToHistory = React.useCallback(
    async (isGroupFinished: boolean) => {
      if (!room || !memberId) return;
      try {
        const stored = await AsyncStorage.getItem("zikir_history");
        const history = stored ? JSON.parse(stored) : [];
        const existingIdx = history.findIndex(
          (h: any) => h.groupRoomId === room.id && h.memberId === memberId,
        );

        const record = {
          id: `group_${room.id}_${memberId}`,
          groupRoomId: room.id,
          memberId,
          text: room.dhikrText,
          arabic: room.dhikrArabic,
          target: room.members[memberId]?.target || 0,
          count: room.members[memberId]?.count || 0,
          date: new Date().toISOString(),
          isFinished: room.members[memberId]?.isFinished || isGroupFinished,
          isGroup: true,
          totalTarget: room.totalTarget,
          roomCode: room.id,
        };

        if (existingIdx >= 0) {
          history[existingIdx] = record;
        } else {
          history.push(record);
        }

        await AsyncStorage.setItem("zikir_history", JSON.stringify(history));
      } catch (e) {
        console.error("saveToHistory error:", e);
      }
    },
    [room, memberId, t],
  );

  const handleLeave = async () => {
    await saveToHistory(false);
    await AsyncStorage.removeItem("active_group_room");
    leaveRoom();
  };

  const animatedBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const celebrationStyle = useAnimatedStyle(() => ({
    opacity: celebrationOpacity.value,
  }));

  const handleIncrement = async () => {
    if (!roomId || !memberId || myMember?.isFinished) return;
    scale.value = withSpring(0.92, { damping: 5 }, () => {
      scale.value = withSpring(1, { damping: 8 });
    });
    await increment(roomId as string, memberId as string, myTarget);
  };

  const handleShare = async () => {
    await Share.share({
      message: `${t("group.share_message")}\n${t("group.room_code")}: ${roomId}\n${t("group.dhikr")}: ${room?.dhikrText}\n${t("group.your_share")}: ${myTarget}`,
    });
  };

  if (!room) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: Colors.dark.textSecondary }}>
          {t("group.connecting")}...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Celebration Overlay */}
      {showCelebration && (
        <Animated.View style={[styles.celebration, celebrationStyle]}>
          <Pressable
            onPress={() => {
              setShowCelebration(false);
              celebrationOpacity.value = withTiming(0);
            }}
            style={styles.closeCelebration}
          >
            <Ionicons name="close" size={28} color="#EAB308" />
          </Pressable>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.celebrationText}>{t("group.all_done")}</Text>
          <Pressable
            onPress={async () => {
              await AsyncStorage.removeItem("active_group_room");
              leaveRoom();
            }}
            style={styles.leaveBtn}
          >
            <Text style={styles.leaveBtnText}>{t("group.finish")}</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* ── TOP TOOLBAR ── */}
      <View style={styles.toolbar}>
        <View style={styles.toolbarLeft}>
          <Text style={styles.roomCodeLabel}>{t("group.room_code")}</Text>
          <Text style={styles.roomCode}>{room.id}</Text>
        </View>
        <View style={styles.toolbarRight}>
          <Pressable onPress={handleShare} style={styles.iconBtn}>
            <Ionicons name="share-outline" size={20} color="#EAB308" />
          </Pressable>
          <Pressable
            onPress={() => setShowMembers((v) => !v)}
            style={styles.iconBtn}
          >
            <Ionicons
              name="people-outline"
              size={20}
              color={showMembers ? "#EAB308" : Colors.dark.textSecondary}
            />
          </Pressable>
          <Pressable onPress={handleLeave} style={styles.iconBtn}>
            <Ionicons name="exit-outline" size={20} color="#EF4444" />
          </Pressable>
        </View>
      </View>

      {/* ── TOTAL PROGRESS BAR ── */}
      <View style={styles.barRow}>
        <View style={styles.totalBarBg}>
          <View
            style={[styles.totalBarFill, { width: `${totalProgress * 100}%` }]}
          />
        </View>
        <Text style={styles.totalBarCount}>
          {totalCount}/{room.totalTarget}
        </Text>
      </View>

      {/* ── MEMBER LIST (collapsible) ── */}
      {showMembers && (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={styles.membersList}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {members.map(([id, member]) => (
              <View
                key={id}
                style={[
                  styles.memberChip,
                  id === memberId && styles.memberChipMe,
                ]}
              >
                <Text style={styles.memberChipName}>
                  {member.isFinished ? "✅ " : ""}
                  {member.name}
                </Text>
                <Text style={styles.memberChipCount}>
                  {member.count}/{member.target}
                </Text>
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* ── DHIKR TEXT ── */}
      <View style={styles.dhikrContainer}>
        <Text style={styles.dhikrText}>{room.dhikrText}</Text>
        {room.dhikrArabic ? (
          <Text style={styles.dhikrArabic}>{room.dhikrArabic}</Text>
        ) : null}
      </View>

      {/* ── BIG TAP AREA ── */}
      <Pressable
        style={styles.counterWrapper}
        onPress={handleIncrement}
        disabled={myMember?.isFinished}
      >
        <Animated.View
          style={[
            styles.counterCircle,
            animatedBtnStyle,
            myMember?.isFinished && styles.counterCircleDone,
          ]}
        >
          {myMember?.isFinished ? (
            <Ionicons name="checkmark-circle" size={80} color="#10B981" />
          ) : (
            <>
              <Text style={styles.counterNumber}>{myCount}</Text>
              <Text style={styles.counterTarget}>/ {myTarget}</Text>
            </>
          )}
        </Animated.View>
      </Pressable>

      {/* ── MY PROGRESS BAR ── */}
      <View style={styles.myProgressRow}>
        <View style={styles.myProgressBg}>
          <View
            style={[styles.myProgressFill, { width: `${myProgress * 100}%` }]}
          />
        </View>
        <Text style={styles.myProgressPct}>
          {Math.round(myProgress * 100)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },

  // Toolbar
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  toolbarLeft: {},
  toolbarRight: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  roomCodeLabel: {
    fontSize: 10,
    color: Colors.dark.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  roomCode: {
    fontSize: 20,
    fontWeight: "800",
    color: "#EAB308",
    letterSpacing: 4,
  },

  // Total progress bar
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 12,
  },
  totalBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.dark.surface,
  },
  totalBarFill: { height: 6, borderRadius: 3, backgroundColor: "#EAB308" },
  totalBarCount: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    minWidth: 70,
    textAlign: "right",
  },

  // Members chips
  membersList: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  memberChip: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: "center",
  },
  memberChipMe: { borderColor: "#EAB30888" },
  memberChipName: { fontSize: 12, fontWeight: "600", color: Colors.dark.text },
  memberChipCount: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },

  // Dhikr text
  dhikrContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  dhikrText: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.dark.text,
    textAlign: "center",
  },
  dhikrArabic: {
    fontSize: 24,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginTop: 4,
    fontFamily: "System",
  },

  // Counter
  counterWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  counterCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: Colors.dark.surface,
    borderWidth: 5,
    borderColor: "#EAB308",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#EAB308",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 16,
  },
  counterCircleDone: { borderColor: "#10B981", shadowColor: "#10B981" },
  counterNumber: {
    fontSize: 68,
    fontWeight: "900",
    color: Colors.dark.text,
    lineHeight: 70,
  },
  counterTarget: {
    fontSize: 18,
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },

  // My progress
  myProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 40,
  },
  myProgressBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.dark.surface,
  },
  myProgressFill: { height: 6, borderRadius: 3, backgroundColor: "#EAB308" },
  myProgressPct: {
    fontSize: 13,
    fontWeight: "700",
    color: "#EAB308",
    width: 40,
    textAlign: "right",
  },

  // Celebration
  celebration: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,23,42,0.96)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  celebrationEmoji: { fontSize: 80 },
  celebrationText: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.dark.text,
    marginTop: 20,
    marginBottom: 32,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  leaveBtn: {
    backgroundColor: "#EAB308",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
  },
  leaveBtnText: { color: "#0F172A", fontWeight: "700", fontSize: 16 },
  closeCelebration: {
    position: "absolute",
    top: 60,
    right: 30,
    padding: 10,
    zIndex: 110,
  },
});
