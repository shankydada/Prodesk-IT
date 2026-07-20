import { useState, useEffect } from 'react';

/**
 * Custom hook that behaves like useState but automatically
 * persists the value to localStorage and restores it on mount.
 *
 * @param {string} key - localStorage key
 * @param {*} initialValue - fallback value if nothing is stored yet
 */
export function useLocalStorage(key, initialValue) {
  // Lazy initializer: only reads from localStorage once, on first render
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Whenever storedValue changes, sync it to localStorage automatically
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
