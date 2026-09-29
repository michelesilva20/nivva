# 0003 — Backend como modular monolith

## Contexto

O Nivva precisa de uma API Java para assumir persistência e regras de transação. Os domínios (transações, metas, orçamento) pertencem ao mesmo produto e ainda não há carga, time ou requisito operacional que justifique vários deploys.

## Alternativas consideradas

**A. Package-by-layer** (`controllers/`, `services/`, `repositories/` globais).

Simples no começo. Conforme o produto cresce, tudo de Transactions, Goals e Budgets se mistura.

**B. Microservices** (um jar por domínio).

Isolamento operacional. Custo alto: rede, deploy, consistência e observabilidade sem demanda real.

**C. Modular monolith organizado por feature.**

Um deployable. Pacotes por domínio. Evolução sem espalhar o CRUD.

## Decisão

Um único `nivva-api`, package-by-feature:

```text
com.nivva.api.transaction
com.nivva.api.account
com.nivva.api.category
com.nivva.api.common
```

Não é microservice. É um monólito com fronteiras internas claras.

## Motivo

- coesão do caso de uso;
- baixo acoplamento entre pastas;
- testabilidade por domínio;
- preparação para Goals e Budgets sem novo serviço;
- sem custo operacional de microservices.

## Consequências

**Positivas:** um `docker compose` de Postgres, um `mvnw`, um contrato `/api/v1`.

**Negativas:** disciplina de package é humana; um domínio pode vazar para outro se não houver cuidado.
