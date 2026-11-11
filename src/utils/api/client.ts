export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface Options extends Omit<RequestInit, "body"> {
  body?: unknown;
  timeoutMs?: number;
}

export async function apiFetch<T>(url: string, { body, timeoutMs = 10_000, headers, ...init }: Options = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  let data: unknown;
  try {
    response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const isJson = response.headers.get("content-type")?.includes("application/json");
    data = isJson
      ? await response.json().catch((error: unknown) => {
          if (controller.signal.aborted) throw error;
          return null;
        })
      : null;
  } catch (error) {
    const aborted = controller.signal.aborted || (error instanceof DOMException && error.name === "AbortError");
    throw new ApiError(aborted ? "Request timed out" : "Network error", 0, error);
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const record = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
    const message =
      typeof record.message === "string"
        ? record.message
        : typeof record.detail === "string"
          ? record.detail
          : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, data);
  }
  return data as T;
}
