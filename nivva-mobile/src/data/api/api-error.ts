export class ApiError extends Error {
  readonly status?: number;
  readonly title?: string;
  readonly detail?: string;
  readonly fieldErrors?: Record<string, string>;

  constructor(input: {
    message: string;
    status?: number;
    title?: string;
    detail?: string;
    fieldErrors?: Record<string, string>;
  }) {
    super(input.message);
    this.name = "ApiError";
    this.status = input.status;
    this.title = input.title;
    this.detail = input.detail;
    this.fieldErrors = input.fieldErrors;
  }

  get isNetworkError(): boolean {
    return this.status == null;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
