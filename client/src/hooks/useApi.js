import { useState, useEffect, useCallback } from 'react';
import { apiHelpers } from '../services/api';

// Custom hook for API calls with loading and error states
export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await apiHelpers.safeApiCall(apiFunction);

    if (result.success) {
      setData(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

// Custom hook for API mutations (create, update, delete)
export const useApiMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async apiFunction => {
    setLoading(true);
    setError(null);

    const result = await apiHelpers.safeApiCall(apiFunction);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      throw new Error(result.error);
    }

    return result.data;
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { mutate, loading, error, reset };
};

// Custom hook for paginated API calls
export const usePaginatedApi = (apiFunction, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0,
    totalCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchData = useCallback(
    async (newParams = {}) => {
      setLoading(true);
      setError(null);

      const mergedParams = { ...params, ...newParams };
      const result = await apiHelpers.safeApiCall(() => apiFunction(mergedParams));

      if (result.success) {
        setData(result.data.data || result.data);
        if (result.data.pagination) {
          setPagination(result.data.pagination);
        }
      } else {
        setError(result.error);
      }

      setLoading(false);
    },
    [apiFunction, params]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateParams = useCallback(newParams => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const nextPage = useCallback(() => {
    if (pagination.current < pagination.total) {
      updateParams({ page: pagination.current + 1 });
    }
  }, [pagination.current, pagination.total, updateParams]);

  const prevPage = useCallback(() => {
    if (pagination.current > 1) {
      updateParams({ page: pagination.current - 1 });
    }
  }, [pagination.current, updateParams]);

  const goToPage = useCallback(
    page => {
      if (page >= 1 && page <= pagination.total) {
        updateParams({ page });
      }
    },
    [pagination.total, updateParams]
  );

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    pagination,
    loading,
    error,
    params,
    updateParams,
    nextPage,
    prevPage,
    goToPage,
    refetch
  };
};

// Custom hook for real-time data that auto-refreshes
export const useRealtimeApi = (apiFunction, interval = 30000, dependencies = []) => {
  const { data, loading, error, refetch } = useApi(apiFunction, dependencies);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  useEffect(() => {
    if (!isAutoRefresh) return;

    const intervalId = setInterval(() => {
      refetch();
    }, interval);

    return () => clearInterval(intervalId);
  }, [refetch, interval, isAutoRefresh]);

  const toggleAutoRefresh = useCallback(() => {
    setIsAutoRefresh(prev => !prev);
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    isAutoRefresh,
    toggleAutoRefresh
  };
};

// Custom hook for managing form submissions with API
export const useApiForm = (submitFunction, onSuccess, onError) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = useCallback(
    async formData => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiHelpers.safeApiCall(() => submitFunction(formData));

        if (result.success) {
          if (onSuccess) {
            onSuccess(result.data);
          }
          return result.data;
        } else {
          setError(result.error);
          if (onError) {
            onError(result.error);
          }
          throw new Error(result.error);
        }
      } finally {
        setLoading(false);
      }
    },
    [submitFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { submit, loading, error, reset };
};
