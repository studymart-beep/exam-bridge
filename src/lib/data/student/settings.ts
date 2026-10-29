import {
  getPlatformSettings,
  type PlatformSettings,
} from "@/lib/data/platformSettings";

/** v31: student-facing settings are the platform settings. */
export type PublicSettings = PlatformSettings;

export async function getPublicSettings(): Promise<PublicSettings> {
  return getPlatformSettings();
}
