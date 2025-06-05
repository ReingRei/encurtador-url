# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não Lançado]

### Adicionado

- (Próximas funcionalidades para a release 0.2.0 - Encurtador de URL)

---

## [0.1.0] - 2025-06-04

### Adicionado

- **Módulo de Autenticação de Usuários Completo:**
  - Cadastro de usuários com nome, e-mail e senha.
    - Utiliza `bcrypt` para hashing seguro de senhas (via `GerenciadorDeSenhaService`).
  - Login de usuários com e-mail e senha.
    - Geração de Bearer Token JWT no login bem-sucedido.
  - Validação de tokens JWT para proteção de rotas futuras.
    - Implementação de `JwtStrategy` utilizando `@nestjs/passport` e `passport-jwt`.
  - Validação de dados de entrada (DTOs) para registro e login utilizando `class-validator`.
  - Respostas padronizadas para operações (ex: `MensagemRespostaDto`).
  - Proteção contra ataques de força bruta e abuso com `@nestjs/throttler` (rate limiting global para a aplicação de autenticação).
  - Documentação completa da API de autenticação utilizando Swagger (`@nestjs/swagger`).
  - Testes unitários abrangentes para serviços (`AutenticacaoService`, `GerenciadorDeSenhaService`) e controllers (`AutenticacaoController`) do módulo de autenticação.

### Bibliotecas Chave Utilizadas (para Autenticação)

- `@nestjs/jwt` para geração e manipulação de JSON Web Tokens.
- `@nestjs/passport`, `passport`, `passport-jwt` para implementação da estratégia de autenticação JWT.
- `bcrypt` para hashing de senhas.
- `class-validator`, `class-transformer` para validação de DTOs.
- `@nestjs/throttler` para controle de taxa de requisições.
- `@nestjs/swagger` para documentação da API.

---

## [Configuração Inicial do Projeto] - 2025-06-03

### Adicionado

- Estrutura inicial do projeto utilizando NestJS Workspace.
  - Aplicação `autenticacao` (`apps/autenticacao`).
  - Aplicação `encurtador-url` (`apps/encurtador-url`).
  - Biblioteca `core-config` (`libs/core-config`) para gerenciamento centralizado de configurações e variáveis de ambiente (`.env`).
  - Biblioteca `database` (`libs/database`) para configuração do TypeORM, conexão com PostgreSQL e definição de entidades (ex: `UsuarioEntity`).
  - Biblioteca `common` (`libs/common`) para DTOs, interfaces e enums genéricos compartilhados.
- Configuração do TypeORM para PostgreSQL.
- Entidade `Usuario` inicial com campos para nome, e-mail, senha e timestamps (`dataCriacao`, `dataAtualizacao`, `dataExclusao` para soft delete).
- Configuração do `ValidationPipe` global para validação automática de DTOs.
- Configuração básica do Docker Compose (`docker-compose.yml`) para ambiente de desenvolvimento com PostgreSQL, incluindo criação automática do banco de dados.
- Configuração do pipeline de CI/CD com GitHub Actions (`.github/workflows/ci.yml`) para execução automática de lint e testes unitários.
- Criação do arquivo `README.md` inicial com instruções de configuração, execução do projeto e tecnologias utilizadas.
- Criação deste arquivo `CHANGELOG.md` para versionamento de alterações.
- Configuração do Jest (`jest.config`, `jest.setup.js`) para ambiente de teste, incluindo silenciamento de logs de console durante os testes.

---

## [0.2.0] - 2025-06-04 (Encurtador de URL - Funcionalidade de Criação)

### Adicionado

