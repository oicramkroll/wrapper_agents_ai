# wrapper_agents_ai

CLI wrapper para ajudar no onboarding de projetos com `.codex` e retomada de interacoes anteriores.

## Objetivo

O comando `str-codex` verifica se o diretorio atual ja possui uma pasta `.codex`, cria a estrutura inicial quando necessario e oferece um fluxo simples para:

- continuar uma interacao registrada em `.codex/interactions`
- iniciar uma nova conversa no projeto
- solicitar e persistir a `OPENAI_API_KEY` do usuario fora do repositorio

Quando o usuario escolhe uma interacao existente, o wrapper chama o `codex` com um prompt que referencia diretamente o arquivo selecionado.

## Autenticacao

No primeiro uso sem credenciais disponiveis, o wrapper solicita a `OPENAI_API_KEY` e a persiste como variavel de ambiente do usuario.

- o segredo nao e salvo dentro de `.codex`
- o segredo nao e salvo no repositorio
- no Windows, a variavel e gravada no escopo `User`

Para rastrear o consumo corretamente no painel da OpenAI, a recomendacao e informar uma API key criada no projeto certo da plataforma.

## Uso local

```bash
node ./src/cli.js
```

## Instalacao global futura

O pacote ja expoe o binario:

```bash
str-codex
```

Para publicar no npm depois, ainda faltara definir metadados finais do pacote e validar a experiencia em um ambiente com `codex` instalado no `PATH`.
