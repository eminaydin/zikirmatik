import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

export function useStorage<T>(key: string, initialValue: T) {
    const [data, setData] = useState<T>(initialValue);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const value = await AsyncStorage.getItem(key);
            if (value !== null) {
                setData(JSON.parse(value));
            }
        } catch (e) {
            console.error('Storage error:', e);
        } finally {
            setLoading(false);
        }
    };

    const saveData = async (newValue: T) => {
        try {
            setData(newValue);
            await AsyncStorage.setItem(key, JSON.stringify(newValue));
        } catch (e) {
            console.error('Save error:', e);
        }
    };

    return { data, saveData, loading };
}
