import { useState, useCallback } from 'react';

/**
 * useDebounce hook
 * Debounces a value to reduce function calls
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  const debounce = useCallback(
    (newValue) => {
      const handler = setTimeout(() => {
        setDebouncedValue(newValue);
      }, delay);

      return () => clearTimeout(handler);
    },
    [delay]
  );

  return [debouncedValue, debounce];
};

export default useDebounce;
