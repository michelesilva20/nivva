import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { NivvaText, ScreenContainer, useNivvaTheme } from "@/core/design-system";
import { isApiError } from "@/data/api/api-error";

type AuthFormProps = {
  title: string;
  submitLabel: string;
  linkLabel: string;
  onLinkPress: () => void;
  onSubmit: (values: { displayName: string; email: string; password: string }) => Promise<void>;
  includeName?: boolean;
};

export function AuthForm({
  title,
  submitLabel,
  linkLabel,
  onLinkPress,
  onSubmit,
  includeName = false,
}: AuthFormProps) {
  const theme = useNivvaTheme();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (includeName && displayName.trim().length < 2) {
      setError("Informe seu nome.");
      return;
    }
    if (!email.trim()) {
      setError("Informe seu email.");
      return;
    }
    if (password.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSubmit({ displayName, email, password });
    } catch (caught) {
      setError(isApiError(caught) ? caught.message : "Não foi possível concluir. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    minHeight: theme.layout.buttonHeight,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.textPrimary,
    ...theme.typography.bodyMedium,
  };

  return (
    <ScreenContainer>
      <View style={{ flex: 1, paddingHorizontal: theme.spacing.lg, justifyContent: "center" }}>
        <NivvaText variant="display" style={{ marginBottom: theme.spacing.lg }}>
          {title}
        </NivvaText>

        {includeName ? (
          <TextInput
            accessibilityLabel="Nome"
            placeholder="Nome"
            placeholderTextColor={theme.colors.textSecondary}
            value={displayName}
            onChangeText={setDisplayName}
            style={[inputStyle, { marginBottom: theme.spacing.sm }]}
          />
        ) : null}

        <TextInput
          accessibilityLabel="Email"
          placeholder="Email"
          placeholderTextColor={theme.colors.textSecondary}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={[inputStyle, { marginBottom: theme.spacing.sm }]}
        />

        <View style={{ position: "relative", marginBottom: theme.spacing.md }}>
          <TextInput
            accessibilityLabel="Senha"
            placeholder="Senha"
            placeholderTextColor={theme.colors.textSecondary}
            secureTextEntry={secure}
            value={password}
            onChangeText={setPassword}
            style={inputStyle}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={secure ? "Mostrar senha" : "Ocultar senha"}
            onPress={() => setSecure((current) => !current)}
            style={{ position: "absolute", right: theme.spacing.md, top: 0, bottom: 0, justifyContent: "center" }}
          >
            <NivvaText variant="label" tone="secondary">
              {secure ? "Mostrar" : "Ocultar"}
            </NivvaText>
          </Pressable>
        </View>

        {error ? (
          <NivvaText variant="bodyMedium" tone="expense" style={{ marginBottom: theme.spacing.md }}>
            {error}
          </NivvaText>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={submitLabel}
          disabled={saving}
          onPress={() => {
            void handleSubmit();
          }}
          style={{
            minHeight: theme.layout.buttonHeight,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.primary,
            alignItems: "center",
            justifyContent: "center",
            opacity: saving ? 0.7 : 1,
          }}
        >
          <NivvaText variant="label" tone="inverse">
            {saving ? "Salvando..." : submitLabel}
          </NivvaText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={linkLabel}
          onPress={onLinkPress}
          style={{ marginTop: theme.spacing.lg, alignItems: "center" }}
        >
          <NivvaText variant="bodyMedium" tone="secondary">
            {linkLabel}
          </NivvaText>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
