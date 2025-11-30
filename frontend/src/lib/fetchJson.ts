import api from "./api";

// Use a permissive `any` for options so callers can pass plain objects without TS errors
export async function fetchJson(path: string, options: any = {}) {
  const url = path.startsWith("http") ? path : api(path);

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };

  // Attach token if available
  const token = localStorage.getItem("edurate_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const hasBody = options.body !== undefined && options.body !== null;

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  // If body is a plain object, stringify and set content-type
  if (hasBody && !(options.body instanceof FormData)) {
    if (typeof options.body !== "string") {
      fetchOptions.body = JSON.stringify(options.body);
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
    }
  }

  try {
    const res = await fetch(url, fetchOptions);
    const text = await res.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      // response not JSON
      data = text;
    }

    if (!res.ok) {
      let msg = data?.message || `Request failed with status ${res.status}`;
      if (!data?.message && Array.isArray(data?.errors)) {
        const combined = data.errors
          .map((er: any) => er?.msg || er?.message)
          .filter(Boolean)
          .join(", ");
        if (combined) msg = combined;
      }
      const err: any = new Error(msg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    // network or parsing error
    throw err;
  }
}

export default fetchJson;
