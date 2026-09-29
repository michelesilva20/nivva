# Nivva

**Seu dinheiro. Mais claro.**

O repositório tem duas implementações.

| Pasta | O que é |
| --- | --- |
| `app/` | Referência visual em Android, Kotlin e Jetpack Compose |
| `nivva-mobile/` | App mobile em React Native, Expo e TypeScript |
| `nivva-api/` | API Java 21 / Spring Boot. Ainda isolada do app. |

O mapa completo do que já existe, do que já funciona e do que ainda não foi construído está em [`docs/PROJETO.md`](docs/PROJETO.md).

O app e a API convivem no mesmo repositório e **ainda não se falam**. Persistência do celular: AsyncStorage. Persistência da API: PostgreSQL via Flyway.

Para abrir no celular com o Expo Go, entre em `nivva-mobile` e siga o README de lá. Para subir a API isolada, entre em `nivva-api` e siga o README de lá.

```bash
cd nivva-mobile
npm install
npx expo login
npx expo start --go
```
