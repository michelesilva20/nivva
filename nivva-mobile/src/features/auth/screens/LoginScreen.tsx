import { useRouter } from "expo-router";

import { AuthForm } from "../components/AuthForm";
import { useAuth } from "../context/AuthProvider";

export function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  return (
    <AuthForm
      headline="Seu dinheiro. Mais claro."
      subheadline="Entre para acompanhar suas contas, gastos e metas."
      submitLabel="Entrar"
      submittingLabel="Entrando..."
      linkLabel="Criar uma conta"
      onLinkPress={() => router.replace("/register")}
      onSubmit={({ email, password }) => login(email, password)}
    />
  );
}
