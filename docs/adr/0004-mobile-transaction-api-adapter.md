# 0004 — Adapter de Transaction selecionável

## Contexto

O mobile já persistia transações do usuário via `TransactionRepository` no AsyncStorage. A API isolada em `nivva-api/` foi validada contra PostgreSQL. Era o momento de ligar só o vertical de Transactions.

## Problema

Como migrar a persistência de Transaction para o servidor sem duas fontes de verdade e sem acoplar telas a HTTP?

## Alternativas

**A.** Substituir o AsyncStorage de vez.

Quebra o app sem backend e força migração de dados locais sem regras de sync.

**B.** Dual-write (AsyncStorage + API).

Duas verdades. Falha parcial gera divergência invisível.

**C.** Adapters selecionáveis por configuração. Uma source of truth ativa por vez.

## Decisão

C.

`EXPO_PUBLIC_TRANSACTION_SOURCE=local|api`. Default: `local`.

Em modo API, PostgreSQL é autoritativo. Em modo local, AsyncStorage é autoritativo. Sem dual-write, sem fallback automático, sem migração automática das transações locais.

A persistência resolve a identidade: o adapter local gera `expense-`/`income-`; a API devolve UUID. O domínio mobile continua sendo `Transaction`.

## Consequências positivas

- o mesmo contrato cobre os dois adapters;
- a UI não conhece `fetch` nem DTO;
- a integração é reversível no desenvolvimento;
- falha de rede não grava no aparelho “como se fosse o servidor”.

## Consequências negativas

- dois modos temporários de desenvolvimento;
- dados locais não aparecem em modo API;
- sem offline quando o modo é API;
- Account/Category ainda estão duplicados entre app e servidor.

## Futuro

Autenticação, sync, estratégia offline, migração local e reference data no servidor.
