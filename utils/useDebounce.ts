import { useEffect, useState } from 'react';

/**
 * Generic debounce hook.
 * Returns a debounced value that only updates after the specified delay.
 * This helps to limit rapid consecutive state changes that would otherwise
 * trigger expensive side-effects such as API calls.
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}
