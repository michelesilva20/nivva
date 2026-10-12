import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { NivvaCard, NivvaText, ScreenContainer, useNivvaTheme } from "@/core/design-system";

import { AuthHeader } from "./AuthHeader";
import { AuthPrimaryButton } from "./AuthPrimaryButton";
import { AuthTextField } from "./AuthTextField";
import { PasswordField } from "./PasswordField";
import { resolveAuthFormError, validateAuthForm } from "./auth-form-logic";

type AuthFormProps = {
  headline: string;
  subheadline: string;
  submitLabel: string;
  submittingLabel: string;
  linkLabel: string;
  onLinkPress: () => void;
  onSubmit: (values: { displayName: string; email: string; password: string }) => Promise<void>;
  includeName?: boolean;
  passwordHint?: string;
};

export function AuthForm({
  headline,
  subheadline,
  submitLabel,
  submittingLabel,
  linkLabel,
  onLinkPress,
  onSubmit,
  includeName = false,
  passwordHint,
}: AuthFormProps) {
  const theme = useNivvaTheme();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (saving) {
      return;
    }

    const validationError = validateAuthForm({ includeName, displayName, email, password });
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSubmit({ displayName, email, password });
    } catch (caught) {
      setError(resolveAuthFormError(caught));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={theme.spacing.sm}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: theme.spacing.lg,
            paddingBottom: theme.spacing.huge,
          }}
        >
          <View
            style={{
              height: 88,
              marginHorizontal: -theme.spacing.lg,
              marginBottom: theme.spacing.lg,
              overflow: "hidden",
            }}
          >
            <LinearGradient
              colors={theme.colors.heroGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1, opacity: 0.18 }}
            />
          </View>

          <AuthHeader headline={headline} subheadline={subheadline} />

          <NivvaCard>
            {includeName ? (
              <AuthTextField
                label="Nome"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
              />
            ) : null}
            <AuthTextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
            />
            <PasswordField value={password} onChangeText={setPassword} hint={passwordHint} />

            {error ? (
              <NivvaText variant="bodyMedium" tone="expense" style={{ marginBottom: theme.spacing.md }}>
                {error}
              </NivvaText>
            ) : null}

            <AuthPrimaryButton
              label={submitLabel}
              busyLabel={submittingLabel}
              busy={saving}
              onPress={() => {
                void handleSubmit();
              }}
            />
          </NivvaCard>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={linkLabel}
            onPress={onLinkPress}
            style={{ marginTop: theme.spacing.lg, minHeight: theme.layout.touchTarget, alignItems: "center", justifyContent: "center" }}
          >
            <NivvaText variant="bodyMedium" tone="secondary">
              {linkLabel}
            </NivvaText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
