/**
 * Resilient API client for SIH Block Planning backend.
 * Tries the local Vite reverse proxy (/api) first, with automatic
 * direct fallback to http://127.0.0.1:8000 if proxy has socket/EPERM issues.
 */
export async function fetchBackend(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // 1. First attempt: Vite /api proxy
  try {
    const res = await fetch(`/api${cleanEndpoint}`, options);
    if (res.ok) {
      return res;
    }
  } catch {
    // Proxy network error, fall through to direct
  }

  // 2. Second attempt: Direct FastAPI on 127.0.0.1:8000 (CORS enabled)
  try {
    const directRes = await fetch(`http://127.0.0.1:8000${cleanEndpoint}`, options);
    if (directRes.ok) {
      return directRes;
    }
    return directRes;
  } catch {
    // 3. Third attempt: Direct FastAPI on localhost:8000
    try {
      return await fetch(`http://localhost:8000${cleanEndpoint}`, options);
    } catch {
      throw new Error(
        `Failed to reach backend at both /api${cleanEndpoint} and http://127.0.0.1:8000${cleanEndpoint}. Ensure FastAPI is running on port 8000.`
      );
    }
  }
}
