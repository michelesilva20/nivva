import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ComponentProps } from "react";
import type { ColorValue } from "react-native";

export type NivvaIconName = ComponentProps<typeof MaterialIcons>["name"];

type NivvaIconProps = {
  name: NivvaIconName;
  color: ColorValue;
  size?: number;
  accessibilityLabel?: string;
};

export function NivvaIcon({ name, color, size = 24, accessibilityLabel }: NivvaIconProps) {
  return (
    <MaterialIcons
      name={name}
      color={color}
      size={size}
      accessibilityLabel={accessibilityLabel}
      importantForAccessibility={accessibilityLabel ? "yes" : "no"}
    />
  );
}
