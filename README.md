# Encurtador de URL - API REST (Monorepo NestJS)

## Descrição do Projeto

Este projeto implementa uma API REST para encurtar URLs, concebida para atender aos requisitos de um desafio técnico. O sistema permite a transformação de URLs longas em versões curtas, otimizadas para partilha e memorização. Funcionalidades de gestão são disponibilizadas para utilizadores autenticados, e todas as interações com os links encurtados são devidamente registadas para análise de métricas.

Desenvolvido em Node.js com o framework NestJS, o projeto adota uma arquitetura de monorepo para modularidade e organização. Utiliza PostgreSQL como sistema de gestão de base de dados e Docker/Docker Compose para containerização e orquestração do ambiente, assegurando facilidade de configuração e portabilidade.

## Índice

- [Descrição do Projeto](#descrição-do-projeto)
- [Índice](#índice)
- [1. Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
  - [1.1. Componentes Principais](#11-componentes-principais)
- [2. Funcionalidades Implementadas](#2-funcionalidades-implementadas)
- [3. Tecnologias Utilizadas](#3-tecnologias-utilizadas)
- [4. Pré-requisitos de Ambiente](#4-pré-requisitos-de-ambiente)
- [5. Configuração do Ambiente de Desenvolvimento Local](#5-configuração-do-ambiente-de-desenvolvimento-local)
  - [5.1. Clonar o Repositório](#51-clonar-o-repositório)
  - [5.2. Configurar Variáveis de Ambiente (`.env`)](#52-configurar-variáveis-de-ambiente-env)
- [6. Execução do Projeto com Docker Compose](#6-execução-do-projeto-com-docker-compose)
  - [6.1. Construir Imagens e Iniciar Serviços](#61-construir-imagens-e-iniciar-serviços)
  - [6.2. Acesso às Aplicações](#62-acesso-às-aplicações)
  - [6.3. Documentação Interativa da API (Swagger UI)](#63-documentação-interativa-da-api-swagger-ui)
  - [6.4. Parar os Serviços](#64-parar-os-serviços)
  - [6.5. Visualizar Logs dos Contentores](#65-visualizar-logs-dos-contentores)
- [7. Estrutura Detalhada do Projeto](#7-estrutura-detalhada-do-projeto)
- [8. Scripts NPM Essenciais](#8-scripts-npm-essenciais)
- [9. Versão do Node.js Suportada](#9-versão-do-nodejs-suportada)
- [10. Estratégia de Testes](#10-estratégia-de-testes)
  - [10.1. Testes Unitários](#101-testes-unitários)
- [11. Integração Contínua (CI) com GitHub Actions](#11-integração-contínua-ci-com-github-actions)
- [12. Observabilidade e Monitorização](#12-observabilidade-e-monitorização)
- [13. Sugestões para Evolução e Funcionalidades Futuras](#13-sugestões-para-evolução-e-funcionalidades-futuras)
- [14. Contacto](#14-contacto)

---

## 1. Visão Geral da Arquitetura

O sistema foi desenhado como um monorepo NestJS, centralizando o desenvolvimento e facilitando a partilha de código entre os diferentes módulos da aplicação.

### 1.1. Componentes Principais

- **`autenticacao-app`**: Serviço dedicado à gestão de identidades. Responsável pelo registo de novos utilizadores e pela autenticação via JSON Web Tokens (JWT), assegurando o acesso seguro às funcionalidades protegidas da plataforma.
- **`encurtador-url-app`**: Núcleo funcional do sistema. Este serviço expõe os endpoints para a criação de URLs encurtadas, tanto para utilizadores anónimos como para utilizadores autenticados. Para estes últimos, providencia funcionalidades de listagem, edição do URL de destino e exclusão (lógica) dos seus links.
- **`redirecionar-app`**: Serviço otimizado para alta performance e baixo tempo de resposta. É responsável por receber os pedidos direcionados às URLs encurtadas, realizar a consulta eficiente da URL original, contabilizar o acesso em tempo real e efetuar o redirecionamento para o destino final.

A interação com a base de dados PostgreSQL é abstraída pelo TypeORM, um ORM robusto para TypeScript.

## 2. Funcionalidades Implementadas

- **Gestão de Utilizadores:**
  - Registo de novos utilizadores com credenciais seguras.
  - Autenticação de utilizadores existentes via e-mail e palavra-passe, com retorno de um Bearer Token (JWT) para acesso às rotas protegidas.
- **Encurtamento de URLs:**
  - Endpoint unificado para submissão de URLs longas.
  - Suporte para pedidos de utilizadores anónimos e autenticados.
  - Geração de um alias curto (máximo de 6 caracteres) e único para cada URL.
  - Associação do URL encurtado ao utilizador, caso este esteja autenticado durante a criação.
- **Gestão de Links Encurtados (para utilizadores autenticados):**
  - Listagem paginada dos seus URLs encurtados.
  - Visualização da contagem de cliques para cada URL listado.
  - Edição do URL de destino associado a um URL encurtado existente.
  - Exclusão lógica de URLs encurtadas (os registos são marcados como inativos, mas preservados na base de dados para integridade referencial e auditoria).
- **Redirecionamento e Métricas:**
  - Endpoint de alta performance que recebe o alias do URL encurtado.
  - Redirecionamento eficiente para o URL de origem correspondente.
  - Contabilização individual de cada acesso aos URLs encurtados.
- **Qualidade e Robustez:**
  - Validação rigorosa de todos os dados de entrada (payloads, parâmetros de query, path params) utilizando class-validator.
  - Gestão de erros centralizada e respostas de erro padronizadas e informativas.
  - Registo de timestamps (`createdAt`, `updatedAt`, `deletedAt`) para todas as entidades principais, permitindo auditoria e rastreabilidade.

## 3. Tecnologias Utilizadas

- **Node.js (v22.x):** Ambiente de execução JavaScript assíncrono e orientado a eventos.
- **NestJS:** Framework Node.js progressivo, construído com e para TypeScript, para o desenvolvimento de aplicações backend eficientes, confiáveis e escaláveis.
- **TypeScript:** Superset de JavaScript que adiciona tipagem estática opcional, melhorando a qualidade do código, a manutenibilidade e a experiência de desenvolvimento.
- **PostgreSQL (v15):** Sistema de gestão de base de dados objeto-relacional de código aberto, reconhecido pela sua robustez e conformidade com os padrões SQL.
- **Docker & Docker Compose:** Plataforma e ferramentas para desenvolvimento, deployment e execução de aplicações em contentores isolados, garantindo consistência entre diferentes ambientes.
- **TypeORM:** Object-Relational Mapper (ORM) para TypeScript e JavaScript, que facilita a interação com bases de dados relacionais usando paradigmas de programação orientada a objetos.
- **Swagger (OpenAPI 3.0):** Especificação e conjunto de ferramentas para desenhar, construir, documentar e consumir APIs RESTful de forma padronizada e interativa.
- **JSON Web Tokens (JWT):** Standard aberto (RFC 7519) para a criação de tokens de acesso compactos e auto-contidos, utilizados para autenticação e autorização.
- **ESLint & Prettier:** Ferramentas para análise estática de código (linting) e formatação automática, essenciais para manter a qualidade, consistência e legibilidade do código.
- **Jest:** Framework de testes JavaScript com foco na simplicidade, amplamente utilizado para testes unitários e de integração em aplicações Node.js e TypeScript.
- **GitHub Actions:** Plataforma de integração contínua e entrega contínua (CI/CD) nativa do GitHub, utilizada para automatizar workflows de build, teste e linting.

## 4. Pré-requisitos de Ambiente

Para configurar e executar este projeto localmente, certifique-se de que os seguintes componentes de software estão instalados e configurados corretamente na sua máquina:

- **Docker Engine:** Recomenda-se a versão estável mais recente. ([Guia de Instalação](https://docs.docker.com/engine/install/))
- **Docker Compose:** Normalmente incluído nas instalações do Docker Desktop para Windows e macOS. Para Linux, pode ser necessário instalar separadamente. ([Guia de Instalação](https://docs.docker.com/compose/install/))
- **Git:** Sistema de controle de versões distribuído. ([Página de Downloads](https://git-scm.com/downloads))
- **Node.js e NPM:** Embora o projeto corra em contentores Docker, ter o Node.js (v22.x recomendada) e NPM instalados localmente pode ser útil para gestão de dependências ou execução de scripts fora do Docker.
- **Editor de Código:** Um editor com bom suporte para TypeScript, como o Visual Studio Code.
- **Cliente de API:** Uma ferramenta para interagir com os endpoints da API, como Postman, Insomnia ou `curl`.

## 5. Configuração do Ambiente de Desenvolvimento Local

Siga estes passos para preparar o projeto para execução na sua máquina:

### 5.1. Clonar o Repositório

Utilize o Git para clonar o repositório do projeto para a sua máquina local:

```bash
git clone [https://github.com/ReingRei/encurtador-url.git](https://github.com/ReingRei/encurtador-url.git)
cd encurtador-url
```

### 5.2. Configurar Variáveis de Ambiente (`.env`)

As configurações específicas do ambiente (credenciais da base de dados, segredos JWT, portas da aplicação, etc.) são geridas através de um ficheiro `.env`.

1.  Na raiz do projeto clonado, crie um ficheiro com o nome `.env`.
2.  Pode usar o ficheiro `.env.example` como modelo, copiando o seu conteúdo para o novo ficheiro `.env`. Caso contrário, utilize o exemplo abaixo.
3.  Preencha as variáveis no seu ficheiro `.env` com os valores adequados para o seu ambiente de desenvolvimento. Este ficheiro **não deve ser versionado** no Git.

**Exemplo de Conteúdo Essencial para o Ficheiro `.env`:**

```env
# === Configurações da Base de Dados PostgreSQL ===
DB_HOST=postgres_db                 # Nome do serviço Docker para o PostgreSQL (manter para Docker Compose)
DB_PORT=5432                        # Porta interna do PostgreSQL no contentor
DB_USERNAME=seu_usuario_pg          # Defina o utilizador para o PostgreSQL
DB_PASSWORD=sua_senha_segura_pg     # Defina uma palavra-passe robusta para o utilizador do PostgreSQL
DB_DATABASE=db_encurtador_dev       # Nome da base de dados a ser criada/utilizada
DB_HOST_PORT=5432                   # Porta no seu PC (localhost) para ligação externa ao PostgreSQL (opcional, para clientes de BD)

# === Configurações das Aplicações NestJS ===
NODE_ENV=development                # Ambiente de execução ('development' ou 'production')

# Portas de acesso no HOST (seu PC) para cada aplicação
PORT_AUTENTICACAO=3001
PORT_ENCURTADOR=3002
PORT_REDIRECIONAR=3003

# URLs base (usadas para referência interna ou construção de URLs completas)
APP_BASE_URL_ENCURTADOR=http://localhost:${PORT_ENCURTADOR}
APP_BASE_URL_REDIRECIONAR=http://localhost:${PORT_REDIRECIONAR}

# === Configurações de Segurança (JWT) ===
JWT_SECRET=GERAR_UM_SEGREDO_FORTE_E_UNICO_PARA_ASSINATURA_JWT_AQUI
JWT_EXPIRATION_TIME=1h              # Tempo de validade dos tokens JWT (ex: 1h, 3600s, 7d)

```

## 6. Execução do Projeto com Docker Compose

O Docker Compose é a ferramenta recomendada para orquestrar todos os serviços necessários para o funcionamento completo da aplicação em ambiente de desenvolvimento.

### 6.1. Construir Imagens e Iniciar Serviços

Navegue até ao diretório raiz do projeto no seu terminal e execute o comando:

```bash
docker-compose up --build -d
```

- A flag `--build` instrui o Docker Compose a construir (ou reconstruir) as imagens Docker para cada serviço, conforme definido no `Dockerfile` e no `docker-compose.yml`. Isto é necessário na primeira execução ou sempre que houver alterações no `Dockerfile`, `package.json`, ou outros ficheiros copiados durante o build.
- A flag `-d` (detached mode) executa os contentores em segundo plano, libertando o seu terminal.

Se as imagens já estiverem construídas e atualizadas, pode omitir `--build` para um arranque mais rápido:

```bash
docker-compose up -d
```

Aguarde alguns instantes para que todos os contentores iniciem e os serviços, especialmente a base de dados, estejam completamente operacionais.

### 6.2. Acesso às Aplicações

Com os contentores em execução, as APIs das diferentes aplicações estarão acessíveis através do seu `localhost` nas portas configuradas no ficheiro `.env`:

- **API de Autenticação:** `http://localhost:${PORT_AUTENTICACAO}` (Ex: `http://localhost:3001`)
- **API do Encurtador de URL:** `http://localhost:${PORT_ENCURTADOR}` (Ex: `http://localhost:3002`)
- **API de Redirecionamento:** `http://localhost:${PORT_REDIRECIONAR}` (Ex: `http://localhost:3003`)

### 6.3. Documentação Interativa da API (Swagger UI)

Cada aplicação NestJS expõe a sua documentação de API através do Swagger UI, que permite explorar os endpoints disponíveis, ver os seus parâmetros, payloads esperados e respostas, além de permitir testar os endpoints diretamente no navegador.

Assumindo que o caminho padrão `/api` foi usado na configuração do Swagger em cada `main.ts`:

- **Documentação - Autenticação:** `http://localhost:${PORT_AUTENTICACAO}/api`
- **Documentação - Encurtador de URL:** `http://localhost:${PORT_ENCURTADOR}/api`
- **Documentação - Redirecionamento:** `http://localhost:${PORT_REDIRECIONAR}/api`

### 6.4. Parar os Serviços

Para parar todos os contentores que foram iniciados pelo `docker-compose up`:

```bash
docker-compose down
```

Este comando para e remove os contentores, mas os volumes (como o da base de dados) são preservados por defeito.

Se desejar parar os contentores e também **remover os volumes associados** (o que resultará na **perda de todos os dados** na base de dados PostgreSQL do Docker), use:

```bash
docker-compose down -v
```

### 6.5. Visualizar Logs dos Contentores

Para acompanhar os logs de todos os serviços em tempo real (útil para depuração):

```bash
docker-compose logs -f
```

Para visualizar os logs de um serviço específico (por exemplo, `autenticacao-app`):

```bash
docker-compose logs -f autenticacao-app
```

Substitua `autenticacao-app` pelo nome do serviço desejado (ex: `encurtador-url-app`, `redirecionar-app`, `postgres_db`). Pressione `Ctrl+C` para parar de seguir os logs.

## 7. Estrutura Detalhada do Projeto

O projeto adota uma estrutura de monorepo padrão do NestJS, promovendo organização e modularidade:

```plaintext
.
├── .github/                # Configurações para GitHub Actions (CI/CD workflows)
│   └── workflows/
│       └── ci.yml          # Exemplo de workflow para lint, testes, etc.
├── apps/                   # Diretório contendo as aplicações NestJS individuais
│   ├── autenticacao/       # Aplicação de gestão de identidade e autenticação
│   │   ├── src/            # Código fonte (controllers, services, modules, DTOs, main.ts)
│   │   └── test/           # Testes (unitários, e2e) específicos da aplicação
│   ├── encurtador-url/     # Aplicação principal para encurtamento e gestão de URLs
│   │   ├── src/
│   │   └── test/
│   └── redirecionar/       # Aplicação para redirecionamento e contabilização de cliques
│       ├── src/
│       └── test/
├── dist/                   # Diretório de saída do build (código JavaScript transpilado)
├── libs/                   # Bibliotecas ou módulos partilhados entre as aplicações (opcional)
│   └── common/             # Exemplo de uma biblioteca partilhada (ex: DTOs comuns, utilitários)
│       └── src/
├── node_modules/           # Dependências do projeto (geridas pelo NPM)
├── .env                    # Ficheiro de variáveis de ambiente (local, NÃO versionado)
├── .env.example            # Ficheiro de exemplo para variáveis de ambiente
├── .gitattributes          # Definições de atributos do Git
├── .gitignore              # Especifica ficheiros e pastas a serem ignorados pelo Git
├── .prettierrc.json        # Configuração do Prettier para formatação de código
├── CHANGELOG.md            # Registo manual de alterações entre versões (se mantido)
├── docker-compose.yml      # Definição e orquestração dos serviços Docker
├── Dockerfile              # Instruções para construir a imagem Docker para as aplicações NestJS
├── eslint.config.mjs       # Configuração do ESLint para análise estática de código (ou .eslintrc.js)
├── jest.config.ts          # Configuração global do Jest para testes
├── nest-cli.json           # Configuração específica do NestJS CLI para o monorepo
├── package-lock.json       # Regista as versões exatas das dependências instaladas
├── package.json            # Metadados do projeto, lista de dependências e scripts NPM
├── README.md               # Este ficheiro de documentação
└── tsconfig.json           # Configuração raiz do compilador TypeScript
```

## 8. Scripts NPM Essenciais

O ficheiro `package.json` na raiz do projeto define vários scripts úteis, executáveis com `npm run <nome-do-script>`:

- `build`: Transpila todo o código TypeScript das `apps` e `libs` para JavaScript, geralmente para a pasta `dist/`.
- `format`: Formata automaticamente todo o código do projeto de acordo com as regras definidas no Prettier.
- `lint`: Executa o ESLint para analisar o código em busca de potenciais erros, problemas de estilo e más práticas.
- `test`: Executa todos os conjuntos de testes unitários definidos no projeto.
- `test:watch`: Executa os testes unitários em modo interativo "watch", re-executando-os automaticamente sempre que um ficheiro de código ou teste é alterado.
- `test:cov`: Executa os testes unitários e gera um relatório de cobertura de código, mostrando que percentagem do código está coberta por testes.
- `start:dev:<nome-da-app>`: Inicia a aplicação especificada (`autenticacao`, `encurtador-url`, `redirecionar`) em modo de desenvolvimento, com hot-reloading habilitado. Estes são os comandos utilizados pelo `docker-compose.yml`.
  - Ex: `npm run start:dev:autenticacao`

Consulte o `package.json` para a lista completa e atualizada de scripts.

## 9. Versão do Node.js Suportada

Este projeto foi desenvolvido e testado primariamente utilizando **Node.js v22.x**. A imagem Docker base especificada no `Dockerfile` (`node:22-alpine`) reflete esta preferência.
Para garantir a compatibilidade e evitar problemas inesperados, recomenda-se a utilização da versão 22.x do Node.js ou a LTS (Long Term Support) mais recente, caso necessite executar o projeto ou os seus scripts fora do ambiente Docker. Ferramentas como o [NVM (Node Version Manager)](https://github.com/nvm-sh/nvm) são excelentes para gerir múltiplas versões do Node.js na sua máquina de desenvolvimento.

## 10. Estratégia de Testes

### 10.1. Testes Unitários

O projeto emprega [Jest](https://jestjs.io/) como framework para a escrita e execução de testes unitários. O principal objetivo dos testes unitários é validar o comportamento de pequenas unidades de código (como funções, métodos de classes, e serviços) de forma isolada, garantindo a sua correção e fiabilidade.

- **Comando de Execução:** `npm run test`
- **Execução em Modo Watch:** `npm run test:watch`
- **Relatório de Cobertura:** `npm run test:cov`
- **Localização dos Testes:** Os ficheiros de teste (com a extensão `*.spec.ts`) estão geralmente localizados próximos aos ficheiros de código que testam, frequentemente dentro de uma pasta `test` na estrutura de cada aplicação ou biblioteca, ou seguindo convenções específicas do NestJS.

## 11. Integração Contínua (CI) com GitHub Actions

O repositório está configurado com um workflow de Integração Contínua (CI) através do GitHub Actions. Este workflow (definido em `.github/workflows/ci.yml` ou similar) é acionado automaticamente em eventos chave do ciclo de desenvolvimento, como `push` para branches específicas (ex: `main`, `develop`) e na criação ou atualização de `pull requests`.

As etapas automatizadas pelo workflow de CI tipicamente incluem:

1.  **Checkout do Código:** Obtenção da versão mais recente do código do branch relevante.
2.  **Setup do Ambiente Node.js:** Configuração da versão correta do Node.js para execução dos passos seguintes.
3.  **Instalação de Dependências:** Utilização de `npm ci` para instalar as dependências de forma determinística, baseada no `package-lock.json`.
4.  **Análise Estática (Linting):** Execução de `npm run lint` para verificar a conformidade do código com as regras de estilo e qualidade definidas.
5.  **Execução de Testes:** Execução de `npm run test` para validar que todas as funcionalidades testadas continuam a operar corretamente.

A CI ajuda a garantir a qualidade do código, a deteção precoce de erros e regressões, e a manutenção de um código base saudável.

## 12. Observabilidade e Monitorização

No contexto do ambiente de desenvolvimento fornecido, a observabilidade é alcançada através de:

- **Logging Detalhado:** As aplicações NestJS são configuradas para emitir logs informativos para o `stdout` (saída padrão) e `stderr` (saída de erro padrão). Estes logs são automaticamente capturados pelo Docker e podem ser inspecionados através dos comandos do Docker Compose. Os logs incluem informações sobre o ciclo de vida da aplicação, pedidos HTTP recebidos (se o logging de pedidos estiver ativo), erros ocorridos, e interações com a base de dados.
- **Logging do TypeORM (Configurável):** A interação com a base de dados PostgreSQL pode ser detalhadamente monitorizada através da funcionalidade de logging do TypeORM. Esta é controlada pela variável de ambiente `TYPEORM_LOGGING` no ficheiro `.env`.
  - Valores comuns:
    - `TYPEORM_LOGGING=false`: Desabilita o logging do TypeORM (recomendado para produção, exceto para erros).
    - `TYPEORM_LOGGING=error`: Regista apenas erros relacionados com a base de dados.
    - `TYPEORM_LOGGING=query`: Regista todas as queries SQL executadas.
    - `TYPEORM_LOGGING=query,error`: Regista queries e erros.

Para ambientes de produção, seria imperativo expandir estas capacidades com soluções dedicadas de monitorização de performance de aplicações (APM), agregação centralizada de logs, e visualização de métricas.

## 13. Sugestões para Evolução e Funcionalidades Futuras

- **URLs Curtas Personalizadas (Vanity URLs):** Permitir que utilizadores autenticados especifiquem um alias personalizado para os seus links encurtados (ex: `http://meudominio.com/meu-link-custom`).
- **Proteção de Links por Palavra-passe:** Implementar uma opção para adicionar uma camada de segurança a URLs encurtadas, exigindo uma palavra-passe para aceder ao destino.
- **Definição de Data de Expiração para Links:** Permitir que os utilizadores configurem os seus links para expirarem automaticamente após um determinado período ou numa data específica.
- **Análises Detalhadas de Cliques (Analytics):** Fornecer aos utilizadores um dashboard com estatísticas mais ricas sobre os acessos aos seus links, como origem geográfica dos cliques (país/cidade), referrers (de onde vêm os utilizadores), tipo de dispositivo, browser, e evolução temporal dos cliques.
- **Interface Gráfica de Utilizador (Frontend):** Desenvolver uma aplicação web (ex: React, Vue.js, Angular) para proporcionar uma experiência de utilizador mais intuitiva e completa para interagir com a API.
- **Notificações via Webhooks:** Implementar um sistema de webhooks para notificar sistemas externos ou utilizadores sobre eventos específicos (ex: um URL atingiu um determinado número de cliques, um novo link foi criado).
- **Pré-visualização Segura de URLs de Destino:** Antes do redirecionamento, oferecer uma página intermédia que mostre o URL de destino e um aviso sobre potenciais riscos (phishing, malware), especialmente para URLs submetidas por utilizadores anónimos.
- **Suporte para Múltiplos Domínios de Encurtamento:** Permitir que a plataforma use diferentes domínios curtos.

## 14. Contacto

**Reinaldo Zenealto**

- **Email:** [rzenelato@gmail.com](mailto:rzenelato@gmail.com)
- **LinkedIn:** [https://www.linkedin.com/in/reinaldo-zenelato-bb5754200/](https://www.linkedin.com/in/reinaldo-zenelato-bb5754200/)
- **GitHub:** [https://github.com/ReingRei](https://github.com/ReingRei)

**Link do Repositório do Projeto:** [https://github.com/ReingRei/encurtador-url](https://github.com/ReingRei/encurtador-url) (Substitua pelo link do seu projeto)
