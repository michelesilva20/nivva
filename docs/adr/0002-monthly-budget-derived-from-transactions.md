# 0002 — Orçamento mensal derivado das transações

## Contexto

O Nivva já mostrava orçamento e “Ainda posso gastar”, mas o teto era a constante de demonstração R$ 6.300. A pessoa precisa configurar o limite do mês sem transformar planejamento em fato financeiro.

## Problema

Dá para persistir o limite junto com gasto, restante e percentual, ou persistir só a intenção e derivar o uso das despesas do período.

## Alternativas consideradas

**A.** Gravar limite, gasto, restante e percentual.

O card fica simples de ler do storage. Qualquer edição ou exclusão de despesa exige sincronizar números duplicados.

**B.** Persistir somente `MonthlyBudget.limit` por `YYYY-MM` e derivar gasto, restante, excesso e utilização das `Transaction` do mês.

Uma fonte de verdade para gastos. O snapshot combina dois domínios.

## Decisão

Persistir só o limite planejado do período. Gasto e métricas nascem das transações.

Permitir limite menor que o já gasto. Orçamento é intenção; não invalida fatos.

Não gravar o default de R$ 6.300 só porque o app abriu. Sem override do mês, o teto efetivo é o de demonstração.

Status derivado: `within` ou `exceeded`. Sem faixa de “atenção” nesta versão.

## Motivo

- uma fonte de verdade para gastos;
- editar ou excluir despesa recalcula o orçamento;
- receita e aporte de meta não entram;
- testes determinísticos;
- preparação para `GET/PUT /budgets/{period}`.

## Consequências

**Positivas:** menos estado duplicado; Home e Analytics leem o mesmo snapshot; excesso aparece como valor, não só como 100%.

**Negativas:** o snapshot combina `FinanceProvider` e `BudgetProvider`; a hidratação do orçamento precisa terminar antes de exibir números.
