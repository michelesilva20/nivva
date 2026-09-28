import type { NivvaIconName } from "@/core/design-system";
import type { GoalIconKey } from "@/domain/models";

export const goalIcons: { key: GoalIconKey; icon: NivvaIconName; label: string }[] = [
  { key: "home", icon: "home", label: "Casa" },
  { key: "travel", icon: "flight", label: "Viagem" },
  { key: "emergency", icon: "health-and-safety", label: "Reserva" },
  { key: "education", icon: "school", label: "Estudo" },
  { key: "purchase", icon: "shopping-bag", label: "Compra" },
  { key: "other", icon: "flag", label: "Outro" },
];

export function goalIcon(key: GoalIconKey): NivvaIconName {
  return goalIcons.find((item) => item.key === key)?.icon ?? "flag";
}
