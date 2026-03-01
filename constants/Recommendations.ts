export interface ZikirItem {
    id: string;
    text: string;
    arabic?: string;
    translation: string;
    source: string;
    target: number;
}

export interface ZikirSection {
    title: string;
    data: ZikirItem[];
}

export const CATEGORIZED_RECOMMENDATIONS: ZikirSection[] = [
    {
        title: 'basic',
        data: [
            {
                id: '12',
                text: 'Subhanallahi vel-hamdülillahi ve la ilahe illallahu vallahu ekber',
                arabic: 'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلٰهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ',
                translation: 'Allah\'ı tenzih ederim, hamd O\'nadır, O\'ndan başka ilah yoktur ve Allah en büyüktür.',
                source: 'Müslim, Âdâb 12',
                target: 100,
            },
            {
                id: '15',
                text: 'La ilahe illallahu vahdehu la şerike leh, lehü\'l-mülkü ve lehü\'l-hamdü ve hüve ala külli şey\'in kadir',
                arabic: 'لَا إِلٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
                translation: 'Allah\'tan başka ilah yoktur, tektir, ortağı yoktur. Mülk O\'nundur, hamd O\'nadır.',
                source: 'Buhari, Daavat 54',
                target: 100,
            },
            {
                id: '6',
                text: 'Subhanallahi ve bihamdihi adede halkihi ve rida nefsihi ve zinete arşihi ve midade kelimatih',
                arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ وَرِضَا نَفْسِهِ وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ',
                translation: 'Yarattıklarının sayısınca, kendisinin hoşnutluğunca, Arş\'ının ağırlığınca ve kelimelerinin mürekkebince Allah\'ı hamd ile tesbih ederim.',
                source: 'Müslim, Zikir 79',
                target: 100,
            },
            {
                id: '9',
                text: 'La ilahe illallahü\'l-melikü\'l-hakku\'l-mübin',
                arabic: 'لَا إِلٰهَ إِلَّا اللَّهُ الْمَلِكُ الْحَقُ service الْمُبِينُ',
                translation: 'Mülk sahibi, hak ve varlığı apaçık olan Allah\'tan başka ilah yoktur.',
                source: 'Hadis-i Şerif',
                target: 100,
            },
            {
                id: '13',
                text: 'Ya Zel Celali vel İkram',
                arabic: 'يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
                translation: 'Ey Celal ve İkram sahibi olan Allah\'ım!',
                source: 'Tirmizi, Daavat 92',
                target: 100,
            },
        ]
    },
    {
        title: 'protection',
        data: [
            {
                id: '1',
                text: 'La ilahe illa ente subhaneke inni kuntu minez-zalimin',
                arabic: 'لَا إِلٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
                translation: 'Senden başka ilah yoktur. Seni eksikliklerden tenzih ederim, ben zalimlerden oldum.',
                source: 'Enbiya Suresi, 87',
                target: 33,
            },
            {
                id: '4',
                text: 'Hasbunallahu ve ni\'mel vekil, ni\'mel mevla ve ni\'men-nasir',
                arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ نِعْمَ الْمَوْلَى وَنِعْمَ النَّصِيرُ',
                translation: 'Allah bize yeter, O ne güzel vekildir. Ne güzel mevla ve ne güzel yardımcıdır.',
                source: 'Âl-i İmrân Suresi, 173',
                target: 100,
            },
            {
                id: '2',
                text: 'Hasbiyallahu la ilahe illa hu, aleyhi tevekkeltü ve hüve rabbü\'l-arşi\'l-azim',
                arabic: 'حَسْبِيَ اللَّهُ لَا إِلٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
                translation: 'Bana Allah yeter. O\'ndan başka ilah yoktur. Ben O\'na tevekkül ettim ve O, büyük Arş\'ın Rabbidir.',
                source: 'Tevbe Suresi, 129',
                target: 7,
            },
            {
                id: '8',
                text: 'Ya Hayyu Ya Kayyum bi-rahmetike estegisu, aslih li şe\'ni kullehu ve la tekilni ila nefsi tarfete ayn',
                arabic: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ',
                translation: 'Ey Hayy ve Kayyum olan Allah\'ım! Senin rahmetinden yardım dilerim. İşlerimi düzelt ve beni nefsime bırakma.',
                source: 'Tirmizi, Daavat 91',
                target: 33,
            },
        ]
    },
    {
        title: 'healing',
        data: [
            {
                id: '7',
                text: 'Estağfirullahe\'l-azim el-lezi la ilahe illa huve\'l-hayyu\'l-kayyumu ve etubü ileyh',
                arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
                translation: 'Kendisinden başka ilah olmayan, Hayy ve Kayyum olan Azim Allah\'tan mağfiret dilerim.',
                source: 'Ebû Dâvûd, Vitir 26',
                target: 100,
            },
            {
                id: '3',
                text: 'Rabbi inni messeniye\'d-durru ve ente erhamu\'r-rahimin',
                arabic: 'رَبِّ أَنِّي مَسَّنِيَ الضُّرُّ وَأَنْتَ أَرْحَمُ الرَّاحِمِينَ',
                translation: 'Rabbim! Şüphesiz bu dert beni sardı; sen ise merhametlilerin en merhametlisisin.',
                source: 'Enbiya Suresi, 83',
                target: 33,
            },
        ]
    },
    {
        title: 'salavat',
        data: [
            {
                id: '10',
                text: 'Allahumme salli ala seyyidina Muhammedin salaten tuncina biha min cemial ehvali vel-afat',
                arabic: 'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَاةً تُنْجِينَا بِهَا مِنْ جَمِيعِ الْأَهْوَالِ وَالْآفَاتِ',
                translation: 'Allah\'ım! Efendimiz Muhammed\'e öyle bir salat et ki, onunla bizi tüm korku ve belalardan kurtar.',
                source: 'Salat-ı Münciye',
                target: 11,
            },
            {
                id: '11',
                text: 'Allahumme salli salaten kamileten ve sellim selamen tammen ala seyyidina Muhammedinillezi tenhallu bihil ukad',
                arabic: 'اللَّهُمَّ صَلِّ صَلاَةً كَامِلَةً وَسَلِّمْ سَلاَمًا تَامًّا عَلَى سَيِّدِنَا مُحَمَّدٍ الَّذِي تَنْحَلُّ بِهِ الْعُقَدُ',
                translation: 'Allah\'ım! Efendimiz Muhammed\'e kâmil bir salât ve tam bir selâm eyle ki, onun hürmetine düğümler çözülsün.',
                source: 'Salat-ı Tefriciye',
                target: 100,
            },
        ]
    },
    {
        title: 'quran',
        data: [
            {
                id: '5',
                text: 'Rabbena atina fid-dunya haseneten ve fil-ahireti haseneten ve kina azaben-nar',
                arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
                translation: 'Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver ve bizi ateş azabından koru.',
                source: 'Bakara Suresi, 201',
                target: 33,
            },
            {
                id: '14',
                text: 'Rabbi heb li min ledunke zurriyeten tayyibeten inneke semi\'ud-dua',
                arabic: 'رَبِّ هَبْ لِي مِنْ لَدُنْكَ ذُرِّيَّةً طَيِّبَةً إِنَّكَ سَمِيعُ الدُّعَاءِ',
                translation: 'Rabbim! Bana katından temiz bir nesil bahşet. Şüphesiz sen duayı hakkıyla işitensin.',
                source: 'Âl-i İmrân Suresi, 38',
                target: 33,
            },
        ]
    },
];
