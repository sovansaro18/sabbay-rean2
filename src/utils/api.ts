// Custom fetch wrapper to automatically attach CSRF token in request headers.
// This avoids attempting to override the read-only window.fetch property.

let memoryCsrfToken = "";

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const match = document.cookie.match(/(^|;)\s*csrf_token\s*=\s*([^;]+)/);
  let csrfToken = match ? match[2] : "";

  // Fallback to memory or localStorage if document.cookie is empty or blocked by iframe security
  if (!csrfToken) {
    try {
      csrfToken = memoryCsrfToken || localStorage.getItem("csrf_token") || "";
    } catch (e) {
      csrfToken = memoryCsrfToken;
    }
  }

  const newInit: RequestInit = { ...init };
  
  if (csrfToken) {
    if (!newInit.headers) {
      newInit.headers = {};
    }

    if (newInit.headers instanceof Headers) {
      newInit.headers.set('X-CSRF-Token', csrfToken);
    } else if (Array.isArray(newInit.headers)) {
      newInit.headers = newInit.headers.filter(h => h[0] !== 'X-CSRF-Token');
      newInit.headers.push(['X-CSRF-Token', csrfToken]);
    } else {
      newInit.headers = {
        ...newInit.headers,
        'X-CSRF-Token': csrfToken,
      } as Record<string, string>;
    }
  }

  const res = await fetch(input, newInit);

  // Read X-CSRF-Token from response headers to save for subsequent requests
  const respCsrf = res.headers.get("X-CSRF-Token") || res.headers.get("x-csrf-token");
  if (respCsrf) {
    memoryCsrfToken = respCsrf;
    try {
      localStorage.setItem("csrf_token", respCsrf);
    } catch (e) {
      // Ignore localStorage errors (e.g., inside restricted iframes)
    }
  }

  return res;
}
