import { StyleSheet, Dimensions } from "react-native";
import { Colors } from "../constants/Colors";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
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
});
