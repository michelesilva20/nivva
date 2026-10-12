import { isApiError } from "@/data/api/api-error";

export function validateAuthForm(input: {
  includeName: boolean;
  displayName: string;
  email: string;
  password: string;
}): string | null {
  if (input.includeName && input.displayName.trim().length < 2) {
    return "Informe seu nome.";
  }
  if (!input.email.trim()) {
    return "Informe seu email.";
  }
  if (input.password.length < 8) {
    return "A senha precisa ter pelo menos 8 caracteres.";
  }
  return null;
}

export function resolveAuthFormError(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  return "Não foi possível conectar ao Nivva.";
}

export function nextSavingState(current: boolean): boolean {
  return current ? current : true;
}
