// hooks/useHasHydrated.ts
import { useState, useEffect } from "react";
import useUserStore from "@/Zustand/store/authStore";

/**
 * A hook that returns `true` once the Zustand store has been rehydrated
 * from AsyncStorage.
 */
export const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // The `persist` middleware adds this `onRehydrateStorage` listener.
    // It will run once the store is ready.
    const unsubFinishHydration = useUserStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    // If the store is already hydrated, set the state immediately.
    if (useUserStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }

    return () => {
      unsubFinishHydration();
    };
  }, []);

  return hasHydrated;
};
