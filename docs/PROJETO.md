# Nivva — estado atual do projeto

**Seu dinheiro. Mais claro.**

Este documento descreve o repositório como ele está no código hoje. Não é um plano futuro: é o mapa do que já existe, do que já funciona e do que ainda não foi construído. Ele é atualizado junto com cada alteração que muda o produto.

Nivva é um produto de finanças pessoais. A proposta é ajudar a pessoa a entender o próprio dinheiro, não só registrar receitas e despesas. A interface coloca o valor principal primeiro, o contexto (variação, comparação, categorias) logo abaixo e as ações perto do número que elas afetam.

---

## 1. O que o repositório contém

Há duas implementações mobile. Elas convivem de propósito.

| Pasta | Papel | Situação |
| --- | --- | --- |
| `app/` | Android em Kotlin e Jetpack Compose | Referência visual e de UX. Não é o app ativo de desenvolvimento. |
| `nivva-mobile/` | React Native, Expo e TypeScript | App ativo. Roda no Expo Go. Já tem o primeiro fluxo financeiro funcional. |
| `nivva-api/` | Java 21, Spring Boot 4.1.1, PostgreSQL | API de Transactions. O mobile consome só se o env pedir. |
| `docs/` | Documentação | Este arquivo e ADRs em `docs/adr/`. |
| `README.md` | Entrada do repositório | Aponta para mobile, API e este mapa. |

O código Compose **não foi apagado**. Ele continua sendo a referência de identidade visual. A implementação nova não reutiliza Kotlin: traduz o produto para React Native.

Direção futura, ainda não implementada:

```text
Nivva Mobile (React Native / Expo)
        ↓
REST
        ↓
Nivva API (Java 21 / Spring Boot 4.1.1)
        ↓
PostgreSQL
        ↓
Análise financeira determinística
        ↓
Nivva Intelligence (a IA interpreta; o sistema calcula)
```

---

## 2. O que a pessoa já consegue fazer

No app Expo (`nivva-mobile`), hoje é possível:

- abrir o Nivva no celular pelo Expo Go;
- navegar pelas cinco abas: Início, Análises, Carteira, Metas e Perfil;
- ver saldo, receitas, despesas e quanto ainda pode gastar;
- ler o insight de demonstração;
- ver transações recentes;
- filtrar Análises por Semana, Mês, Ano ou Personalizado;
- ver gráfico, orçamento e gastos por categoria;
- deslizar as contas da carteira e ver o histórico do mês;
- escolher a aparência: Sistema, Claro ou Escuro (a escolha fica salva no aparelho);
- **adicionar um gasto** e ver Home, Carteira e Análises atualizarem na hora;
- **adicionar uma receita** pela Home e ver saldo e receitas aumentarem, sem mudar despesas nem o disponível do orçamento;
- **fechar e abrir o app** e encontrar os movimentos criados no aparelho, com os mesmos totais e saldos;
- abrir o **histórico completo**, pesquisar, filtrar, ver o detalhe, editar e excluir lançamentos criados no aparelho;
- criar **metas**, registrar progresso, editar o alvo e excluir a meta com o histórico de aportes;
- configurar o **orçamento do mês** e ver Home e Análises recalcularem o disponível.

Em modo `local`, o app abre sem login. Em modo `api`, a pessoa cria conta ou entra, e só então carrega os lançamentos daquele usuário. Ainda não há Open Finance nem IA.

---

## 3. App ativo — React Native / Expo

### Stack

| Item | Escolha |
| --- | --- |
| Linguagem | TypeScript em modo estrito |
| UI | React Native 0.86.3 |
| Runtime | Expo SDK 57 |
| Navegação | Expo Router (rotas por arquivo) |
| Fontes | Urbanist via `@expo-google-fonts/urbanist` |
| Ícones | `@expo/vector-icons` (Material Icons) |
| Persistência de tema | AsyncStorage (`@nivva/theme-preference`) |
| Persistência financeira | AsyncStorage (`@nivva/finance/transactions:v1`) no modo local; API + JWT no modo `api` |
| Token de acesso | `expo-secure-store` (`nivva.auth.access-token.v1`) |
| Persistência de metas | AsyncStorage (`@nivva/goals:v1`) |
| Persistência de orçamento | AsyncStorage (`@nivva/budgets:v1`) |
| Data no formulário | `@react-native-community/datetimepicker` |
| Testes | `node:test` via `tsx` |
| Compatibilidade | Expo Go (sem Development Build) |

