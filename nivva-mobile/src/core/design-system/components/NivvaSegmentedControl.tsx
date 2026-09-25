import { Pressable, View } from "react-native";

import { useNivvaTheme } from "../theme/ThemeProvider";
import { NivvaText } from "./NivvaText";

type NivvaSegmentedControlProps = {
  items: readonly string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

export function NivvaSegmentedControl({ items, selectedIndex, onSelect }: NivvaSegmentedControlProps) {
  const theme = useNivvaTheme();

  return (
    <View
      accessibilityRole="tablist"
      style={{
        height: theme.layout.segmentedHeight,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surfaceSecondary,
        flexDirection: "row",
        padding: theme.spacing.xxs,
      }}
    >
      {items.map((item, index) => {
        const selected = index === selectedIndex;

        return (
          <Pressable
            key={item}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={item}
            onPress={() => onSelect(index)}
            style={{
              flex: 1,
              borderRadius: theme.radius.sm,
              backgroundColor: selected ? theme.colors.surface : "transparent",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: theme.spacing.xxs,
            }}
          >
            <NivvaText
              variant="labelMedium"
              tone={selected ? "brand" : "secondary"}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {item}
            </NivvaText>
          </Pressable>
        );
      })}
    </View>
  );
}
