import { useState, useEffect } from "react";
import useUserStore from "@/Zustand/store/authStore";

/**
 * A hook that returns `true` once the Zustand store has been rehydrated.
 * - Named export to match your import: { useHasHydrated }
 * - Uses a short fallback timeout to avoid indefinite blocking.
 */
export const useHasHydrated = (timeoutMs = 1500): boolean => {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const persist = (useUserStore as any).persist;

    // Fast path: if persist.hasHydrated exists and is already true
    try {
      if (persist && typeof persist.hasHydrated === "function") {
        const already = persist.hasHydrated();
        if (already) {
          if (mounted) setHasHydrated(true);
          return;
        }
      }
    } catch (e) {
      // ignore and fall back to subscribe / timeout
    }

    // Subscribe if available
    let unsub: (() => void) | undefined;
    try {
      if (persist && typeof persist.onFinishHydration === "function") {
        unsub = persist.onFinishHydration(() => {
          if (mounted) setHasHydrated(true);
        });
      }
    } catch (e) {
      // ignore
    }

    // Timeout fallback — avoid waiting forever
    timeoutId = setTimeout(() => {
      if (mounted && !hasHydrated) {
        setHasHydrated(true);
      }
    }, timeoutMs);

    return () => {
      mounted = false;
      if (timeoutId !== null) clearTimeout(timeoutId);
      if (typeof unsub === "function") {
        try {
          unsub();
        } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return hasHydrated;
};
