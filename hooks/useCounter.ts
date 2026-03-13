import { useState, useCallback, useEffect } from "react";
import { Dimensions, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import * as StoreReview from "expo-store-review";
import { useRouter, useFocusEffect } from "expo-router";
import {
    useSharedValue,
    withTiming,
    withSequence,
    withSpring,
    withRepeat,
} from "react-native-reanimated";
import { useNotifications } from "./useNotifications";
import { ZikirData } from "../types/zikir";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

const DEFAULT_ZIKIR: ZikirData = {
    id: "default",
    text: "Subhanallah",
    arabic: "سُبْحَانَ اللَّهِ",
    target: 33,
    count: 0,
};

export function useCounter() {
    const { t, i18n } = useTranslation();
    const { scheduleDailyNotification, cancelAllNotifications } = useNotifications();

    // State
    const [zikir, setZikir] = useState<ZikirData>(DEFAULT_ZIKIR);
    const [hapticsEnabled, setHapticsEnabled] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isReminderModalVisible, setIsReminderModalVisible] = useState(false);
    const [isRateModalVisible, setIsRateModalVisible] = useState(false);
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState(new Date(new Date().setHours(20, 0, 0, 0)));
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Reanimated Shared Values
    const scale = useSharedValue(1);
    const sidebarTranslateX = useSharedValue(-width);
    const sidebarOpacity = useSharedValue(0);
    const progressValue = useSharedValue(0);
    const pulseValue = useSharedValue(1);

    const isFinished = zikir.target > 0 && zikir.count >= zikir.target;

    // Effects
    useEffect(() => {
        progressValue.value = withTiming(
            zikir.target > 0 ? Math.min(zikir.count / zikir.target, 1) : 0,
            { duration: 300 }
        );
    }, [zikir.count, zikir.target, progressValue]);

    useEffect(() => {
        if (isFinished) {
            pulseValue.value = withRepeat(withTiming(1.02, { duration: 1500 }), -1, true);
        } else {
            pulseValue.value = 1;
        }
    }, [isFinished, pulseValue]);

    // Loading Data
    const loadInitialData = useCallback(async () => {
        const [savedZikir, savedHaptics, savedTime] = await Promise.all([
            AsyncStorage.getItem("selected_zikir"),
            AsyncStorage.getItem("haptics_enabled"),
            AsyncStorage.getItem("notification_time"),
        ]);

        if (savedZikir) setZikir(JSON.parse(savedZikir));
        if (savedHaptics !== null) setHapticsEnabled(savedHaptics === "true");
        if (savedTime) {
            const { hour, minute } = JSON.parse(savedTime);
            const date = new Date();
            date.setHours(hour, minute, 0, 0);
            setReminderTime(date);
            setReminderEnabled(true);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadInitialData();
        }, [loadInitialData])
    );

    // Actions
    const save = useCallback(async (updated: ZikirData) => {
        setZikir(updated);
        await AsyncStorage.setItem("selected_zikir", JSON.stringify(updated));
    }, []);

    const updateHistory = useCallback(async (data: ZikirData) => {
        try {
            const historyVal = await AsyncStorage.getItem("zikir_history");
            let history = historyVal ? JSON.parse(historyVal) : [];
            const index = history.findIndex((h: any) => h.id === data.id);

            if (index !== -1) {
                history[index] = {
                    ...history[index],
                    count: data.count,
                    target: data.target,
                    arabic: data.arabic,
                    isFinished: data.target > 0 && data.count >= data.target,
                    date: new Date().toISOString(),
                };
            } else {
                history.push({
                    id: data.id || Date.now().toString(),
                    text: data.text,
                    arabic: data.arabic,
                    count: data.count,
                    target: data.target,
                    date: new Date().toISOString(),
                    isFinished: data.target > 0 && data.count >= data.target,
                });
            }
            await AsyncStorage.setItem("zikir_history", JSON.stringify(history));
        } catch (e) {
            console.error(e);
        }
    }, []);

    const handlePress = useCallback(async () => {
        if (isFinished) return;

        if (hapticsEnabled) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        scale.value = withSequence(
            withTiming(0.97, { duration: 60 }),
            withSpring(1, { damping: 20, stiffness: 400 })
        );

        const newCount = zikir.count + 1;
        const updatedZikir = { ...zikir, count: newCount };
        await save(updatedZikir);
        await updateHistory(updatedZikir);

        if (newCount === zikir.target) {
            if (hapticsEnabled) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            try {
                const hasRated = await AsyncStorage.getItem("has_rated_app");
                if (!hasRated && (await StoreReview.hasAction())) {
                    setIsRateModalVisible(true);
                }
            } catch (e) {
                console.log("Error requesting review", e);
            }
        }
    }, [zikir, isFinished, hapticsEnabled, save, updateHistory, scale]);

    const resetCount = useCallback(async () => {
        if (hapticsEnabled) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }

        const newZikir = isFinished
            ? { ...zikir, id: Date.now().toString(), count: 0 }
            : { ...zikir, count: 0 };

        await save(newZikir);
        await updateHistory(newZikir);
    }, [zikir, isFinished, hapticsEnabled, save, updateHistory]);

    const startFreeMode = useCallback(async () => {
        // If already in free mode, just close sidebar
        if (zikir.target === 0) {
            setIsSidebarOpen(false);
            sidebarTranslateX.value = withTiming(-width, { duration: 250 });
            sidebarOpacity.value = withTiming(0, { duration: 250 });
            return;
        }

        const freeZikir: ZikirData = {
            id: "free_" + Date.now(),
            text: t("menu.free_mode"),
            target: 0,
            count: 0,
        };
        await save(freeZikir);
        await updateHistory(freeZikir);
        setIsSidebarOpen(false);
        sidebarTranslateX.value = withTiming(-width, { duration: 250 });
        sidebarOpacity.value = withTiming(0, { duration: 250 });
        if (hapticsEnabled) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
    }, [zikir.target, hapticsEnabled, save, updateHistory, sidebarOpacity, sidebarTranslateX, t]);

    const toggleSidebar = useCallback(() => {
        const nextState = !isSidebarOpen;
        setIsSidebarOpen(nextState);
        sidebarTranslateX.value = withTiming(nextState ? 0 : -width, { duration: 250 });
        sidebarOpacity.value = withTiming(nextState ? 1 : 0, { duration: 250 });
    }, [isSidebarOpen, sidebarOpacity, sidebarTranslateX]);

    const toggleHaptics = async () => {
        const newState = !hapticsEnabled;
        setHapticsEnabled(newState);
        await AsyncStorage.setItem("haptics_enabled", newState.toString());
        if (newState) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

    const toggleReminder = async (value: boolean) => {
        setReminderEnabled(value);
        if (value) {
            await scheduleDailyNotification(reminderTime.getHours(), reminderTime.getMinutes());
            await AsyncStorage.setItem("notification_time", JSON.stringify({
                hour: reminderTime.getHours(),
                minute: reminderTime.getMinutes()
            }));
        } else {
            await cancelAllNotifications();
            await AsyncStorage.removeItem("notification_time");
        }
    };

    const onTimeChange = async (event: any, selectedDate?: Date) => {
        setShowTimePicker(Platform.OS === "ios");
        if (selectedDate) {
            setReminderTime(selectedDate);
            if (reminderEnabled) {
                await scheduleDailyNotification(selectedDate.getHours(), selectedDate.getMinutes());
                await AsyncStorage.setItem("notification_time", JSON.stringify({
                    hour: selectedDate.getHours(),
                    minute: selectedDate.getMinutes()
                }));
            }
        }
    };

    return {
        zikir,
        isFinished,
        hapticsEnabled,
        isSidebarOpen,
        isReminderModalVisible,
        isRateModalVisible,
        reminderEnabled,
        reminderTime,
        showTimePicker,
        scale,
        sidebarTranslateX,
        sidebarOpacity,
        progressValue,
        pulseValue,
        setIsSidebarOpen,
        setIsReminderModalVisible,
        setIsRateModalVisible,
        setShowTimePicker,
        loadInitialData,
        handlePress,
        resetCount,
        startFreeMode,
        toggleSidebar,
        toggleHaptics,
        changeLanguage,
        toggleReminder,
        onTimeChange,
        t,
        i18n,
        languages: [
            { code: "tr", label: t("common.languages.tr"), flag: "🇹🇷" },
            { code: "en", label: t("common.languages.en"), flag: "🇺🇸" },
            { code: "de", label: t("common.languages.de"), flag: "🇩🇪" },
            { code: "fr", label: t("common.languages.fr"), flag: "🇫🇷" },
            { code: "ru", label: t("common.languages.ru"), flag: "🇷🇺" },
            { code: "bs", label: t("common.languages.bs"), flag: "🇧🇦" },
        ],
    };
}
