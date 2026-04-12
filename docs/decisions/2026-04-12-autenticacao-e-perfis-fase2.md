# Decisão: Autenticação e Perfis de Acesso — Fase 2 da SPEC

**Data:** 2026-04-12  
**Status:** Aprovada — pendente de implementação  
**Fase:** Fase 2 da SPEC (Estruturação do Portal)

---

## Contexto

O sistema atual não possui autenticação. Qualquer pessoa com acesso à URL acessa todas as rotas do portal (`/avaliador`, `/coordenacao`, `/aluno`) sem qualquer verificação de identidade ou perfil.

Com a conclusão da Fase 1 (modularização e estrutura base), a próxima frente é introduzir controle de acesso real ao portal, separando as áreas por perfil e protegendo os dados no banco.

---

## Problema

- Não existe login unificado.
- Todas as rotas do portal são abertas.
- O Supabase opera com `anon key` exposta no frontend.
- Sem RLS configurada, qualquer pessoa com a URL pode ler, inserir e deletar avaliações diretamente via API REST, sem usar o app.
- PINs dos alunos estão em `students.json`, distribuídos no bundle do frontend.
- O `avaliacoesService.js` não tem noção de usuário autenticado.

---

## Alternativas consideradas

### Alternativa A — Supabase Auth
- Login com email/senha via `supabase.auth.signInWithPassword()`.
- Tabela `profiles` com campo `role`.
- RLS no banco usando `auth.uid()` para filtrar dados por perfil.
- Proteção de rotas no frontend via contexto de autenticação.

### Alternativa B — Guard local (senha fixa)
- Senha genérica por área armazenada em sessionStorage.
- Sem mudança no Supabase.
- Segurança ilusória: não protege o banco, não diferencia perfis reais, seria descartada inteiramente ao implementar A.

### Alternativa C — Provedor externo (Clerk, Auth0)
- Dependência externa sem integração nativa com RLS do Supabase.
- Complexidade desproporcional para o estágio atual.

---

## Decisão

**Adotar Supabase Auth** como solução de autenticação do portal.

Motivos:
1. Já está disponível no stack — sem nova dependência.
2. É a única alternativa que protege os dados no banco via RLS.
3. O PRD exige "login unificado com separação de perfis" — atendimento direto.
4. A Alternativa B seria descartada integralmente ao implementar A (retrabalho puro).
5. A Alternativa C é complexidade desproporcional para este estágio.

---

## Modelo de perfis

| Perfil | Rota principal | Capacidade |
|---|---|---|
| `avaliador` | `/avaliador/*` | Lança avaliações, vê relatórios da oficina |
| `coordenacao` | `/coordenacao` | Vê dados consolidados de todas as oficinas (leitura) |
| `aluno` | `/aluno` | Vê apenas seus próprios dados |
| `admin` | Tudo | Gerencia usuários e perfis |

O perfil `admin` pode ser o mesmo usuário da coordenação na fase inicial.

---

## Estratégia de implementação

A implementação deve seguir dois passos sequenciais para minimizar risco de quebra:

### Parte 1 — Setup no Supabase (sem alterar código do app)

1. Criar tabela `profiles`:
   ```sql
   CREATE TABLE profiles (
     id UUID PRIMARY KEY REFERENCES auth.users(id),
     nome TEXT NOT NULL,
     role VARCHAR(20) NOT NULL CHECK (role IN ('avaliador', 'aluno', 'coordenacao', 'admin')),
     created_at TIMESTAMPTZ DEFAULT now()
   );
   ```

2. Habilitar provider de email no Supabase Auth (dashboard > Authentication > Providers).

3. Criar 2–3 usuários de teste manualmente (avaliador, aluno, admin).

4. Criar policies RLS na tabela `avaliacoes`:
   - `SELECT`: todos os usuários autenticados (avaliador e coordenação).
   - `INSERT`: apenas perfil `avaliador`.
   - `DELETE`: apenas perfil `admin`.
   - `SELECT` para aluno: filtrado por `nome_aluno` correspondente ao perfil.

5. Habilitar RLS na tabela `avaliacoes` **somente após** as policies estarem prontas.

> ⚠️ Habilitar RLS sem policies prontas interrompe o funcionamento do sistema.

### Parte 2 — Implementação mínima no frontend

1. Criar `src/contexts/AuthContext.jsx`:
   - estado de sessão via `supabase.auth.getSession()` + `onAuthStateChange`;
   - dados do perfil buscados em `profiles` após login;
   - funções `signIn` e `signOut`.

2. Criar componente `ProtectedRoute`:
   - verifica sessão e perfil antes de renderizar a rota;
   - redireciona para login se não autenticado ou sem permissão.

3. Criar tela de login simples (`src/pages/Login.jsx`).

4. Envolver `Router.jsx` com `AuthProvider` e proteger rotas existentes com `ProtectedRoute`.

---

## Riscos e cuidados

- Habilitar RLS sem policies prontas derruba o app imediatamente.
- A Parte 1 pode (e deve) ser testada isoladamente antes de conectar o frontend.
- O sistema continua funcionando normalmente até que a Parte 2 seja ativada.
- PINs em `students.json` continuam existindo para ciência do avaliado — isso não é autenticação e deve ser tratado separadamente no futuro.
- O modelo de RLS para o perfil `aluno` exige cuidado: o filtro por `nome_aluno` é uma aproximação inicial; no futuro, o aluno deverá ter `id` explicitamente vinculado ao seu registro de avaliações.

---

## Consequências desta decisão

- O portal passa a ter identidade real de acesso por perfil.
- Dados no banco ficam protegidos por RLS no servidor, não apenas no frontend.
- Prepara a base para a Fase 3 (modularização por oficina com acesso restrito por avaliador).
- Prepara a base para a Fase 4 (consolidação com visão exclusiva da coordenação).
- Elimina a dependência de manutenção de PINs como mecanismo de controle de acesso.

---

## Próximo passo imediato

Executar a Parte 1 no Supabase (tabela `profiles`, policies RLS, usuários de teste) antes de tocar no código do app.
