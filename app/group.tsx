import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGroupDhikr } from "../hooks/useGroupDhikr";
import { Colors } from "../constants/Colors";
import { StyleSheet } from "react-native";

export default function GroupScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { createRoom, joinRoom, loading, error, setError } = useGroupDhikr();

  const [mode, setMode] = useState<"lobby" | "create" | "join">("lobby");
  const [activeRoom, setActiveRoom] = useState<{
    roomId: string;
    memberId: string;
  } | null>(null);

  // Create form
  const [dhikrText, setDhikrText] = useState("");
  const [dhikrArabic, setDhikrArabic] = useState("");
  const [totalTarget, setTotalTarget] = useState("1000");
  const [partCount, setPartCount] = useState("2");
  const [myName, setMyName] = useState("");

  // Join form
  const [roomCode, setRoomCode] = useState("");
  const [joinName, setJoinName] = useState("");

  useEffect(() => {
    AsyncStorage.getItem("active_group_room").then((val) => {
      if (val) {
        setActiveRoom(JSON.parse(val));
      }
    });
  }, []);

  const perPerson = Math.floor(
    (parseInt(totalTarget, 10) || 0) / (parseInt(partCount, 10) || 1),
  );

  const handleCreate = async () => {
    if (!dhikrText.trim() || !myName.trim()) {
      Alert.alert(t("common.warning"), t("group.error_fill_all"));
      return;
    }
    await createRoom({
      dhikrText: dhikrText.trim(),
      dhikrArabic: dhikrArabic.trim(),
      totalTarget: parseInt(totalTarget, 10) || 1000,
      partCount: parseInt(partCount, 10) || 2,
      myName: myName.trim(),
    });
  };

  const handleJoin = async () => {
    if (!roomCode.trim() || !joinName.trim()) {
      Alert.alert(t("common.warning"), t("group.error_fill_all"));
      return;
    }
    await joinRoom(roomCode.trim(), joinName.trim());
    if (error === "ROOM_NOT_FOUND") {
      Alert.alert(t("common.warning"), t("group.error_not_found"));
      setError(null);
    }
  };

  const handleResume = () => {
    if (activeRoom) {
      router.push({
        pathname: "/group-counter",
        params: { roomId: activeRoom.roomId, memberId: activeRoom.memberId },
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {mode === "lobby" && (
          <View style={styles.lobby}>
            <View style={styles.heroIcon}>
              <Ionicons name="people" size={48} color="#EAB308" />
            </View>
            <Text style={styles.heroTitle}>{t("group.title")}</Text>
            <Text style={styles.heroSub}>{t("group.subtitle")}</Text>

            {activeRoom && (
              <Pressable
                style={({ pressed }) => [
                  styles.resumeBtn,
                  pressed && styles.pressed,
                ]}
                onPress={handleResume}
              >
                <Ionicons
                  name="play-circle-outline"
                  size={22}
                  color="#0F172A"
                />
                <Text style={styles.primaryBtnText}>
                  {t("group.resume_room")} ({activeRoom.roomId})
                </Text>
              </Pressable>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && styles.pressed,
              ]}
              onPress={() => setMode("create")}
            >
              <Ionicons name="add-circle-outline" size={20} color="#0F172A" />
              <Text style={styles.primaryBtnText}>{t("group.create")}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && styles.pressed,
              ]}
              onPress={() => setMode("join")}
            >
              <Ionicons name="enter-outline" size={20} color="#EAB308" />
              <Text style={styles.secondaryBtnText}>{t("group.join")}</Text>
            </Pressable>
          </View>
        )}

        {mode === "create" && (
          <View>
            <Pressable onPress={() => setMode("lobby")} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={18} color="#EAB308" />
              <Text style={styles.backBtnText}>{t("group.back")}</Text>
            </Pressable>
            <Text style={styles.formTitle}>{t("group.create")}</Text>

            <Text style={styles.label}>{t("group.your_name")}</Text>
            <TextInput
              style={styles.input}
              placeholder="Ali"
              placeholderTextColor={Colors.dark.textSecondary}
              value={myName}
              onChangeText={setMyName}
            />

            <Text style={styles.label}>{t("group.dhikr_text")}</Text>
            <TextInput
              style={styles.input}
              placeholder="Elhamdülillah"
              placeholderTextColor={Colors.dark.textSecondary}
              value={dhikrText}
              onChangeText={setDhikrText}
            />

            <Text style={styles.label}>{t("group.dhikr_arabic")}</Text>
            <TextInput
              style={[styles.input, { textAlign: "right", fontSize: 20 }]}
              placeholder="الْحَمْدُ لِلَّهِ"
              placeholderTextColor={Colors.dark.textSecondary}
              value={dhikrArabic}
              onChangeText={setDhikrArabic}
            />

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t("group.total_target")}</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={totalTarget}
                  onChangeText={setTotalTarget}
                  placeholderTextColor={Colors.dark.textSecondary}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t("group.parts")}</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={partCount}
                  onChangeText={setPartCount}
                  placeholderTextColor={Colors.dark.textSecondary}
                />
              </View>
            </View>

            <View style={styles.portionBadge}>
              <Text style={styles.portionText}>
                {t("group.your_share")}: {perPerson}
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                (!dhikrText.trim() || !myName.trim()) && styles.btnDisabled,
                pressed && styles.pressed,
              ]}
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0F172A" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#0F172A"
                  />
                  <Text style={styles.primaryBtnText}>
                    {t("group.create_room")}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        )}

        {mode === "join" && (
          <View>
            <Pressable onPress={() => setMode("lobby")} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={18} color="#EAB308" />
              <Text style={styles.backBtnText}>{t("group.back")}</Text>
            </Pressable>
            <Text style={styles.formTitle}>{t("group.join")}</Text>

            <Text style={styles.label}>{t("group.your_name")}</Text>
            <TextInput
              style={styles.input}
              placeholder="Fatma"
              placeholderTextColor={Colors.dark.textSecondary}
              value={joinName}
              onChangeText={setJoinName}
            />

            <Text style={styles.label}>{t("group.room_code")}</Text>
            <TextInput
              style={[styles.input, styles.codeInput]}
              placeholder="ABC123"
              placeholderTextColor={Colors.dark.textSecondary}
              value={roomCode}
              onChangeText={(v) => setRoomCode(v.toUpperCase())}
              autoCapitalize="characters"
              maxLength={6}
            />

            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                (!roomCode.trim() || !joinName.trim()) && styles.btnDisabled,
                pressed && styles.pressed,
              ]}
              onPress={handleJoin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0F172A" />
              ) : (
                <>
                  <Ionicons name="enter-outline" size={20} color="#0F172A" />
                  <Text style={styles.primaryBtnText}>
                    {t("group.join_room")}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        )}
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
    padding: 24,
    paddingBottom: 60,
  },
  lobby: {
    alignItems: "center",
    paddingTop: 32,
  },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(234, 179, 8, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.dark.text,
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 20,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EAB308",
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
    width: "100%",
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  resumeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EAB308",
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 24,
    width: "100%",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
    shadowColor: "#EAB308",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(234, 179, 8, 0.1)",
    borderWidth: 1,
    borderColor: "#EAB308",
    paddingVertical: 16,
    borderRadius: 16,
    width: "100%",
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#EAB308",
  },
  pressed: { opacity: 0.8 },
  btnDisabled: { opacity: 0.4 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 20,
  },
  backBtnText: {
    color: "#EAB308",
    fontSize: 15,
    fontWeight: "600",
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.dark.text,
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.dark.text,
    fontSize: 16,
    marginBottom: 16,
  },
  codeInput: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 8,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  portionBadge: {
    backgroundColor: "rgba(234, 179, 8, 0.1)",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(234, 179, 8, 0.3)",
  },
  portionText: {
    color: "#EAB308",
    fontSize: 16,
    fontWeight: "700",
  },
});
