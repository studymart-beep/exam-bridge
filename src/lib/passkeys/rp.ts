import { getSiteUrl } from "@/lib/site";

/** Relying Party config for WebAuthn */
export function getRpConfig(): {
  rpID: string;
  rpName: string;
  origin: string;
} {
  const origin = getSiteUrl();
  let rpID = "localhost";
  try {
    rpID = new URL(origin).hostname;
  } catch {
    rpID = "localhost";
  }
  return {
    rpID,
    rpName: "Exam Bridge",
    origin,
  };
}
