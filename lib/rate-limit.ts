type RateLimitEntry = {
  count: number;
  expiresAt: number;
};

type HeaderLike = Headers | Record<string, string | string[] | undefined> | undefined;

const store = new Map<string, RateLimitEntry>();

function readHeader(headers: HeaderLike, key: string) {
  if (!headers) return undefined;

  if (headers instanceof Headers) {
    return headers.get(key) ?? undefined;
  }

  const lowerKey = key.toLowerCase();
  for (const [entryKey, value] of Object.entries(headers)) {
    if (entryKey.toLowerCase() !== lowerKey) continue;
    if (Array.isArray(value)) {
      return value[0];
    }
    return value ?? undefined;
  }

  return undefined;
}

export function consumeRateLimit(params: { key: string; windowMs: number; maxRequests: number }) {
  const now = Date.now();
  const entry = store.get(params.key);

  if (!entry || entry.expiresAt <= now) {
    store.set(params.key, { count: 1, expiresAt: now + params.windowMs });
    return {
      success: true,
      remaining: Math.max(0, params.maxRequests - 1),
      resetMs: params.windowMs,
    };
  }

  if (entry.count >= params.maxRequests) {
    return {
      success: false,
      remaining: 0,
      retryAfterMs: entry.expiresAt - now,
    };
  }

  entry.count += 1;
  store.set(params.key, entry);

  return {
    success: true,
    remaining: Math.max(0, params.maxRequests - entry.count),
    resetMs: entry.expiresAt - now,
  };
}

type RequestLike = {
  headers?: HeaderLike;
  ip?: string | null;
} | null;

export function getClientIdentifier(input?: Request | RequestLike) {
  if (!input) {
    return "unknown";
  }

  const headers = input instanceof Request ? input.headers : input.headers;
  const directIp =
    (input instanceof Request ? undefined : input.ip) ??
    readHeader(headers, "x-real-ip") ??
    readHeader(headers, "x-client-ip");

  const forwardedFor = readHeader(headers, "x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();

  return forwardedIp || directIp || "unknown";
}
