import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  Alert,
  Dimensions,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

interface HistoryItem {
  id: string;
  text: string;
  arabic?: string;
  count: number;
  target: number;
  date: string;
  isFinished: boolean;
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'ongoing' | 'finished'>('ongoing');
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      AsyncStorage.getItem('zikir_history').then((val) => {
        if (val) {
          setHistory(JSON.parse(val).reverse());
        }
      });
    }, [])
  );

  const deleteItem = async (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    await AsyncStorage.setItem('zikir_history', JSON.stringify([...updatedHistory].reverse()));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const clearHistory = async () => {
    Alert.alert(
      'Geçmişi Temizle',
      'Tüm zikir geçmişiniz silinecek. Bu işlem geri alınamaz. Onaylıyor musunuz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { 
          text: 'Evet, Sil', 
          style: 'destructive',
          onPress: async () => {
            setHistory([]);
            await AsyncStorage.removeItem('zikir_history');
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        },
      ]
    );
  };

  const selectItem = async (item: HistoryItem) => {
    if (item.isFinished) return;
    
    await Haptics.selectionAsync();
    const activeZikir = {
        id: item.id, // Pass the existing ID
        text: item.text,
        arabic: item.arabic,
        count: item.count,
        target: item.target,
    };
    await AsyncStorage.setItem('selected_zikir', JSON.stringify(activeZikir));
    router.push('/');
  };

  const renderRightActions = (id: string) => (
    <View style={styles.deleteAction}>
      <Ionicons name="trash" size={24} color="#FFF" />
    </View>
  );

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <Swipeable
        renderRightActions={() => renderRightActions(item.id)}
        onSwipeableWillOpen={(direction) => {
          if (direction === 'right') {
            deleteItem(item.id);
          }
        }}
        friction={1.5}
        rightThreshold={width * 0.5}
        overshootRight={false}
    >
        <Pressable 
            style={[styles.card, item.isFinished && styles.cardFinished]}
            onPress={() => selectItem(item)}
        >
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.text}</Text>
                {item.isFinished ? (
                  <View style={styles.statusBadge}>
                    <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                    <Text style={styles.statusText}>Tamamlandı</Text>
                  </View>
                ) : (
                  <View style={[styles.statusBadge, { backgroundColor: '#EAB30815' }]}>
                    <Ionicons name="time" size={12} color="#EAB308" />
                    <Text style={[styles.statusText, { color: '#EAB308' }]}>Devam Ediyor</Text>
                  </View>
                )}
            </View>
            <View style={styles.countContainer}>
                <Text style={[styles.cardCount, item.isFinished && { color: '#10B981' }]}>
                    {item.count}
                </Text>
                <Text style={styles.cardTarget}>/ {item.target || 33}</Text>
            </View>
          </View>
          <Text style={styles.cardDate}>{new Date(item.date).toLocaleString('tr-TR')}</Text>
        </Pressable>
    </Swipeable>
  );

  const filteredHistory = history.filter(item => 
    activeTab === 'finished' ? item.isFinished : !item.isFinished
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.tabBar}>
          <Pressable 
            style={[styles.tab, activeTab === 'ongoing' && styles.tabActive]} 
            onPress={() => setActiveTab('ongoing')}
          >
            <Text style={[styles.tabText, activeTab === 'ongoing' && styles.tabTextActive]}>Devam Edenler</Text>
          </Pressable>
          <Pressable 
            style={[styles.tab, activeTab === 'finished' && styles.tabActive]} 
            onPress={() => setActiveTab('finished')}
          >
            <Text style={[styles.tabText, activeTab === 'finished' && styles.tabTextActive]}>Tamamlananlar</Text>
          </Pressable>
        </View>

        {filteredHistory.length > 0 ? (
          <View style={{ flex: 1 }}>
            <FlatList
              data={filteredHistory}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
            />
            <Pressable style={styles.clearButton} onPress={clearHistory}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text style={styles.clearText}>Geçmişi Temizle</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.empty}>
            <Ionicons name="time-outline" size={64} color={Colors.dark.border} />
            <Text style={styles.emptyText}>
                {activeTab === 'finished' 
                    ? 'Henüz tamamlanmış bir zikir yok.' 
                    : 'Henüz devam eden bir zikir yok.'}
            </Text>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  tabBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  tabActive: {
    backgroundColor: Colors.dark.primary + '15',
    borderColor: Colors.dark.primary,
  },
  tabText: {
    color: Colors.dark.textSecondary,
    fontWeight: '600',
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
    borderColor: '#10B98133',
    backgroundColor: '#10B98108',
  },
  deleteAction: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 16,
    marginBottom: 12,
    marginLeft: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 6,
  },
  countContainer: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  cardCount: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.dark.primary,
  },
  cardTarget: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: -2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B98115',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  cardDate: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    opacity: 0.6,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    color: Colors.dark.textSecondary,
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  clearButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.surface,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EF444433',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  clearText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 8,
  },
});
