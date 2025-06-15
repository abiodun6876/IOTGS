import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

export function useLocalStorageArray<T>(key: string) {
  const [items, setItems] = useLocalStorage<T[]>(key, []);

  const addItem = (item: T) => {
    setItems(prev => [...prev, item]);
  };

  const updateItem = (index: number, item: T) => {
    setItems(prev => prev.map((existing, i) => i === index ? item : existing));
  };

  const deleteItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const clearItems = () => {
    setItems([]);
  };

  return {
    items,
    addItem,
    updateItem,
    deleteItem,
    clearItems,
    setItems
  };
}