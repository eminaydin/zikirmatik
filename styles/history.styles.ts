import { StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  tabBar: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  tabActive: {
    backgroundColor: "rgba(234, 179, 8, 0.1)",
    borderColor: Colors.dark.primary,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabText: {
    color: Colors.dark.textSecondary,
    fontWeight: "600",
    fontSize: 14,
  },
  tabTextActive: {
    color: Colors.dark.primary,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  cardFinished: {
    borderColor: "#10B98133",
    backgroundColor: "#10B98108",
  },
  deleteActionContainer: {
    width: 70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    marginLeft: 12,
  },
  deleteAction: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: 6,
  },
  countContainer: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  cardCount: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.dark.primary,
  },
  cardTarget: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: -2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B98115",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#10B981",
    marginLeft: 4,
    textTransform: "uppercase",
  },
  cardDate: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    opacity: 0.6,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    color: Colors.dark.textSecondary,
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadgeOngoing: {
    backgroundColor: "#EAB30815",
  },
  statusTextOngoing: {
    color: "#EAB308",
  },
  cardCountFinished: {
    color: "#10B981",
  },
});
