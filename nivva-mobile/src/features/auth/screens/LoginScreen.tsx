import { useRouter } from "expo-router";

import { AuthForm } from "../components/AuthForm";
import { useAuth } from "../context/AuthProvider";

export function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  return (
    <AuthForm
      title="Entrar"
      submitLabel="Entrar"
      linkLabel="Criar conta"
      onLinkPress={() => router.replace("/register")}
      onSubmit={({ email, password }) => login(email, password)}
    />
  );
}
