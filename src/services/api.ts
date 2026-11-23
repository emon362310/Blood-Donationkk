import type { ApiResponse } from '../types';

// Session token is held strictly in React/JS memory (never in localStorage/sessionStorage).
// Persistent reload sessions use HttpOnly Secure SameSite=None Partitioned cookies managed by the server.
let memoryBearerToken: string | null = null;

export function setMemoryToken(token: string | null): void {
  memoryBearerToken = token;
}

export function getMemoryToken(): string | null {
  return memoryBearerToken;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
  } = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body } = options;
  const headers: Record<string, string> = {
    'X-Requested-With': 'XMLHttpRequest'
  };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (memoryBearerToken) {
    headers['Authorization'] = `Bearer ${memoryBearerToken}`;
  }

  try {
    const res = await fetch(endpoint, {
      method,
      headers,
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
    const json = (await res.json()) as ApiResponse<T>;
    return json;
  } catch (err: any) {
    return {
      success: false,
      message: 'সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।',
      data: null,
      error: err?.message || 'NETWORK_ERROR'
    };
  }
}
