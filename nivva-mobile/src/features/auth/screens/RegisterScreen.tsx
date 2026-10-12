import { useRouter } from "expo-router";

import { AuthForm } from "../components/AuthForm";
import { useAuth } from "../context/AuthProvider";

export function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  return (
    <AuthForm
      headline="Crie sua conta"
      subheadline="Comece a organizar seu dinheiro com mais clareza."
      submitLabel="Criar conta"
      submittingLabel="Criando conta..."
      linkLabel="Já tenho uma conta"
      includeName
      passwordHint="Mínimo de 8 caracteres."
      onLinkPress={() => router.replace("/login")}
      onSubmit={({ displayName, email, password }) => register(displayName, email, password)}
    />
  );
}
