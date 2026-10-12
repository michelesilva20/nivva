import { ApiError, isApiError } from "@/data/api/api-error";

const DETAIL_COPY: Record<string, string> = {
  "Goal not found": "Meta não encontrada",
  "deadline must not be in the past": "Escolha um prazo a partir de hoje.",
  "targetAmountCents cannot be less than the contributed amount":
    "O valor da meta não pode ser menor que o valor já registrado.",
  "Contribution exceeds remaining amount": "Esse valor ultrapassa o que falta para concluir a meta.",
  "Completed goal cannot receive contributions": "Esta meta já está concluída.",
  "amountCents must be greater than 0": "Informe um valor maior que zero.",
};

export function toGoalUserMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.detail && DETAIL_COPY[error.detail]) {
      return DETAIL_COPY[error.detail];
    }

    if (error.status === 404) {
      return "Meta não encontrada";
    }

    if (error.message.trim().length > 0 && error.message !== "Unprocessable Entity") {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Não foi possível concluir. Tente novamente.";
}

export function isGoalNetworkError(error: unknown): boolean {
  return error instanceof ApiError && error.isNetworkError;
}