- **Módulo Encurtador de URL (Funcionalidade de Criação):**
  - Definição da entidade `UrlEncurtadaEntity` para armazenar URLs originais, códigos curtos e associação opcional com `UsuarioEntity`.
  - Serviço `GeradorDeCodigoService` para criação de códigos curtos únicos alfanuméricos (máximo 6 caracteres) utilizando `nanoid`, com lógica de verificação de unicidade e múltiplas tentativas.
  - Serviço `EncurtadorUrlService` com a lógica para criar URLs encurtadas:
    - Inclui verificação para reutilizar uma URL encurtada se a mesma URL original já foi processada (para pedidos anónimos).
    - Constrói a `urlEncurtadaCompleta` que aponta para a futura aplicação de redirecionamento (configurável via `APP_BASE_URL_REDIRECIONAR` no `.env`).
  - Endpoint `POST /api/encurtador` na aplicação `encurtador-url` para receber uma URL original e criar a sua versão encurtada.
    - Suporta requisições anónimas nesta fase (o `usuarioId` é opcional no serviço).
  - DTOs (`EncurtarUrlDto` para entrada, `UrlEncurtadaRespostaDto` para saída) com validações (`class-validator`) e documentação (`@nestjs/swagger`).
  - Documentação Swagger detalhada para o endpoint de criação de URL.
  - Testes unitários para `EncurtadorUrlService` e `GeradorDeCodigoService`, cobrindo os cenários de criação e reutilização de URLs.
  - Testes unitários para `EncurtadorUrlController` para o endpoint de criação.

* Configuração do `ThrottlerModule` global para a aplicação `encurtador-url` com um limite de 10 requisições por minuto por IP.
* Atualização da entidade `UsuarioEntity` (se necessário para o relacionamento, embora o foco aqui seja anónimo).

## [0.3.0] - 2025-06-05 (Operações do Encurtador para Usuários Autenticados)

### Adicionado

- **Operações de Gerenciamento de URLs para Usuários Autenticados no Módulo Encurtador:**
  - Endpoint `GET /api/encurtador/minhas-urls` para listar todas as URLs encurtadas pelo usuário autenticado, com suporte a paginação (parâmetros `pagina` e `limite`).
    - Retorna `MinhasUrlsPaginadasRespostaDto` com os dados e meta informações da paginação.
  - Endpoint `PATCH /api/encurtador/:idUrl` para o usuário autenticado atualizar o endereço de destino (URL original) de uma URL encurtada que lhe pertence.
    - Utiliza `AtualizarUrlDto` para os dados de entrada.
    - Retorna `UrlEncurtadaDetalhesDto` com os dados atualizados.
  - Endpoint `DELETE /api/encurtador/:idUrl` para o usuário autenticado excluir logicamente uma URL encurtada que lhe pertence.
    - Retorna `MensagemRespostaDto` confirmando a exclusão.
  - Todos os endpoints acima são protegidos com `AuthGuard('jwt')` e requerem um Bearer Token JWT válido.
  - Lógica no `EncurtadorUrlService` ajustada para receber e associar o `usuarioId` ao criar uma URL encurtada se o usuário estiver autenticado (através do `OptionalAuthGuard` no endpoint de criação).
  - Criação do `GerenciadorMinhasUrlsService` para encapsular a lógica de negócio específica das operações de URLs de usuários autenticados.
  - DTOs adicionais (`ListarMinhasUrlsQueryDto`, `MinhasUrlsPaginadasRespostaDto`, `AtualizarUrlDto`) e reutilização do `UrlEncurtadaDetalhesDto` para tipagem e validação.
  - Documentação Swagger atualizada para os novos endpoints e requisitos de autenticação (`@ApiBearerAuth`, `@ApiQuery`, `@ApiParam`, etc.).
  - Testes unitários para os novos métodos no `GerenciadorMinhasUrlsService` e para os novos endpoints no `EncurtadorUrlController`.

### Alterado

- O endpoint POST /api/encurtador agora utiliza OptionalAuthGuard para permitir tanto requisições anônimas quanto autenticadas, associando a URL ao usuarioId se um token válido for fornecido.

## [0.4.0] - 2025-06-06 (Módulo de Redirecionamento de URL)

### Adicionado

- **Módulo de Redirecionamento de URL (redirecionar):**
  - Implementada a funcionalidade completa para redirecionar códigos curtos para suas URLs originais.
  - Configurada a rota `GET /api/r/:codigoCurto` no `RedirecionarController` para receber as requisições de redirecionamento.
  - Desenvolvida a lógica no `RedirecionarService` para:
    - Validar o formato do código curto.
    - Buscar a URL original correspondente ao código curto no banco de dados.
    - Incrementar o contador de cliques para a URL encontrada.
    - Redirecionar o usuário para a URL original.
    - Tratar casos de URLs não encontradas ou códigos inválidos.
  - Adicionados testes unitários abrangentes para `RedirecionarController` e `RedirecionarService`, cobrindo os principais fluxos e cenários de erro.
