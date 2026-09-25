import { View } from "react-native";

import { useNivvaTheme } from "../theme/ThemeProvider";
import { NivvaText } from "./NivvaText";

export function NivvaWordmark() {
  const theme = useNivvaTheme();

  return (
    <View accessibilityRole="header" accessibilityLabel="nivva" style={{ flexDirection: "row" }}>
      <NivvaText variant="headingSmall" accessibilityElementsHidden importantForAccessibility="no">
        ni
      </NivvaText>
      <NivvaText
        variant="headingSmall"
        tone="brand"
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        v
      </NivvaText>
      <NivvaText
        variant="headingSmall"
        style={{ color: theme.colors.brandAccent }}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        v
      </NivvaText>
      <NivvaText variant="headingSmall" accessibilityElementsHidden importantForAccessibility="no">
        a
      </NivvaText>
    </View>
  );
}
