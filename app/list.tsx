import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SectionList,
  Pressable,
  Platform,
  UIManager,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ZikirItem {
  id: string;
  text: string;
  arabic?: string;
  translation: string;
  source: string;
  target: number;
}

const AccordionItem = ({ item, index, isExpanded, onPress }: { item: ZikirItem, index: number, isExpanded: boolean, onPress: () => void }) => {
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);

  useEffect(() => {
    if (measuredHeight !== null) {
      height.value = withTiming(isExpanded ? measuredHeight : 0, {
        duration: 400,
        easing: Easing.out(Easing.quad),
      });
      opacity.value = withTiming(isExpanded ? 1 : 0, { duration: 300 });
    }
  }, [isExpanded, measuredHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
    overflow: 'hidden',
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View 
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (h > 0 && h !== measuredHeight) {
            setMeasuredHeight(h);
            if (isExpanded && measuredHeight === null) {
              height.value = h;
              opacity.value = 1;
            }
          }
        }}
        style={{ position: 'absolute', width: '100%' }}
      >
        <Pressable 
          style={[
            styles.card,
            index === 0 ? styles.cardFirst : styles.cardSubsequent
          ]} 
          onPress={onPress}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.text}</Text>
            <Text style={styles.cardTarget}>{item.target}×</Text>
          </View>
          {item.arabic && (
            <Text style={styles.cardArabic}>{item.arabic}</Text>
          )}
          <Text style={styles.cardTranslation}>{item.translation}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardSource}>📜 {item.source}</Text>
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );
};

interface ZikirSection {
  title: string;
  data: ZikirItem[];
}

const CATEGORIZED_RECOMMENDATIONS: ZikirSection[] = [
  {
    title: 'Temel Zikirler',
    data: [
      {
        id: '12',
        text: 'Subhanallahi vel-hamdülillahi ve la ilahe illallahu vallahu ekber',
        arabic: 'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلٰهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ',
        translation: 'Allah\'ı tenzih ederim, hamd O\'nadır, O\'ndan başka ilah yoktur ve Allah en büyüktür.',
        source: 'Resulullah (sav) buyurdu: "Allah katında kelamın en sevimlisi dörttür: Sübhanallah, Elhamdülillah, Lâ ilâhe illallah ve Allahu ekber. Hangisiyle başlasan sana zarar vermez." (Müslim, Âdâb 12)',
        target: 100,
      },
      {
        id: '15',
        text: 'La ilahe illallahu vahdehu la şerike leh, lehü\'l-mülkü ve lehü\'l-hamdü ve hüve ala külli şey\'in kadir',
        arabic: 'لَا إِلٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
        translation: 'Allah\'tan başka ilah yoktur, tektir, ortağı yoktur. Mülk O\'nundur, hamd O\'nadır.',
        source: 'Resulullah (sav) buyurdu: "Kim günde yüz defa bu zikri söylerse, on köle azat etmiş gibi sevap alır, kendisine yüz iyilik yazılır ve yüz günahı silinir." (Buhari, Daavat 54)',
        target: 100,
      },
    ]
  },
  {
    title: 'Korunma ve Selamet',
    data: [
      {
        id: '1',
        text: 'La ilahe illa ente subhaneke inni kuntu minez-zalimin',
        arabic: 'لَا إِلٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
        translation: 'Senden başka ilah yoktur. Seni eksikliklerden tenzih ederim, ben zalimlerden oldum.',
        source: 'Kur\'an-ı Kerim, Enbiya Suresi 87. Ayet. Peygamber Efendimiz (sav) şöyle buyurmuştur: "Bir müslüman darda kaldığında bu dua ile dua ederse Allah mutlaka onun duasını kabul eder."',
        target: 33,
      },
      {
        id: '4',
        text: 'Hasbunallahu ve ni\'mel vekil, ni\'mel mevla ve ni\'men-nasir',
        arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ نِعْمَ الْمَوْلَى وَنِعْمَ النَّصِيرُ',
        translation: 'Allah bize yeter, O ne güzel vekildir. Ne güzel mevla ve ne güzel yardımcıdır.',
        source: 'Hz. İbrahim (as) ateşe atıldığı zaman "Hasbunallahu ve ni\'mel vekil" demiştir. Sahabe-i Kiram da düşman orduları üzerlerine geldiğinde bu zikri okumuştur. (Âl-i İmrân, 173)',
        target: 100,
      },
    ]
  },
  {
    title: 'Şifa ve İstiğfar',
    data: [
      {
        id: '7',
        text: 'Estağfirullahe\'l-azim el-lezi la ilahe illa huve\'l-hayyu\'l-kayyumu ve etubü ileyh',
        arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
        translation: 'Kendisinden başka ilah olmayan, Hayy ve Kayyum olan Azim Allah\'tan mağfiret dilerim.',
        source: 'Resulullah (sav) buyurdu: "Kim bu istiğfarı günde üç defa söylerse, savaştan kaçmış dahi olsa günahları bağışlanır." (Ebû Dâvûd, Vitir 26)',
        target: 100,
      },
    ]
  },
  {
    title: 'Salavat-ı Şerifeler',
    data: [
      {
        id: '10',
        text: 'Allahumme salli ala seyyidina Muhammedin salaten tuncina biha min cemial ehvali vel-afat',
        arabic: 'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَاةً تُنْجِينَا بِهَا مِنْ جَمِيعِ الْأَهْوَالِ وَالْآفَاتِ',
        translation: 'Allah\'ım! Efendimiz Muhammed\'e öyle bir salat et ki, onunla bizi tüm korku ve belalardan kurtar.',
        source: 'Ariflerden Şeyh Musa Efendi bir gemi yolculuğunda fırtınaya yakalandığında bu salavat kendisine öğretilmiştir ve tüm gemi halkı selâmetle kurtulmuştur.',
        target: 11,
      },
    ]
  }
];