Versão do app Expo: `1.0.0`. Pacote visual: nome **Nivva**, scheme `nivva`.

### Como executar

Na pasta `nivva-mobile`:

```bash
npm install
npx expo login
npx expo start --go
```

O Expo Go desta versão só abre o projeto se a mesma conta estiver no computador e no celular. Conta gratuita em [expo.dev](https://expo.dev).

Se a rede local falhar:

```bash
npx expo start --tunnel
```

Outros comandos:

```bash
npm run typecheck
npm test
```

---

## 4. Arquitetura do app Expo

Regra: `app/` define rotas; `src/` contém o produto.

```text
nivva-mobile/
├── app/
│   ├── _layout.tsx                 tema, fontes, finanças, metas, orçamento, aviso
│   ├── (tabs)/
│   │   ├── _layout.tsx             barra inferior
│   │   ├── index.tsx               Início
│   │   ├── analytics.tsx
│   │   ├── wallet.tsx
│   │   ├── goals.tsx
│   │   └── profile.tsx
│   ├── budget.tsx                  editar orçamento do mês
│   ├── goals/                      novas metas, detalhe, progresso e edição
│   └── transactions/
│       ├── index.tsx               Histórico completo (fora das tabs)
│       ├── new-expense.tsx         Novo gasto (fora das tabs)
│       └── new-income.tsx          Nova receita (fora das tabs)
│
└── src/
    ├── core/design-system/         tokens, tema, componentes
    ├── domain/models/              Money, Transaction, Account, Category, Goal, MonthlyBudget
    ├── data/mock/                  semente de demonstração
    ├── data/repositories/          contrato + AsyncStorage (depois, API)
    ├── features/
    │   ├── home/
    │   ├── analytics/
    │   ├── wallet/
    │   ├── budget/                 BudgetProvider, cálculos e edição do teto
    │   ├── goals/                  GoalProvider, cálculos e telas de metas
    │   ├── profile/
    │   ├── transactions/           histórico, detalhe, edição, gasto e receita
    │   └── finance/                estado, cálculos, merge local, snapshots
    └── shared/                     formatação, aviso, placeholder
```

Alias de import: `@/` aponta para `src/`.

Não há Redux nem Zustand. A API existe em `nivva-api/`; o mobile escolhe, por env, se as transações do usuário vêm do AsyncStorage ou dessa API. Totais não são persistidos: são derivados. Goals e orçamentos configurados continuam só no aparelho.

### Fluxo de dados

```text
semente (mocks)
+
transações do usuário (TransactionRepository)
    ↓
FinanceProvider (Context + useReducer)
    ↓
useHomeData / useAnalyticsData / useWalletData
    ↓
snapshots calculados
    ↓
telas

goals + contributions (GoalRepository)
    ↓
GoalProvider
    ↓
snapshots de meta calculados
    ↓
aba Metas

orçamentos configurados (BudgetRepository)
    ↓
BudgetProvider
    ↓
limite efetivo do mês
    ↓
Home / Análises
```

A tela não sabe se o dado veio do AsyncStorage ou da API. Troca-se o adapter do `TransactionRepository` por `EXPO_PUBLIC_TRANSACTION_SOURCE`. As telas continuam recebendo snapshots. Em modo API, PostgreSQL é a fonte das `userTransactions`; a seed continua só no mobile e é somente leitura. Sem dual-write, sem fallback silencioso e sem migração automática do storage local.

---

## 5. Navegação

Barra inferior com rótulo sempre visível.

| Rota | Aba | Tela |
| --- | --- | --- |
| `/` | Início | `HomeScreen` |
| `/analytics` | Análises | `AnalyticsScreen` |
| `/budget` | — | `BudgetScreen` |
| `/wallet` | Carteira | `WalletScreen` |
| `/goals` | Metas | `GoalsScreen` |
| `/goals/new` | — | `NewGoalScreen` |
| `/goals/[id]` | — | `GoalDetailsScreen` |
| `/goals/[id]/contribute` | — | `ContributeGoalScreen` |
| `/goals/[id]/edit` | — | `EditGoalScreen` |
| `/profile` | Perfil | `ProfileScreen` (preparação + aparência) |
| `/transactions` | — | `TransactionsScreen` |
| `/transactions/new-expense` | — | `NewExpenseScreen` |
| `/transactions/new-income` | — | `NewIncomeScreen` |
| `/transactions/[id]` | — | `TransactionDetailsScreen` |
| `/transactions/[id]/edit` | — | `EditTransactionScreen` |

As rotas de histórico, detalhe, edição, novo gasto e nova receita abrem acima das tabs, sem criar aba nova. Home → **Ver todas** e Carteira → busca do histórico abrem `/transactions`. No histórico, tocar um item abre o detalhe. Home → **Adicionar** escolhe Despesa ou Receita. Carteira → **Adicionar gasto** continua abrindo só o gasto.

Análises → **Editar** abre `/budget`, acima das tabs, sem aba nova.

Ainda sem efeito: Transferir, QR, notificações, calendário de Análises, adicionar conta.

---

## 6. Telas

### Início

- Marca **nivva**, sino e avatar **MS**.
- Cartão de saldo em degradê (`#6257FF` → `#3BA7F5` → `#25D2C1`).
- Métricas: Receitas, Despesas, Ainda posso gastar.
- Insight de demonstração: “Você gastou 12% menos em alimentação este mês.”
- **Adicionar** abre a escolha entre Despesa e Receita.
- Três transações mais recentes. **Ver todas** abre o histórico completo.

Em largura estreita, as duas primeiras métricas ficam na mesma linha e “Ainda posso gastar” desce.

### Análises

- Períodos: Semana, Mês, Ano, Personalizado.
- Total de gastos, comparação com o mês anterior, gráfico dos últimos seis meses, orçamento e categorias.
- Totais e participação das categorias **são calculados** a partir das transações do período selecionado.
- O card de orçamento é sempre o **mês civil atual**, mesmo se o filtro for Semana ou Ano. O rótulo mostra o mês para não parecer orçamento anual.
- Personalizado ainda se comporta como Mês.
- **Editar** abre `/budget`. Alterar o teto não cria transação nem mexe no saldo.

### Orçamento mensal

Campo de valor no mesmo padrão monetário das transações. Mostra gasto até agora e disponível ou excesso. Copy deixa claro que alterar o teto não movimenta contas. Ao salvar, volta para Análises com **Orçamento atualizado**.

### Carteira

- Segmentos visuais: Contas, Cartões, Investimentos. Cartões e Investimentos ainda não têm conteúdo próprio.
- Contas: **Conta principal** e **Reserva**.
- Histórico do mês corrente, **somente despesas**, ordenado da mais nova para a mais antiga. Receitas novas entram no histórico completo, não nesta lista.
- A busca do histórico abre a tela de transações com o campo focado.
- Ações rápidas: só **Adicionar gasto** navega.

### Metas

Lista metas ativas primeiro e concluídas depois. Empty state com convite para criar a primeira. O resumo (ativas, valor em progresso, total de objetivos) é derivado.

Registrar progresso **não movimenta conta, receita, despesa nem orçamento**. A tela de aporte deixa isso explícito.

### Perfil

Placeholder de dados pessoais, mais o controle **Aparência** (Sistema / Claro / Escuro).

### Novo gasto

Campos: valor (centavos, teclado numérico), descrição, categoria, conta, data e observação opcional.

Validações: valor maior que zero, descrição, categoria e conta obrigatórias. Erros no próprio formulário, sem `alert()`.

A data começa em **hoje** e pode ser alterada no calendário do sistema. Ao salvar, o app volta e mostra **Gasto adicionado**.

### Nova receita

Mesmo formulário compartilhado do gasto, sem seletor de categoria. A categoria é sempre **Receita** (`income`). A descrição diferencia Salário, Freelance, Venda etc.

Validações: valor maior que zero, descrição e conta. Ao salvar, o aviso é **Receita adicionada**.

Acesso: Home → **Adicionar** → **Receita**. A Carteira não ganhou botão de receita.

### Histórico

Lista todas as transações do estado financeiro (semente + gastos locais), da mais recente para a mais antiga, agrupadas por dia (**Hoje**, **Ontem**, `24 set` ou `28 dez 2025` se cruzar o ano).

A pessoa pode:

- buscar por título ou categoria, inclusive sem acento (`alimentacao` encontra Alimentação);
- filtrar por Todas / Despesas / Receitas;
- filtrar por categoria;
- limpar busca e filtros quando o resultado vier vazio.

A tela não lê o AsyncStorage. Filtros não são persistidos. Tocar um item abre o detalhe.

### Metas — criar, progresso e exclusão

`Goal` guarda título, alvo, prazo opcional (`YYYY-MM-DD`), ícone e nota. `GoalContribution` guarda cada aporte, sempre positivo. Valor atual, restante, percentual e status (`active` / `completed`) são calculados.

Não dá para registrar mais do que falta. Não dá para reduzir o alvo abaixo do já registrado. Meta concluída não recebe novo aporte; aumentar o alvo a reabre. Excluir a meta apaga as contribuições juntas.

Prazo novo não pode ser no passado. Aportes e metas não passam pelo `FinanceProvider`. Decisão: [`docs/adr/0001-goal-progress-derived-from-contributions.md`](adr/0001-goal-progress-derived-from-contributions.md).

### Detalhe, edição e exclusão

O detalhe mostra título, valor com sinal, categoria, conta, data e observação.

Só transações **criadas no aparelho** podem ser editadas ou excluídas. A semente aparece como “Lançamento de demonstração”, sem esses botões.

Editar reutiliza o `TransactionForm`. O `id` e o tipo (`income` / `expense`) não mudam. Despesa não vira receita, e o contrário também não. Depois de salvar, o app volta ao detalhe atualizado e mostra **Transação atualizada**.

Excluir pede confirmação. Depois, o app volta ao histórico e mostra **Transação excluída**. A semente não é gravada nem apagada.

---

## 7. Domínio financeiro

### Dinheiro

Valores ficam em **centavos inteiros** (`Money.cents`).

| Exibição | Armazenamento |
| --- | --- |
| R$ 129,90 de gasto | `-12990` |
| R$ 4.320,00 de despesa no total | soma dos valores absolutos das despesas |
| R$ 4.850,00 de salário | `485000` |

Formatação centralizada em `formatCurrency`, locale `pt-BR`, moeda `BRL`.

O frontend ainda deriva saldo, receitas, despesas, orçamento e gráficos. A API nesta fase só persiste Transaction. Cálculos no servidor vêm depois.

### Transação

```ts
type Transaction = {
  id: string;
  title: string;
  categoryId: string;
  accountId: string;
  amount: Money;       // positivo = receita, negativo = despesa
  occurredAt: string;
  type: "income" | "expense";
  note?: string;
};
```

A categoria não é inferida pelo título. Cada movimento aponta para um `categoryId`.

### Categorias

| id | Nome |
| --- | --- |
| `home` | Moradia |
| `food` | Alimentação |
| `transport` | Transporte |
| `leisure` | Lazer |
| `subscription` | Assinaturas |
| `other` | Outros |
| `income` | Receita (não entra no seletor de gasto) |

### Contas

| id | Nome | Tipo | Saldo inicial do cenário |
| --- | --- | --- | --- |
| `main` | Conta principal | Conta corrente | R$ 8.620,50 |
| `reserve` | Reserva | Conta digital | R$ 3.830,30 |

Soma dos saldos = saldo total da Home (R$ 12.450,80 no cenário inicial).

### Regra de saldo

Os saldos da semente **já incluem** o efeito das transações iniciais. Eles não são gravados de novo.

```text
saldo efetivo = saldo-base da semente + soma(amount das transações locais daquela conta)
```

Uma despesa tem `amount` negativo, então R$ 100 em Mercado na Conta principal vira 8.620,50 − 100,00 = **8.520,50**. Uma receita tem `amount` positivo: R$ 1.000 vira **9.620,50**. **Ainda posso gastar** é o limite efetivo do mês menos as despesas; se o gasto passar do teto, fica R$ 0. O excesso aparece em Análises. Receita não aumenta o orçamento. Depois de fechar e abrir, o app soma os movimentos locais uma vez só. Não persiste saldo alterado.

### Persistência local

AsyncStorage é solução temporária da fase offline. Chave: `@nivva/finance/transactions:v1`. Formato: `{ version: 1, transactions }`.

```text
seedTransactions + persistedUserTransactions = allTransactions
```

A semente não é gravada. Totais, gasto do orçamento, categorias, gráfico e snapshots **não** vão para o storage: são recalculados. Tema continua em outra chave.

Ao abrir, o app lê o storage, reconstrói o estado e só então mostra as telas. Storage vazio ou inválido cai no cenário inicial, sem crash.

Para desenvolvimento: no console de debug, `await clearLocalFinanceData()` apaga só as transações locais. Depois recarregue o app. Não é apagar conta.

### Metas (domínio próprio)

`Goal` e `GoalContribution` ficam fora do `FinanceProvider`. Chave: `@nivva/goals:v1`. Formato: `{ version: 1, goals, contributions }`.

```ts
type Goal = {
  id: string;
  title: string;
  targetAmount: Money;
  deadline?: string; // YYYY-MM-DD
  note?: string;
  iconKey?: GoalIconKey;
  createdAt: string;
};

type GoalContribution = {
  id: string;
  goalId: string;
  amount: Money; // sempre positivo
  occurredAt: string;
  note?: string;
};
```

Não persiste `currentAmount`, percentual nem status. O `GoalRepository` carrega e grava o estado. `GoalProvider` hidrata e deriva os snapshots. Registrar progresso não cria `Transaction`.

Futuros endpoints, sem implementação agora: `GET/POST /goals`, `GET/PUT/DELETE /goals/{id}`, `POST/GET /goals/{id}/contributions`.

Para desenvolvimento: `await clearLocalGoalsData()` apaga só as metas.

### Orçamento mensal

`MonthlyBudget` guarda período (`YYYY-MM`) e limite. Um registro por mês. Gasto, disponível, excesso, utilização e status (`within` / `exceeded`) são calculados das despesas daquele mês.

Sem override local, o teto efetivo é o default de demonstração **R$ 6.300,00**. Esse valor **não** é gravado ao abrir o app. Só a decisão da pessoa vai para `@nivva/budgets:v1` no formato `{ version: 1, budgets }`.

Limite menor que o já gasto é válido. Receita e `GoalContribution` não entram. `BudgetProvider` fica fora do `FinanceProvider`. Decisão: [`docs/adr/0002-monthly-budget-derived-from-transactions.md`](adr/0002-monthly-budget-derived-from-transactions.md).

Futuros endpoints, sem implementação agora: `GET /budgets/{period}`, `PUT /budgets/{period}`.

Para desenvolvimento: `await clearLocalBudgetsData()` apaga só os orçamentos configurados.

### Cálculos

Funções puras em `src/features/finance/calculations/`:

- receitas do período;
- despesas do período;
- saldo das contas;
- disponível do orçamento (`teto − gasto`, mínimo 0);
- excesso (`gasto − teto`, mínimo 0);
- utilização real (pode passar de 100%) e barra visual limitada a 100%;
- gastos por categoria (percentual = valor da categoria / total de despesas);
- gráfico mensal (últimos 6 meses, barra atual destacada);
- comparação com o mês anterior.

O teto mensal de demonstração é **R$ 6.300,00**, até a pessoa configurar outro.

Testes cobrem receitas, despesas, saldo líquido, orçamento configurável, categorias, merge da semente com gastos locais, reconstrução de saldo sem duplicar, leitura de storage vazio ou inválido, consulta do histórico, criação de receita, o ciclo editar/excluir, o domínio de metas e o isolamento entre orçamento, receita e aportes. Exemplo: receita R$ 5.000 + gastos R$ 200 e R$ 100 → despesas R$ 300, líquido R$ 4.700. Conta principal 8.620,50 − 100,00 → 8.520,50 depois de um restart simulado.

---

## 8. Cenário de demonstração

Não há dados bancários reais. A semente reproduz o cenário visual do protótipo Compose e acompanha o **mês civil atual**, para um gasto de hoje entrar no mesmo período dos totais.

No mês corrente, as despesas da semente somam **R$ 4.320,00**. As receitas somam **R$ 8.230,00**. O disponível do orçamento começa em **R$ 1.980,00** (6.300 − 4.320).

Movimentos visíveis do mês (além de lançamentos de apoio que fecham os totais por categoria):

| Título | Categoria | Tipo |
| --- | --- | --- |
| Salário | Receita | Entrada |
| Freelance | Receita | Entrada |
| Mercado | Alimentação | Saída |
| Transporte | Transporte | Saída |
| Assinatura | Assinaturas | Saída |
| Moradia | Moradia | Saída |

Meses anteriores existem só para o gráfico. Fechar o app mantém os gastos criados no aparelho. A semente volta a ser a base; os movimentos locais são somados de novo.

Critério já validado no produto: despesas em R$ 4.320 → adicionar Mercado R$ 100 em Alimentação → despesas em R$ 4.420 nas três telas. Fechar e abrir de novo continua em R$ 4.420, sem duplicar o gasto.

---

## 9. Design system

Tokens em `src/core/design-system/theme/`. Componentes não devem usar hex direto.

### Aparência

```ts
type ThemePreference = "system" | "light" | "dark";
```

- **Sistema** segue o celular e reage se o sistema mudar com o app aberto.
- **Claro** e **Escuro** forçam o tema.
- A preferência fica em AsyncStorage (`@nivva/theme-preference`).
- A barra de status e a tab bar acompanham o tema.

O Dark Mode aprovado no celular foi extraído para `darkTheme`. O Light Mode usa fundo `#F7F8FC` e cards brancos.

### Marca

| Token | Valor |
| --- | --- |
| Primary | `#6257FF` |
| Degradê do saldo | `#6257FF` → `#3BA7F5` → `#25D2C1` |
| Receita | `#16C79A` |
| Despesa | `#F2556D` |
| Fonte | Urbanist |

No escuro, o roxo de interface fica um pouco mais claro (`#9B94FF`) para contraste. O degradê do saldo é o mesmo nos dois modos.

### Escala

- Espaço: 4, 8, 12, 16, 20, 24, 32, 40, 48
- Raio: 10, 14, 18, 22, 26
- Movimento: 150 ms, 240 ms, 360 ms
- Toque mínimo: 48

### Componentes

`NivvaWordmark`, `NivvaHomeTopBar`, `NivvaScreenHeader`, `NivvaCard`, `NivvaSectionHeader`, `NivvaAmount`, `NivvaSegmentedControl`, `NivvaMetricCard`, `NivvaInsightCard`, `NivvaTransactionItem`, `NivvaCategoryItem`, `NivvaQuickAction`, `NivvaNotice`, `NivvaGoalCard`.

---

## 10. Referência Android (Compose)

A pasta `app/` na raiz é o protótipo **0.1.0** (`com.nivva.app`). Continua útil para comparar visual e copy.

Lá a interface é 100% Compose. Os números vinham de `NivvaMockData` e não mudavam. Não há ViewModels nem API. Testes: `MoneyTest` e `NivvaNavigationTest`.

Esse código **não entra no fluxo ativo**. Não deve ser apagado enquanto for a referência de produto.

No Git, essa pasta ainda pode estar só local (não entrou no commit do app Expo).

---

## 11. Segurança e dados

- Não há tokens, senhas, API keys nem dados bancários reais no repositório.
- O JWT de desenvolvimento fica no SecureStore do aparelho, não no AsyncStorage. O secret HS256 vem de `NIVVA_JWT_SECRET_BASE64` e não entra no Git.
- Tudo que aparece na semente é demonstração.
- No modo local, transações, metas e orçamentos configurados ficam no AsyncStorage, em chaves diferentes.
- A preferência de tema é dado de interface, em outra chave, sem criptografia.

---

## 12. O que esta versão ainda não faz

Limite atual, não falha escondida:

1. O mobile persiste Transactions na API (`EXPO_PUBLIC_TRANSACTION_SOURCE=api`) ou no AsyncStorage (`local`). Em modo API, register/login JWT é obrigatório. Sem refresh token, sem logout no servidor e sem sincronização offline.
2. Metas e orçamentos configurados continuam no aparelho. Trocar de usuário no mesmo device não troca Goals/Budget. Accounts/Categories na API continuam reference data global. Sem migração automática do storage antigo.
3. Sem transferência ou pagamento. Não dá para editar a semente nem trocar receita por despesa. Receita nova usa só a categoria `income`.
4. QR, notificações e calendário de Análises são só controles visuais.
5. Cartões e Investimentos não têm conteúdo próprio.
6. Meta não movimenta conta. Sem editar ou excluir contribuição. Sem vínculo com saldo.
7. Orçamento é só o mês atual. Sem categoria, rollover, histórico de tetos na UI nem vínculo com saldo.
8. Perfil em modo API mostra nome, email e Sair. Sem foto. Em modo local, só tema.
9. O período Personalizado ainda não abre um intervalo livre.
10. O insight da Home ainda é texto fixo da semente.
11. Sem CI/CD, nuvem, biometria ou Nivva Intelligence. Access token expira em 60 minutos e pede login de novo.

---

## 13. Próximos passos naturais

Ordem que o código já permite, sem redesenhar as telas:

1. Refresh/revogação de sessão. Goals e Budgets ainda são locais. Account/Category no app ainda não leem os endpoints de referência nem pertencem ao User.
2. Dar conteúdo distinto a Cartões e Investimentos.
3. Só então sync/offline e, mais tarde, explicar os números com IA.

Regra a preservar: **o sistema calcula; a IA interpreta e explica.**

---

## 14. Backend — Nivva API

A pasta `nivva-api/` é um modular monolith (Java 21, Spring Boot 4.1.1, Maven, PostgreSQL 16, Flyway). Decisão: [`docs/adr/0003-backend-modular-monolith.md`](adr/0003-backend-modular-monolith.md).

O Expo chama esta API só para Transactions, e só quando `EXPO_PUBLIC_TRANSACTION_SOURCE=api`. Auth é JWT Bearer; o dono da Transaction vem do `sub`, nunca do JSON. Não há Goals nem Budgets no servidor. Decisões: [`docs/adr/0004-mobile-transaction-api-adapter.md`](adr/0004-mobile-transaction-api-adapter.md), [`docs/adr/0005-api-authentication-and-transaction-ownership.md`](adr/0005-api-authentication-and-transaction-ownership.md).

```text
HTTP → Spring Security (JWT) → AuthController | TransactionController
TransactionService recebe o userId autenticado
queries ownership-aware → PostgreSQL
Account e Category continuam referência pública (GET /api/v1/accounts e /categories).
```

`amountCents` é `long`. `INCOME` positivo, `EXPENSE` negativo — na aplicação e no `CHECK` do banco. IDs de transação são UUID. IDs de conta e categoria continuam `main`, `reserve`, `food`, `income`, etc. `category.kind` no backend é `EXPENSE` ou `INCOME`.

Datas: a API aceita ISO-8601 com offset; persiste o instante em `TIMESTAMPTZ`; a resposta pode sair em UTC/Z. Não se promete preservar o offset textual (`-03:00` e `Z` do mesmo instante são o mesmo fato).

Sem seed de movimentações. Health em `/actuator/health`. OpenAPI em `/api-docs`; Swagger UI em `/swagger-ui` e `/swagger-ui/index.html`. Os testes de integração sobem PostgreSQL 16 via Testcontainers, isolado do Compose local. Como executar: [`nivva-api/README.md`](../nivva-api/README.md).

---

## 15. Engenharia assistida por IA

A IA entra na discussão de alternativas e na escrita de código. A responsabilidade técnica continua humana: o domínio de metas foi revisado antes de persistir qualquer `currentAmount`; o orçamento mensal persiste só o limite por período; a API de transações valida sinal na aplicação e no banco. TypeScript cobre as regras do mobile, inclusive o mapper HTTP e o contrato do `TransactionRepository`. JUnit e Testcontainers executam as regras da API contra PostgreSQL real quando o Docker está no ar. Sem métricas inventadas e sem afirmar revisão ou teste que não aconteceu.
