# Nivva Mobile

**Seu dinheiro. Mais claro.**

Aplicativo de finanças pessoais em React Native. Esta pasta é a versão mobile nova. O app Android em Kotlin e Jetpack Compose continua na raiz do repositório e segue como referência visual.

Nesta fase a interface usa dados de demonstração. Não há login, API, banco nem dados financeiros reais.

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

O túnel pode pedir a instalação de um utilitário na primeira vez. Ele continua abrindo no Expo Go.

## O que já dá para ver

- Início: saldo, métricas, insight e transações recentes
- Análises: período, gráfico, orçamento e categorias
- Carteira: contas, ações rápidas e histórico
- Metas e Perfil: telas de preparação

**Adicionar gasto** já funciona: Home ou Carteira → formulário → o total de despesas, o orçamento e o histórico atualizam na hora. Os dados ficam só na sessão. Transferir, QR e notificações ainda não abrem outro fluxo.

## Aparência

Em **Perfil**, escolha Sistema, Claro ou Escuro. A preferência fica salva no aparelho e muda o app na hora. Sistema acompanha o modo do celular.

## Dinheiro

Valores de demonstração ficam em centavos (`Money.cents`). A formatação usa `pt-BR` e `BRL`. Quando o backend existir, ele será a fonte dos cálculos. O app só exibe.

## Próximas fases

Ainda não entram neste app: API Spring Boot, autenticação, push, biometria, câmera para QR, Open Finance e Nivva Intelligence. Recursos que exigirem Development Build ficam para depois, para o Expo Go continuar funcionando.
