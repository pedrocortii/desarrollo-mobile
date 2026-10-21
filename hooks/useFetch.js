import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EMPTY_ARRAY = [];

export default function useFetch(fetcher, options = {}) {
  const { initialValue = EMPTY_ARRAY, enabled = true, cacheKey } = options;
  const initialValueRef = useRef(initialValue);
  const cacheLoaded = useRef(!cacheKey);
  const requestId = useRef(0);
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!enabled) {
      return;
    }

    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(null);

    if (cacheKey && !cacheLoaded.current) {
      cacheLoaded.current = true;

      try {
        const cachedValue = await AsyncStorage.getItem(cacheKey);
        if (cachedValue !== null) {
          const cachedData = JSON.parse(cachedValue);
          if (
            !Array.isArray(cachedData) ||
            !cachedData.every(
              (item) => item && typeof item === 'object' && Number.isFinite(Number(item.id)),
            )
          ) {
            throw new Error('El formato de los productos guardados no es válido.');
          }

          if (currentRequest === requestId.current) {
            setData(cachedData);
          }
        }
      } catch (err) {
        console.error('No se pudieron leer los productos guardados:', err);
      }
    }

    try {
      const result = await fetcher();
      if (currentRequest !== requestId.current) {
        return;
      }

      const nextData = result ?? initialValueRef.current;
      setData(nextData);

      if (cacheKey) {
        try {
          await AsyncStorage.setItem(cacheKey, JSON.stringify(nextData));
        } catch (err) {
          console.error('No se pudieron guardar los productos localmente:', err);
          setError('Los productos se actualizaron, pero no se pudieron guardar localmente.');
        }
      }
    } catch (err) {
      if (currentRequest === requestId.current) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
      }
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
      }
    }
  }, [enabled, fetcher, cacheKey]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    refetch();
  }, [enabled, refetch]);

  return { data, loading, error, refetch };
}
