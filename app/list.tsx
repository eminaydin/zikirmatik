import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  ListRenderItem,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

interface ZikirItem {
  id: string;
  text: string;
  translation: string;
  source: string;
  target: number;
  virtue: string;
}

// Embedded data to avoid JSON import type issues
const RECOMMENDATIONS: ZikirItem[] = [
  {
    id: '1',
    text: 'Subhanallahi ve bihamdihi',
    translation: "Allah'ı hamd ile tesbih ederim",
    source: 'Buhari, Müslim',
    target: 100,
    virtue: "Günde 100 defa söyleyenin günahları deniz köpüğü kadar da olsa affedilir.",
  },
  {
    id: '2',
    text: "Subhanallahi'l-Azim ve bihamdihi",
    translation: "Yüce Allah'ı hamd ile tesbih ederim",
    source: 'Buhari',
    target: 33,
    virtue: 'Dilde hafif, terazide ağır, Rahman\'a sevgili olan iki kelime.',
  },
  {
    id: '3',
    text: 'La havle ve la kuvvete illa billah',
    translation: "Güç ve kuvvet ancak Allah'ındır",
    source: 'Müslim',
    target: 100,
    virtue: "Cennet hazinelerinden bir hazinedir.",
  },
  {
    id: '4',
    text: 'Elhamdulillah',
    translation: "Hamd Allah'adır",
    source: 'Müslim',
    target: 33,
    virtue: 'Mizanı doldurur.',
  },
  {
    id: '5',
    text: 'Allahu Ekber',
    translation: 'Allah en büyüktür',
    source: 'Müslim',
    target: 33,
    virtue: 'Namaz sonrası her birini 33 defa söylemek, bütün günahları siler.',
  },
  {
    id: '6',
    text: "La ilahe illallah vahdehü la şerike leh, lehü'l-mülkü ve lehü'l-hamdü ve hüve ala külli şey'in kadir",
    translation: "Allah'tan başka ilah yoktur, O tektir, ortağı yoktur.",
    source: 'Buhari, Müslim',
    target: 10,
    virtue: 'Günde 10 kez söyleyen, İsmail oğullarından 4 köle azat etmiş gibi sevap kazanır.',
  },
];

export default function ListScreen() {
  const router = useRouter();

  const selectZikir = async (item: ZikirItem) => {
    await Haptics.selectionAsync();
    const newZikir = { text: item.text, target: item.target, count: 0 };
    await AsyncStorage.setItem('selected_zikir', JSON.stringify(newZikir));
    router.back();
  };

  const renderItem: ListRenderItem<ZikirItem> = ({ item }) => (
    <Pressable style={styles.card} onPress={() => selectZikir(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.text}</Text>
        <Text style={styles.cardTarget}>{item.target}×</Text>
      </View>
      <Text style={styles.cardTranslation}>{item.translation}</Text>
      <Text style={styles.cardVirtue}>{item.virtue}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardSource}>📖 {item.source}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={RECOMMENDATIONS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.dark.text,
    flex: 1,
    marginRight: 10,
    lineHeight: 24,
  },
  cardTarget: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.primary,
  },
  cardTranslation: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  cardVirtue: {
    fontSize: 13,
    color: Colors.dark.text,
    marginBottom: 12,
    lineHeight: 19,
    opacity: 0.85,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 8,
  },
  cardSource: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    fontWeight: '500',
  },
});
