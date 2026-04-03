# Guia de Atualização de Dados

## Alunos (students.json)

### Como atualizar com dados reais:

1. Abra sua planilha Excel: `PLANO DE CHAMADA_ CFSD 2026.xlsx`
2. Identifique as colunas:
   - Nome do aluno
   - Número de ordem
   - Pelotão

3. Copie os dados e formate como JSON no arquivo `src/data/students.json`:

```json
{
  "students": [
    { "nome": "João Silva", "numero": "001", "pelotao": "1º Pelotão" },
    { "nome": "Maria Santos", "numero": "002", "pelotao": "1º Pelotão" },
    { "nome": "Pedro Oliveira", "numero": "003", "pelotao": "2º Pelotão" }
  ]
}
```

### Regras:
- `nome`: Nome completo do aluno (string)
- `numero`: Número de ordem (string, use "001", "002", etc.)
- `pelotao`: Nome do pelotão (string, ex: "1º Pelotão", "2º Pelotão")

---

## Instrutores/Avaliadores (instructors.json)

### Como atualizar:

1. Identifique a lista de instrutores na sua documentação
2. Formate como array simples no arquivo `src/data/instructors.json`:

```json
{
  "instructors": [
    "Cap. QOBM Paulo Silva",
    "Ten. QOBM Maria Santos",
    "Sgt. QOBM Carlos Mendes",
    "Cb. QOBM João Pereira"
  ]
}
```

### Regras:
- Incluir posto/graduação (Capitão, Tenente, Sargento, Cabo, etc.)
- Nome completo
- Ordem alfabética é opcional mas recomendada

---

## Método Prático (Copiar/Colar)

### De Excel para JSON (Alunos):

1. No Excel, selecione as colunas: Nome | Número | Pelotão
2. Copie os dados
3. Use um editor online (ex: https://www.json2html.com/) ou:
   - Abra `students.json` no VS Code
   - Cole os dados e organize manualmente como JSON

### Exemplo rápido:

Se sua planilha tem:
```
João Silva | 001 | 1º Pelotão
Maria Santos | 002 | 1º Pelotão
```

Vira em JSON:
```json
{ "nome": "João Silva", "numero": "001", "pelotao": "1º Pelotão" },
{ "nome": "Maria Santos", "numero": "002", "pelotao": "1º Pelotão" }
```

---

## Comportamento do Sistema

### Após atualizar os dados:

- ✅ O campo "Pelotão" é um **dropdown** com os pelotões únicos
- ✅ Ao selecionar um pelotão, a lista de alunos é **filtrada automaticamente**
- ✅ Ao digitar no campo "Aluno", a busca é feita **em tempo real**
- ✅ Ao selecionar um aluno, o campo "Nº" é **preenchido automaticamente**
- ✅ O campo "Avaliador" tem **autocomplete** com busca

---

## Validação

O sistema verifica se TODOS os campos estão preenchidos antes de permitir "Iniciar Avaliação":
- ✅ Pelotão (obrigatório)
- ✅ Aluno (obrigatório)
- ✅ Nº (preenchido automaticamente)
- ✅ Data (obrigatório)
- ✅ Avaliador (obrigatório)

---

## Dúvidas?

Se precisar ajustar formato ou adicionar campos, os arquivos JSON são:
- `src/data/students.json`
- `src/data/instructors.json`

Mantenha a estrutura JSON válida para o sistema funcionar corretamente.
