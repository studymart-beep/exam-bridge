import { getPlatformSettings } from "@/lib/data/platformSettings";

export type AppSettings = Awaited<ReturnType<typeof getPlatformSettings>>;

/**
 * v31: settings (price, bank details, Telegram support link, payment mode)
 * live in one place — see lib/data/platformSettings.ts.
 */
export async function getSettings(): Promise<AppSettings> {
  return getPlatformSettings();
}
