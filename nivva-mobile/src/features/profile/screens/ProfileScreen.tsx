import { View } from "react-native";

import {
  NivvaCard,
  NivvaIcon,
  NivvaScreenHeader,
  NivvaSegmentedControl,
  NivvaText,
  ScreenContainer,
  useNivvaTheme,
  useTheme,
  type ThemePreference,
} from "@/core/design-system";

const appearanceOptions: { id: ThemePreference; label: string }[] = [
  { id: "system", label: "Sistema" },
  { id: "light", label: "Claro" },
  { id: "dark", label: "Escuro" },
];

export function ProfileScreen() {
  const theme = useNivvaTheme();
  const { preference, setPreference } = useTheme();
  const selectedIndex = appearanceOptions.findIndex((option) => option.id === preference);

  return (
    <ScreenContainer>
      <View style={{ flex: 1, paddingHorizontal: theme.spacing.md }}>
        <NivvaScreenHeader title="Perfil" />
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: theme.spacing.xl,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: theme.radius.pill,
              backgroundColor: theme.colors.primarySoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <NivvaIcon name="person" color={theme.colors.primary} size={34} />
          </View>
          <NivvaText variant="headingMedium" style={{ marginTop: theme.spacing.lg, textAlign: "center" }}>
            Perfil
          </NivvaText>
          <NivvaText
            variant="bodyLarge"
            tone="secondary"
            style={{ marginTop: theme.spacing.xs, textAlign: "center" }}
          >
            Suas preferências e dados pessoais ficarão organizados aqui.
          </NivvaText>
        </View>

        <View style={{ paddingBottom: theme.spacing.xl }}>
          <NivvaText
            variant="title"
            style={{ marginBottom: theme.spacing.sm }}
            accessibilityRole="header"
          >
            Aparência
          </NivvaText>
          <NivvaCard>
            <NivvaSegmentedControl
              items={appearanceOptions.map((option) => option.label)}
              selectedIndex={selectedIndex < 0 ? 0 : selectedIndex}
              onSelect={(index) => {
                const option = appearanceOptions[index];
                if (option) {
                  setPreference(option.id);
                }
              }}
            />
          </NivvaCard>
        </View>
      </View>
    </ScreenContainer>
  );
}
