import { StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    list: {
        padding: 16,
        paddingBottom: 32,
    },
    sectionHeader: {
        backgroundColor: Colors.dark.surface,
        padding: 18,
        borderRadius: 16,
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.dark.text,
    },
    card: {
        backgroundColor: Colors.dark.surface,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.dark.primary,
    },
    cardFirst: {
        borderTopWidth: 0,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        marginBottom: 16,
    },
    cardSubsequent: {
        borderRadius: 16,
        marginBottom: 16,
        marginTop: 4,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: Colors.dark.text,
        flex: 1,
        marginRight: 10,
    },
    cardArabic: {
        fontSize: 22,
        color: Colors.dark.primary,
        textAlign: "right",
        marginBottom: 12,
        lineHeight: 34,
    },
    cardTarget: {
        fontSize: 14,
        fontWeight: "800",
        color: Colors.dark.primary,
    },
    cardTranslation: {
        fontSize: 13,
        color: Colors.dark.textSecondary,
        fontStyle: "italic",
        marginBottom: 10,
        lineHeight: 18,
    },
    cardFooter: {
        borderTopWidth: 1,
        borderTopColor: Colors.dark.border,
        paddingTop: 10,
    },
    cardSource: {
        fontSize: 12,
        color: Colors.dark.textSecondary,
        fontWeight: "400",
        lineHeight: 18,
    },
    saveButton: {
        backgroundColor: "#22C55E",
        padding: 12,
        borderRadius: 10,
        marginTop: 12,
        alignItems: "center",
    },
    saveButtonPressed: {
        opacity: 0.8,
    },
    saveButtonText: {
        color: "#000",
        fontWeight: "700",
    },
});
