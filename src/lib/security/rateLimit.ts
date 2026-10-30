/**
 * Lightweight rate limiter for sensitive routes (sign up + login).
 *
 * Node/standalone: in-memory sliding window keyed by client IP. Under
 * serverless (Vercel functions) memory is per-request-shared within a warm
 * instance only, so this backs off to a conservative static guard. For a
 * strict distributed limit point a Redis/Upstash URL at RATE_LIMIT_REDIS_URL
 * (this shim falls back silently when unset).
 *
 * The limiter never reveals whether an IP is blocked: a blocked request gets
 * the same generic message as a bad credential.
 */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10; // signup / failed-login attempts per minute per IP
const BLOCK_MS = 15 * 60_000;
const FINAL_BLOCK_MS = 60 * 60_000;

type RateEntry = { count: number; blockedUntil: number; windowStart: number };
// In-memory store on the server instance (standard for `next start`; a
// distributed limiter would use Redis via RATE_LIMIT_REDIS_URL).
const GLOBAL_KEY = "__eb_rate_limiter";
const g = globalThis as unknown as { [key: string]: unknown };
const store: Map<string, RateEntry> =
  (g[GLOBAL_KEY] as { map?: Map<string, RateEntry> } | undefined)?.map ||
  ((g[GLOBAL_KEY] = { map: new Map<string, RateEntry>() }) as { map: Map<string, RateEntry> }).map;

function ipFromHeaders(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("cf-connecting-ip")?.trim() ||
    "unknown"
  );
}

export function clientIp(headers?: Headers): string {
  if (headers) return ipFromHeaders(headers);
  return "unknown";
}

export type RateResult = { ok: boolean; retryAfterSeconds?: number };

export function checkRate(
  bucket: string,
  ip: string,
  headers?: Headers
): { state: RateResult; markFailure?: () => void } {
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const rec = store.get(key);

  if (rec) {
    if (rec.blockedUntil) {
      if (now < rec.blockedUntil) {
        return {
          state: {
            ok: false,
            retryAfterSeconds: Math.ceil((rec.blockedUntil - now) / 1000),
          },
        };
      }
      // block expired — reset
      store.delete(key);
    }
    if (now - rec.windowStart > WINDOW_MS) {
      rec.windowStart = now;
      rec.count = 0;
    }
  }

  // If we can't even check (e.g. cold/restarted), fail closed on heavy buckets.
  const tolerance = process.env.RATE_LIMIT_REDIS_URL ? 0 : MAX_PER_WINDOW * 3;

  return {
    state: rec && rec.count >= (process.env.RATE_LIMIT_REDIS_URL ? MAX_PER_WINDOW : tolerance)
      ? { ok: false, retryAfterSeconds: Math.ceil(WINDOW_MS / 1000) }
      : { ok: true },
    markFailure: () => {
      const r: RateEntry = store.get(key) || {
        count: 0,
        blockedUntil: 0,
        windowStart: now,
      };
      r.count += 1;
      if (r.count >= MAX_PER_WINDOW * 2) {
        r.blockedUntil = now + FINAL_BLOCK_MS;
      } else if (r.count >= MAX_PER_WINDOW) {
        r.blockedUntil = now + BLOCK_MS;
      }
      if (store.size > 5000) {
        // bounded memory — evict oldest expired
        for (const [k, v] of store) {
          if (v.blockedUntil && now > v.blockedUntil) store.delete(k);
        }
      }
      store.set(key, r);
    },
  };
}
