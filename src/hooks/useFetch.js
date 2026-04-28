import { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { useAuth } from './useAuth';

export function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchData = async () => {
      try {
        const config = {
          ...options,
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
          },
          signal: abortController.signal,
        };

        const response = await apiClient(url, config);
        setData(response.data);
        setError(null);
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError(err.message);
          setData(null);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [url, token, options]);

  return { data, error, loading };
}
