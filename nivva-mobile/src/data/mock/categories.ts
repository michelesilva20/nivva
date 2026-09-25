import type { Category } from "@/domain/models";

export const categories: Category[] = [
  { id: "income", name: "Receita", kind: "income", icon: "payments" },
  { id: "home", name: "Moradia", kind: "home", icon: "home" },
  { id: "food", name: "Alimentação", kind: "food", icon: "local-dining" },
  { id: "transport", name: "Transporte", kind: "transport", icon: "directions-bus" },
  { id: "leisure", name: "Lazer", kind: "leisure", icon: "sports-esports" },
  { id: "subscription", name: "Assinaturas", kind: "subscription", icon: "subscriptions" },
  { id: "other", name: "Outros", kind: "other", icon: "more-horiz" },
];

export const expenseCategories = categories.filter((category) => category.kind !== "income");

export function findCategory(categoryId: string): Category | undefined {
  return categories.find((category) => category.id === categoryId);
}
