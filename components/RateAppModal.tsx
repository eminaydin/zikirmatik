import React from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as StoreReview from "expo-store-review";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles as globalStyles } from "../styles/index.styles";
import { Colors } from "../constants/Colors";

interface RateAppModalProps {
  isVisible: boolean;
  onClose: () => void;
  t: (key: string) => string;
}

export const RateAppModal: React.FC<RateAppModalProps> = ({ isVisible, onClose, t }) => {
  const handleRate = async () => {
    if (await StoreReview.hasAction()) {
      await StoreReview.requestReview();
      await AsyncStorage.setItem("has_rated_app", "true");
    }
    onClose();
  };

  const handleNever = async () => {
    await AsyncStorage.setItem("has_rated_app", "true");
    onClose();
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={globalStyles.modalOverlay}>
        <Pressable style={globalStyles.modalBg} onPress={onClose} />
        <View style={styles.rateCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="star" size={40} color="#F59E0B" />
          </View>
          
          <Text style={styles.title}>{t("rating.title")}</Text>
          <Text style={styles.description}>{t("rating.description")}</Text>
          
          <View style={styles.buttonContainer}>
            <Pressable style={styles.primaryButton} onPress={handleRate}>
              <Text style={styles.primaryButtonText}>{t("rating.submit")}</Text>
            </Pressable>
            
            <Pressable style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>{t("rating.remind_later")}</Text>
            </Pressable>
            
            <Pressable style={styles.linkButton} onPress={handleNever}>
              <Text style={styles.linkButtonText}>{t("rating.no_thanks")}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  rateCard: {
    width: "85%",
    backgroundColor: "#1E293B",
    borderRadius: 32,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#F8FAFC",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "600",
  },
  linkButton: {
    paddingVertical: 10,
    alignItems: "center",
  },
  linkButtonText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },
});
