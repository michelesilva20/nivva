# 0005 — Autenticação JWT e ownership de Transaction

## Contexto

Transactions já vivem no servidor, mas não tinham usuário. Qualquer cliente que alcançasse a API lia e alterava tudo.

## Problema

Como autenticar a pessoa e garantir isolamento de dados sem deixar o cliente escolher o dono?

## Alternativas

**A.** `userId` enviado pelo cliente.

Rejeitado: o cliente poderia falsificar ownership.

**B.** Sessão/cookie server-side.

Válido, mas não escolhido para uma API mobile stateless nesta fase.

**C.** JWT Bearer + `sub` autenticado + `user_id` no banco.

## Decisão

C.

- Register e login públicos; `/me` e `/api/v1/transactions/**` exigem Bearer.
- Access token only, HS256, TTL 60 minutos. Secret em `NIVVA_JWT_SECRET_BASE64` (Base64 de no mínimo 32 bytes).
- `sub` = UUID do User. O DTO de Transaction não tem `userId`.
- Consultas são `id + userId`. Acesso cruzado devolve 404, não 403.
- CSRF desabilitado: não há cookie de sessão; a credencial é Bearer.
- Accounts/Categories continuam reference data global e públicas.
- Logout só apaga o token local. O JWT já emitido segue válido até expirar.

## Consequências positivas

- isolamento entre usuários no backend;
- API stateless;
- ownership explícito e testável;
- mobile autenticável no modo API;
- modo local continua sem login.

## Consequências negativas

- relogin após expiração;
- logout não revoga o token emitido;
- Goals/Budget continuam device-local;
- Accounts ainda não são pessoais.
