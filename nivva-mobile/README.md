# Nivva Mobile

**Seu dinheiro. Mais claro.**

Aplicativo de finanças pessoais em React Native. Esta pasta é a versão mobile nova. O app Android em Kotlin e Jetpack Compose continua na raiz do repositório e segue como referência visual.

A semente de demonstração existe só no modo `local`. No modo `api`, register/login é obrigatório, o access token vai para o SecureStore e Accounts, Transactions e Goals vêm do servidor. Orçamento continua no aparelho; no modo API a chave é por User UUID. Goals locais antigas (`@nivva/goals:user:<USER_ID>:v1`) não são lidas nem migradas.

## Stack

```text
React Native
Expo
TypeScript
Expo Router
```

Compatível com **Expo Go**. Não há módulos nativos fora do que o Expo Go já inclui.

## Executar

Na pasta `nivva-mobile`:

```bash
npm install
npx expo login
npx expo start --go
```

O Expo Go desta versão só abre o projeto se a mesma conta estiver logada no computador e no celular. Use uma conta sua, gratuita, em [expo.dev](https://expo.dev). Não use a conta de outra pessoa.

## Testar no Android

1. Instale o **Expo Go** no celular.
2. Deixe o computador e o celular na mesma rede Wi-Fi.
3. No computador, entre com a sua conta: `npx expo login`.
4. No celular, abra o Expo Go, vá em perfil e entre com a mesma conta.
5. Execute `npx expo start --go`.
6. Escaneie o QR Code.

Se a rede local não conectar, use o túnel:

```bash
npx expo start --tunnel
```

O túnel pode pedir a instalação de um utilitário na primeira vez. Ele continua abrindo no Expo Go. O túnel do Expo entrega o JavaScript; **não** torna `localhost:8080` do computador acessível no celular.

## Transaction data source

| Valor | Fonte |
| --- | --- |
| `local` (default) | AsyncStorage: transações, contas demo, `@nivva/goals:v1` |
| `api` | JWT + PostgreSQL: Accounts, Transactions e Goals |

Copie `.env.example` para `.env` (não commitado):

```bash
EXPO_PUBLIC_TRANSACTION_SOURCE=local
EXPO_PUBLIC_NIVVA_API_BASE_URL=http://YOUR_COMPUTER_LAN_IP:8080
```

No celular físico, `localhost` é o aparelho. Use o IPv4 LAN da máquina que roda a API. Confirme antes no navegador do celular: `http://<LAN-IP>:8080/actuator/health`. Reinicie o Metro depois de mudar o env (`npx expo start --go --clear`).

Trocar `api` → `local` pode reaparecer transações antigas do AsyncStorage. Isso não é sync. Modo API ignora essa chave e não a apaga.

## O que já dá para ver

- Início: saldo, métricas, insight e transações recentes
- Análises: período, gráfico, orçamento configurável e categorias
- Carteira: contas, ações rápidas e histórico
- Metas: criar objetivo, registrar progresso, editar e excluir
- Perfil: tema; em modo API, nome, email e Sair
- Login/Register: só no modo `api`

**Adicionar gasto** já funciona: Home (Despesa) ou Carteira → formulário → o total de despesas, o orçamento e o histórico atualizam na hora.

**Adicionar receita**: Home → Adicionar → Receita. O saldo e as receitas sobem; as despesas e o “Ainda posso gastar” não mudam.

Os movimentos criados no aparelho sobrevivem ao fechar e abrir o app.

**Histórico completo**: Home → Ver todas, ou a busca da Carteira. Dá para pesquisar, filtrar, abrir o detalhe, editar e excluir lançamentos criados no aparelho. A semente de demonstração é só leitura. Transferir, QR e notificações ainda não abrem outro fluxo.

O AsyncStorage guarda transações (`@nivva/finance/transactions:v1`), metas (`@nivva/goals:v1`) e orçamentos configurados (`@nivva/budgets:v1`). A semente e o teto de demonstração de R$ 6.300 não são gravados só por abrir o app. Totais, gasto do orçamento e saldos efetivos são recalculados.

Para limpar os gastos locais durante o desenvolvimento, no console de debug do app:

```js
await clearLocalFinanceData()
```

Depois recarregue o Nivva. Isso não é "apagar conta".

## Aparência

Em **Perfil**, escolha Sistema, Claro ou Escuro. A preferência fica salva no aparelho e muda o app na hora. Sistema acompanha o modo do celular.

## Dinheiro

Valores de demonstração ficam em centavos (`Money.cents`). A formatação usa `pt-BR` e `BRL`. Quando o backend existir, ele será a fonte dos cálculos. O app só exibe.

## Próximas fases

Ainda não entram neste app: API Spring Boot, autenticação, push, biometria, câmera para QR, Open Finance e Nivva Intelligence. Recursos que exigirem Development Build ficam para depois, para o Expo Go continuar funcionando.
