import { useState, useEffect } from 'react';
import { getAutomations } from '../api/mockApi';
import type { AutomationAction } from '../types';

export function useAutomations() {
  const [automations, setAutomations] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAutomations().then(data => {
      setAutomations(data);
      setLoading(false);
    });
  }, []);

  return { automations, loading };
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
