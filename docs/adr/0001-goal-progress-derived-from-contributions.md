# 0001 — Progresso da meta derivado de contribuições

## Contexto

A aba Metas precisa registrar objetivos financeiros e acompanhar o quanto já foi reservado. A tentação imediata é gravar `currentAmount` direto no `Goal`.

O Nivva já trata transações como fatos e deriva totais, saldos e orçamento. Metas deveria seguir a mesma regra: persistir o que aconteceu, calcular o que isso significa.

## Alternativas consideradas

**A.** Persistir `currentAmount` no `Goal`.

Simples de gravar e de exibir. Sem histórico, difícil de auditar, fácil de divergir do que a pessoa realmente registrou.

**B.** Persistir `GoalContribution` e derivar o valor atual, o restante, o percentual e o status.

Uma entidade a mais. Cálculos precisam somar as contribuições. O estado fica reproduzível e testável.

## Decisão

Usar `GoalContribution` como fato persistido. `currentAmount`, `remainingAmount`, `progress` e `status` nascem de cálculo.

## Motivo

- histórico de progresso sem tabela paralela de totais;
- cálculos reproduzíveis a partir dos mesmos fatos;
- menos estado duplicado;
- testes diretos sobre regras de domínio;
- preparação para API, analytics e insights futuros.

Não é event sourcing. É um registro simples de aportes.

## Consequências

**Positivas:** o estado da meta pode ser reconstruído; editar o alvo recalcula o status; excluir a meta apaga as contribuições juntas.

**Negativas:** o modelo tem duas entidades; a UI nunca deve gravar percentual.

## Relação futura com a API

`Goal` vira o agregado. `GoalContribution` vira registro relacionado. Endpoints possíveis: `GET/POST /goals`, `GET/PUT/DELETE /goals/{id}`, `GET/POST /goals/{id}/contributions`. Ainda não implementados.
