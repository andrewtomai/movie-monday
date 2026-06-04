export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, options);
  if (!res.ok) {
    let errorMsg = `API request failed: ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.error) errorMsg = body.error;
    } catch { /* ignore json parse failure */ }
    throw new ApiError(res.status, errorMsg);
  }
  return res.json();
}
