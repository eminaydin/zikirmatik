import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { ZikirItem } from "../constants/Recommendations";

export function useZikirList() {
    const { t } = useTranslation();
    const router = useRouter();
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["salavat"]));

    const toggleSection = useCallback((title: string) => {
        setExpandedSections((prev) => {
            const next = new Set(prev);
            if (next.has(title)) {
                next.delete(title);
            } else {
                next.add(title);
            }
            return next;
        });
    }, [t]);

    const selectZikir = useCallback(async (item: ZikirItem) => {
        await Haptics.selectionAsync();
        const activeZikir = {
            id: "preset_" + item.id,
            text: t(`recommendations.${item.id}.text`),
            arabic: item.arabic,
            count: 0,
            target: item.target,
        };
        await AsyncStorage.setItem("selected_zikir", JSON.stringify(activeZikir));

        // Also add to history as an ongoing session
        const stored = await AsyncStorage.getItem("zikir_history");
        const history = stored ? JSON.parse(stored) : [];
        history.push({
            ...activeZikir,
            date: new Date().toISOString(),
            isFinished: false,
        });
        await AsyncStorage.setItem("zikir_history", JSON.stringify(history));

        router.back();
    }, [router]);

    return {
        t,
        expandedSections,
        toggleSection,
        selectZikir,
    };
}
