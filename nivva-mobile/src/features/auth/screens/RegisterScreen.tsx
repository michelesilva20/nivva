import { useRouter } from "expo-router";

import { AuthForm } from "../components/AuthForm";
import { useAuth } from "../context/AuthProvider";

export function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  return (
    <AuthForm
      title="Criar conta"
      submitLabel="Criar conta"
      linkLabel="Já tenho uma conta"
      includeName
      onLinkPress={() => router.replace("/login")}
      onSubmit={({ displayName, email, password }) => register(displayName, email, password)}
    />
  );
}
