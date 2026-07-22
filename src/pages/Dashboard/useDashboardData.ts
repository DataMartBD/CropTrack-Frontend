import { useCallback, useEffect, useRef, useState } from "react";

import { getData } from "../../services/apiClient";
import type { DashboardChartData, DashboardData } from "./types";

type Resource<T> = {
  data: T | null;
  /** True only until the first payload lands — a refresh never re-skeletons. */
  isLoading: boolean;
  /** True while a background refresh is in flight over existing data. */
  isRefreshing: boolean;
  error: string | null;
  /** When the currently displayed payload arrived. */
  lastUpdated: Date | null;
  refresh: () => void;
};

/**
 * One dashboard endpoint, loaded and re-loadable.
 *
 * The figures and the charts come from two endpoints, and the charts are the
 * slower of the two. Keeping them separate lets the balances paint as soon as
 * they arrive instead of waiting behind twelve months of aggregation — the
 * charts fill in under their own skeleton a moment later.
 */
function useApiResource<T>(endpoint: string, fallbackError: string): Resource<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // The request that is allowed to write state. A refresh fired while an older
  // one is still open must not have its result overwritten by the straggler.
  const requestId = useRef(0);
  const isMounted = useRef(true);
  const hasData = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    const id = ++requestId.current;

    if (hasData.current) setIsRefreshing(true);

    try {
      const payload = await getData<T>(endpoint);
      if (!isMounted.current || id !== requestId.current) return;

      setData(payload);
      hasData.current = true;
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      if (!isMounted.current || id !== requestId.current) return;

      const failure = err as {
        message?: string;
        response?: { status?: number; data?: { message?: string } };
      };

      // An expired session is already being handled by the axios interceptor,
      // which logs the user out — surfacing it again as a dashboard error would
      // just flash a red card on the way to the login screen.
      if (failure?.response?.status === 401) return;

      setError(
        failure?.response?.data?.message ?? failure?.message ?? fallbackError,
      );
    } finally {
      if (isMounted.current && id === requestId.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [endpoint, fallbackError]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh: () => void load(),
  };
}

/** Balances, bank accounts and the period roll-ups. */
export function useDashboardData(): Resource<DashboardData> {
  return useApiResource<DashboardData>(
    "/accounts/dashboard/",
    "Failed to load dashboard.",
  );
}

/** The month-by-month series behind the two trend charts. */
export function useDashboardCharts(): Resource<DashboardChartData> {
  return useApiResource<DashboardChartData>(
    "/accounts/dashboard/chart/",
    "Failed to load charts.",
  );
}
