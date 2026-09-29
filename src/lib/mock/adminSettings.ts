import type { PlatformSettings } from "@/types";

// TODO: persist to backend
export const defaultPlatformSettings: PlatformSettings = {
  subscriptionPrice: 5000,
  defaultExamDuration: 30,
  defaultPassMark: 50,
  appName: "Exam Bridge",
  logoUrl: undefined,
};
