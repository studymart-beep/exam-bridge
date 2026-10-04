"use client";

import { useEffect } from "react";
import { getMySubscriptionStatus } from "@/lib/actions/student/materials";
import { purgeAllCache, purgeExpiredCache } from "@/lib/offline/cache";

export default function CacheManager() {
  useEffect(() => {
    void (async () => {
      try {
        const status = await getMySubscriptionStatus();
        if (!status.active) await purgeAllCache();
        else await purgeExpiredCache();
      } catch {
        /* ignore */
      }
    })();
  }, []);
  return null;
}
