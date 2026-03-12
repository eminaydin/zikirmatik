import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useCallback } from "react";

export function useStorage<T>(key: string, initialValue: T) {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch (error) {
      console.error(`Error loading data from ${key}:`, error);
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveData = async (newValue: T) => {
    try {
      setData(newValue);
      await AsyncStorage.setItem(key, JSON.stringify(newValue));
    } catch (e) {
      console.error("Save error:", e);
    }
  };

  return { data, saveData, loading };
}
