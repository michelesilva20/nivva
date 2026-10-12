# Nivva

**Seu dinheiro. Mais claro.**

O repositório tem o app Expo e a API.

| Pasta | O que é |
| --- | --- |
| `nivva-mobile/` | App mobile em React Native, Expo e TypeScript |
| `nivva-api/` | API Java 21 / Spring Boot. Auth, Accounts, Transactions e Goals via REST e PostgreSQL. |
| `docs/` | Mapa do produto, estrutura e ADRs |
| `.cursor/` | Regras do agente |

O mapa do que já existe, do que já funciona e do que ainda não foi construído está em [`docs/PROJETO.md`](docs/PROJETO.md). O mapa de pastas e pacotes está em [`docs/ESTRUTURA.md`](docs/ESTRUTURA.md).

```text
Nivva Mobile
    ↕ REST + JWT (Accounts, Transactions e Goals, se EXPO_PUBLIC_TRANSACTION_SOURCE=api)
Nivva API
    ↓
PostgreSQL
```

Budget continua só no aparelho. Default do mobile: persistência local.

Para abrir no celular com o Expo Go, entre em `nivva-mobile` e siga o README de lá. Para subir a API isolada, entre em `nivva-api` e siga o README de lá.

```bash
cd nivva-mobile
npm install
npx expo login
npx expo start --go
```
