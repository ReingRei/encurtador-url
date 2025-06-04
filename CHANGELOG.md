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

## [0.2.0] - Planejado - YYYY-MM-DD (Encurtador de URL)

### Adicionado (Planejado)
- **Módulo Encurtador de URL:**
    - Definição da entidade `UrlEncurtada` para armazenar URLs originais, códigos curtos, contagem de cliques e associação com `Usuario` (opcional).
    - Serviço para geração de códigos curtos únicos e alfanuméricos (máximo 6 caracteres).
    - Endpoint `POST /encurtador` para criar uma nova URL encurtada:
        - Aceita requisições de usuários autenticados e não autenticados.
        - Se o usuário estiver autenticado, a URL encurtada é associada a ele.
        - Retorna a URL encurtada completa (ex: `http://localhost/codigoCurto`).
    - Endpoint `GET /r/{codigoCurto}` para redirecionar para a URL original:
        - Incrementa a contagem de cliques da URL encurtada correspondente.
    - Para usuários autenticados (endpoints protegidos com JWT):
        - Endpoint `GET /encurtador/minhas-urls` para listar todas as URLs encurtadas pelo usuário, incluindo a contagem de cliques de cada uma.
        - Endpoint `PATCH /encurtador/{idUrlEncurtada}` para atualizar o endereço de destino (URL original) de uma URL encurtada pertencente ao usuário.
        - Endpoint `DELETE /encurtador/{idUrlEncurtada}` para excluir logicamente uma URL encurtada pertencente ao usuário.
    - Validação de entrada para DTOs (ex: para criação e atualização de URLs).
    - Documentação Swagger para todos os endpoints do módulo encurtador.
    - Testes unitários para os serviços e controllers do módulo encurtador.
- Configuração do Throttler (rate limiting) global para a aplicação `encurtador-url` de 10 requisições por minuto.

### Alterado (Planejado)
- Atualização do `DatabaseModule` para incluir a entidade `UrlEncurtada`.

### Bibliotecas Chave a Serem Utilizadas (para Encurtador)
- (A serem definidas, mas provavelmente reutilizará as existentes como `@nestjs/typeorm`, `class-validator`, `@nestjs/swagger`, `@nestjs/throttler`).
- Poderá ser necessária alguma biblioteca para geração de strings aleatórias seguras para os códigos curtos.