# session-policies.md

Políticas de economia de contexto para sessões de desenvolvimento assistido por IA no Portal de Avaliações de Salvamento Terrestre — CBMAP CFSD-26.

---

## Política de economia de contexto

- Use `/compact` quando a sessão continuar no mesmo fluxo e o histórico já estiver grande.
- Use `/clear` quando houver mudança real de tarefa, módulo ou assunto.
- Antes de tarefas longas ou sessões extensas, verificar `/context` e `/cost`.
- Evitar colar logs grandes; usar apenas os trechos relevantes.
- Agrupar pedidos relacionados em uma única mensagem, sempre que possível.
- Se houver 3 tentativas fracassadas no mesmo erro, parar e voltar ao diagnóstico da causa raiz.
- Priorizar contexto persistido em arquivos do projeto em vez de depender de histórico longo da conversa.
- Evitar comandos que despejem contexto desnecessário, como históricos extensos de git, salvo quando explicitamente necessário.
