import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export function useNotifications() {
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState<Notifications.Notification | false>(false);
    const notificationListener = useRef<Notifications.Subscription | null>(null);
    const responseListener = useRef<Notifications.Subscription | null>(null);

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => setExpoPushToken(token || ''));

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log(response);
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    const scheduleDailyNotification = async (hour: number, minute: number) => {
        await Notifications.cancelAllScheduledNotificationsAsync();

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Huzur Vakti ✨",
                body: "Kalpler ancak Allah'ı anmakla huzur bulur. Kısa bir zikir molasına ne dersin? 🌙",
                sound: 'default',
            },
            trigger: {
                hour,
                minute,
                repeats: true,
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
            } as Notifications.DailyTriggerInput,
        });

        await AsyncStorage.setItem('notification_time', JSON.stringify({ hour, minute }));
    };

    const cancelAllNotifications = async () => {
        await Notifications.cancelAllScheduledNotificationsAsync();
        await AsyncStorage.removeItem('notification_time');
    };

    return {
        expoPushToken,
        notification,
        scheduleDailyNotification,
        cancelAllNotifications,
    };
}

async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            return;
        }
        // We only need local notifications for now, but keeping push registration logic for future
        try {
            token = (await Notifications.getExpoPushTokenAsync()).data;
        } catch (e) {
            console.log('Error getting push token', e);
        }
    }

    return token;
}
