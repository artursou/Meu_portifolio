# Configuração e validação de segurança

A proteção administrativa foi aplicada ao projeto Supabase `portifolio`
(`welhwhfideriszszjoxe`) em 30/09/2026. Migração remota registrada:
`20260930134517_portfolio_admin_permissions`. A conta existente do proprietário
foi cadastrada na lista privada de administradores.

Verificações no banco real: leitura pública preservada; escrita e autopromoção
bloqueadas para usuário comum; INSERT, UPDATE e DELETE permitidos ao
administrador nas três tabelas. Operações de teste executadas em transações
com ROLLBACK. Foram preservados 6 projetos, 10 tecnologias e 15 vínculos.
O token de gerenciamento não foi salvo no projeto.

A configuração de Redis e a publicação na Netlify continuam pendentes.
As instruções de Supabase abaixo servem para novos ambientes: não execute
a migração novamente neste projeto, pois ela já foi aplicada.

## Supabase: executar antes de publicar o novo painel

1. No SQL Editor, execute uma vez `supabase/migrations/202609300001_admin_permissions.sql`.
   A migração mantém os dados e as políticas existentes. Políticas restritivas
   impedem que políticas permissivas antigas liberem escrita para usuários comuns.
2. Em Authentication > Users, copie o UUID da sua conta e execute no SQL Editor:

```sql
insert into portfolio_private.admins (user_id)
values ('SUBSTITUA_PELO_UUID_DA_SUA_CONTA'::uuid)
on conflict do nothing;
```

A lista é privada, não editável pela API pública. Não use user_metadata como
autorização. O painel consulta a mesma função usada pelas políticas do banco.
Sem a migração ou sem cadastro na lista, o novo painel nega acesso.

As tabelas projects, technologies e project_technologies têm leitura pública,
como exige o portfólio. Não coloque dados privados nessas tabelas. Políticas
restritivas de leitura existentes continuam valendo. Funções SECURITY DEFINER,
views, outros esquemas e regras configuradas remotamente precisam de revisão
no projeto real. Se houver IDs gerados por sequences, confira os grants das
sequences já existentes: a migração não os amplia.

## Netlify: chat

Mantenha as variáveis atuais de Supabase e GEMINI_API_KEY. Configure também,
no escopo das Functions (e no ambiente local apenas se necessário):

- CHAT_PLATFORM=netlify (somente na Netlify real).
- UPSTASH_REDIS_REST_URL: URL HTTPS do banco Redis.
- UPSTASH_REDIS_REST_TOKEN: token do mesmo banco, com permissão para EVAL,
  GET, INCR, EXPIRE e TTL. Nunca use prefixo NEXT_PUBLIC.

O contador atômico compartilhado permite 20 solicitações por IP em uma janela
de uma hora iniciada no primeiro uso e 200 solicitações totais em uma janela
de 24 horas. IPs desconhecidos compartilham uma cota. Esse teto limita chamadas,
não é garantia de valor monetário: mantenha também limites no provedor Gemini.

Em produção, falta ou falha do Redis resulta em HTTP 503 e nenhuma chamada à IA.
Em desenvolvimento/teste, sem Redis, há contador local apenas para testes.
Portanto, configurar Redis é obrigatório para disponibilizar o novo chat.

A função netlify/edge-functions/chat-guard.js adiciona limite de rajada de
5 requisições por minuto por IP/domínio. Configure a base do projeto Netlify
para esta pasta portifolio, com build npm run build e publicação .next.
Verifique no log de pós-processamento do deploy que a regra foi reconhecida.
A Netlify pode levar até 10 segundos para aplicar bloqueios de rajada;
o Redis faz a verificação síncrona das cotas antes de chamar o Gemini.

A aplicação ignora x-forwarded-for e x-real-ip. Só usa
x-nf-client-connection-ip quando CHAT_PLATFORM=netlify ou NETLIFY=true.
Não configure essa opção num servidor que aceite esse cabeçalho sem substituí-lo.

A API lê no máximo 128 KiB, mesmo sem Content-Length, e limita o tempo de leitura
a 10 segundos. Mensagens do visitante têm no máximo 1.000 caracteres e respostas
da IA reenviadas no histórico, 4.000; são aceitas até 10.
Campos extras são rejeitados. O Gemini tem 800 tokens de saída, sem retries
automáticos, com cancelamento após 30 segundos ou desconexão.

## Limpeza de políticas antigas e cabeçalhos

`supabase/migrations/202610010002_cleanup_legacy_policies.sql` (aplicada em
01/10/2026 no projeto real) remove as políticas anteriores à lista de admins
("Policy with security definer functions", que liberava escrita a qualquer
usuário logado, e as leituras duplicadas search/Search_tecs/Search_tecs2) e fixa
o search_path de update_updated_at_column. O acesso foi verificado antes e
depois, sem mudança: leitura pública, escrita só do administrador.

O site_url do Supabase Auth aponta para https://arturport.netlify.app.

`next.config.ts` envia em todas as rotas: CSP com frame-ancestors 'none',
base-uri, object-src e form-action restritos; X-Frame-Options DENY (contra
clickjacking no /admin); Referrer-Policy; Permissions-Policy; e remove o
X-Powered-By. A CSP não restringe scripts: isso exigiria nonce e renderização
dinâmica de todas as páginas.

Alertas do Supabase aceitos: is_portfolio_admin é executável por usuários
logados (o painel precisa dela; só responde sobre o próprio usuário) e
portfolio_private.admins não tem políticas (ninguém acessa pela API).

## Contador de visitas (aba Visitas do admin)

1. No SQL Editor do Supabase, execute uma vez
   `supabase/migrations/202610010001_site_visits.sql` (depende da migração de
   admin acima). Ela pode ser executada de novo sem efeito colateral.
2. Na Netlify, adicione `SUPABASE_SERVICE_ROLE_KEY` (Supabase > Project Settings >
   API Keys: a chave secreta / service_role), com escopo Functions e marcada como
   secret. Nunca use prefixo NEXT_PUBLIC: essa chave ignora o RLS.

O banco guarda apenas data e hora de cada visita, sem prazo de exclusão.
Nenhum IP, navegador ou localização é gravado. Para contar cada visitante uma
vez por dia (fuso de Palmas, UTC-3), o servidor guarda no Redis um HMAC do IP,
com o token do Redis como chave, que expira sozinho em 48 horas.

A tabela site_visits não aceita leitura nem escrita pela API pública: só o
administrador lê (mesma função is_portfolio_admin) e só o servidor grava, via
função record_site_visit, executável apenas por service_role. A rota /api/track
recusa requisições sem Origin do próprio site, tem limite de rajada de 10 por
minuto (netlify/edge-functions/track-guard.js) e, em produção, não grava nada
sem Redis. Visitas do administrador logado e das páginas /admin e /login não
são contadas. Pessoas na mesma rede (mesmo IP) contam como um visitante por dia.

## Verificação

Use Node.js 24. Execute:

```sh
npm ci
npm run test:security
npm run lint
npx tsc --noEmit
npm run build
npm audit
```

Os testes usam PostgreSQL em memória para validar RLS e simulam o Redis e
o Gemini, sem chaves reais, gravações remotas ou custos de IA.
Para compilar, configure as duas variáveis públicas do Supabase. Valores de
teste podem servir para uma compilação local, mas não devem ser publicados.

Após configurar os serviços e publicar, confira anon/leitura, usuário comum
sem escrita e administrador com escrita; confira também respostas 413, 429,
503 com Redis indisponível e uma conversa normal. Isso não foi validado em
produção pelos testes locais.

Referências:
- https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://upstash.com/docs/redis/features/restapi
