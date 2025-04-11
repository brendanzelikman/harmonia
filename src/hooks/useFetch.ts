import { useCallback, useEffect, useState } from "react";

/** Custom hook for fetching asynchronous data */
export const useFetch = <T>(fetch: () => Promise<T>, signal?: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch the data and handle loading and error states
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetch();
      setData(result);
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch the data when the component mounts
  useEffect(() => {
    fetchData();
    if (signal) {
      window.addEventListener(signal, fetchData);
    }
  }, []);

  // Return the data, loading state, and error statep
  return { data, loading, loaded: !loading && !!data, error, fetchData };
};
