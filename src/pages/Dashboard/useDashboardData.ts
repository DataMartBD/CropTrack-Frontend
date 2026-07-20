import { useCallback, useEffect, useRef, useState } from "react";

import { getData } from "../../services/apiClient";
import type { DashboardData } from "./types";

type DashboardState = {
  data: DashboardData | null;
  /** True only until the first payload lands — a refresh never re-skeletons. */
  isLoading: boolean;
  /** True while a background refresh is in flight over existing data. */
  isRefreshing: boolean;
  error: string | null;
  /** When the currently displayed payload arrived. */
  lastUpdated: Date | null;
  refresh: () => void;
};

export function useDashboardData(): DashboardState {
  const [data, setData] = useState<DashboardData | null>(null);
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
      const payload = await getData<DashboardData>("/accounts/dashboard/");
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
        failure?.response?.data?.message ??
          failure?.message ??
          "Failed to load dashboard.",
      );
    } finally {
      if (isMounted.current && id === requestId.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

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
