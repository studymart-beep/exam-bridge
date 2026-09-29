"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "exam-bridge-is-subscribed";

interface SubscriptionContextValue {
  isSubscribed: boolean;
  setSubscribed: (value: boolean) => void;
  toggle: () => void;
  ready: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "true") setIsSubscribed(true);
      if (stored === "false") setIsSubscribed(false);
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  const setSubscribed = useCallback((value: boolean) => {
    setIsSubscribed(value);
    try {
      localStorage.setItem(STORAGE_KEY, value ? "true" : "false");
    } catch {
      // ignore
    }
    // TODO: replace with API call
  }, []);

  const toggle = useCallback(() => {
    setSubscribed(!isSubscribed);
  }, [isSubscribed, setSubscribed]);

  const value = useMemo(
    () => ({ isSubscribed, setSubscribed, toggle, ready }),
    [isSubscribed, setSubscribed, toggle, ready]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }
  return ctx;
}