const SectionHeader = ({ title, isExpanded, onPress }: { title: string, isExpanded: boolean, onPress: () => void }) => {
  const progress = useSharedValue(isExpanded ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isExpanded ? 1 : 0, { duration: 300 });
  }, [isExpanded]);

  const animatedStyle = useAnimatedStyle(() => ({
    marginBottom: withTiming(isExpanded ? 0 : 8, { duration: 300 }),
    borderBottomLeftRadius: withTiming(isExpanded ? 0 : 16, { duration: 300 }),
    borderBottomRightRadius: withTiming(isExpanded ? 0 : 16, { duration: 300 }),
    borderColor: isExpanded ? Colors.dark.primary : Colors.dark.border,
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: isExpanded ? Colors.dark.primary : Colors.dark.text,
  }));

  return (
    <AnimatedPressable 
      style={[styles.sectionHeader, animatedStyle]} 
      onPress={onPress}
    >
      <Animated.Text style={[styles.sectionTitle, textStyle]}>{title}</Animated.Text>
      <Ionicons 
        name={isExpanded ? "chevron-up" : "chevron-down"} 
        size={20} 
        color={isExpanded ? Colors.dark.primary : Colors.dark.textSecondary} 
      />
    </AnimatedPressable>
  );
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ListScreen() {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<string | null>('Temel Zikirler');

  const toggleSection = (title: string) => {
    setExpandedSection(prev => prev === title ? null : title);
  };

  const selectZikir = async (item: ZikirItem) => {
    await Haptics.selectionAsync();
    const sessionId = Date.now().toString();
    const newZikir = { 
        id: sessionId,
        text: item.text, 
        arabic: item.arabic,
        target: item.target, 
        count: 0 
    };
    await AsyncStorage.setItem('selected_zikir', JSON.stringify(newZikir));
    
    try {
        const historyVal = await AsyncStorage.getItem('zikir_history');
        let history = historyVal ? JSON.parse(historyVal) : [];
        history.push({
            id: sessionId,
            text: item.text,
            arabic: item.arabic,
            count: 0,
            target: item.target,
            date: new Date().toISOString(),
            isFinished: false,
        });
        await AsyncStorage.setItem('zikir_history', JSON.stringify(history));
    } catch (e) {
        console.error(e);
    }
    router.back();
  };


  const renderItem = ({ item, section, index }: { item: ZikirItem, section: ZikirSection, index: number }) => {
    const isExpanded = expandedSection === section.title;
    
    // We use a separate component logic per-item to avoid re-rendering entire list unnecessary
    // But since it's a small list, we can use a controlled visibility.
    // To ensure animation works, we render items but hide them if not expanded.
    
    return (
      <AccordionItem 
        item={item} 
        index={index} 
        isExpanded={isExpanded} 
        onPress={() => selectZikir(item)} 
      />
    );
  };

  return (
    <View style={styles.container}>
      <SectionList
        sections={CATEGORIZED_RECOMMENDATIONS}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => {
          const isExp = expandedSection === title;
          return (
            <SectionHeader 
              title={title} 
              isExpanded={isExp} 
              onPress={() => toggleSection(title)} 
            />
          );
        }}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
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
  sectionHeader: {
    backgroundColor: Colors.dark.surface,
    padding: 18,
    borderRadius: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  sectionHeaderExpanded: {
    borderColor: Colors.dark.primary,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  sectionTitleExpanded: {
    color: Colors.dark.primary,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.text,
    flex: 1,
    marginRight: 10,
  },
  cardArabic: {
    fontSize: 22,
    color: Colors.dark.primary,
    textAlign: 'right',
    marginBottom: 12,
    lineHeight: 34,
  },
  cardTarget: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.dark.primary,
  },
  cardTranslation: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    fontStyle: 'italic',
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
    fontWeight: '400',
    lineHeight: 18,
  },
});
