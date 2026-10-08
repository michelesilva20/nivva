import { ApiError } from "./api-error";

export const API_TIMEOUT_MS = 10_000;

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
};

export type ApiClientDependencies = {
  getAccessToken?: () => Promise<string | null>;
  onUnauthorized?: () => void | Promise<void>;
};

export type ApiClient = {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T>;
};

export function getApiBaseUrl(): string {
  const baseUrl = process.env.EXPO_PUBLIC_NIVVA_API_BASE_URL?.trim();

  if (!baseUrl) {
    throw new ApiError({
      message: "Configure o endereço da API no arquivo .env.",
    });
  }

  return baseUrl.replace(/\/$/, "");
}

export function createApiClient(dependencies: ApiClientDependencies = {}): ApiClient {
  return {
    request<T>(path: string, options: ApiRequestOptions = {}) {
      return apiRequest<T>(path, options, dependencies);
    },
  };
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
  dependencies: ApiClientDependencies = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  const accessToken = (await dependencies.getAccessToken?.()) ?? null;

  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      method: options.method ?? "GET",
      headers: {
        Accept: "application/json",
        ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const payload = await readJson(response);

    if (!response.ok) {
      if (response.status === 401 && accessToken) {
        await dependencies.onUnauthorized?.();
      }
      throw toApiError(response.status, payload);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError({
      message: "Não foi possível conectar ao Nivva.",
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();

  if (text.trim() === "") {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function toApiError(status: number, payload: unknown): ApiError {
  const problem = isRecord(payload) ? payload : {};
  const detail = typeof problem.detail === "string" ? problem.detail : undefined;
  const title = typeof problem.title === "string" ? problem.title : undefined;
  const fieldErrors = isRecord(problem.errors)
    ? Object.fromEntries(
        Object.entries(problem.errors).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
      )
    : undefined;

  return new ApiError({
    message: userMessageForStatus(status, detail),
    status,
    title,
    detail,
    fieldErrors,
  });
}

function userMessageForStatus(status: number, detail?: string): string {
  if (status === 400) {
    return "Revise os dados e tente novamente.";
  }

  if (status === 401) {
    return "Email ou senha inválidos.";
  }

  if (status === 404) {
    return "Este lançamento não foi encontrado.";
  }

  if (status === 409) {
    return "Este email já está cadastrado.";
  }

  if (status === 422) {
    return detail ?? "Este lançamento não pôde ser salvo.";
  }

  return "Não foi possível concluir. Tente novamente.";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
