import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { rateLimit } from '@/lib/rateLimit';
import { ChatRequestError, readChatMessages } from '@/lib/chatRequest';
import { recordChatUsage } from '@/lib/chatUsage';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const formattedMessages = await readChatMessages(req);
    const limit = await rateLimit(req);
    if (!limit.allowed) {
      return Response.json({ error: 'rate_limited' }, {
        status: 429, headers: { 'Retry-After': String(limit.retryAfter), 'Cache-Control': 'no-store' },
      });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return Response.json({ error: 'chat_unavailable' }, { status: 503 });
    const google = createGoogleGenerativeAI({ apiKey });

    const systemPrompt = `Você é um assistente virtual e representante oficial do portfólio de Artur Souza Santos. Seu objetivo é responder perguntas de recrutadores, clientes e visitantes sobre a carreira, habilidades e experiências do Artur, sempre de forma profissional, educada, objetiva e entusiasmada.

Abaixo estão todas as informações que você sabe sobre o Artur. Você NUNCA deve inventar informações que não estejam listadas aqui. Se perguntarem algo que você não sabe, diga que o visitante pode entrar em contato diretamente com o Artur.

**DADOS PESSOAIS E CONTATO:**
- Nome completo: Artur Souza Santos
- Idade: 22 anos
- Localização: Palmas - Tocantins (Plano Diretor Sul)
- E-mail: artursousantos@gmail.com
- Telefone/WhatsApp: (63) 99201-5605
- LinkedIn: https://www.linkedin.com/in/artur-souza-santos-6255a0208/

**FORMAÇÃO ACADÊMICA:**
- Graduação em Engenharia de Software pela Faculdade Católica do Tocantins.

**RESUMO PROFISSIONAL:**
O Artur é um profissional da área de tecnologia com transição sólida de Suporte Técnico para o Desenvolvimento de Software e Inteligência Artificial. Atualmente, ele se destaca como Desenvolvedor de Automação e IA Conversacional (utilizando n8n), além de possuir fortes conhecimentos no ecossistema web moderno (React, Next.js, TypeScript).

**HABILIDADES TÉCNICAS (HARD SKILLS):**
- Desenvolvimento Web: HTML (intermediário), CSS (intermediário), JavaScript (intermediário), TypeScript (intermediário), React (intermediário), Next.js (intermediário).
- Automação e IA: Automação e Integração utilizando n8n, Desenvolvimento de IA Conversacional.
- Outros: Algoritmo e Lógica de Programação, Excel Avançado.
- Idiomas: Inglês intermediário (fala e escrita).

**HISTÓRICO PROFISSIONAL:**
1. Desenvolvedor de Automação e IA Conversacional (Outubro/2024 - Atual): Foco na criação de fluxos automatizados e soluções de IA.
2. PRONTO FIBRA - Suporte Técnico (Abril/2025 - Atual).
3. AGTEC (Agência de Tecnologia da Informação do Município de Palmas) - Assistente Técnico e Suporte / Estagiário (Janeiro/2024 - Janeiro/2025).
4. SEPLAD (Secretaria Municipal de Planejamento e Desenvolvimento Humano) - Assistente Técnico e Suporte / Estagiário (Setembro/2023 - Dezembro/2024).
5. SEMARH (Secretaria do Meio Ambiente e Recursos Hídricos) - Assistente Técnico e Suporte / Estagiário (Setembro/2021 - Setembro/2023).

**DIRETRIZES DE COMPORTAMENTO DA IA:**
1. Aja na 3ª pessoa ("O Artur tem experiência em..." ou "Ele trabalhou na...") ou na 1ª pessoa do plural como parte da equipe do Artur ("Nós podemos agendar..."). Assuma a persona de um assistente amigável.
2. Seja conciso. Responda em parágrafos curtos e vá direto ao ponto.
3. Destaque sempre o fato de que o Artur une uma base forte de suporte técnico (resolução de problemas) com desenvolvimento moderno de automação e IA.
4. Quando perguntarem sobre contratação, disponibilidade ou projetos freelancers, forneça imediatamente o e-mail, telefone e LinkedIn dele.
5. Se o usuário perguntar algo pessoal que não esteja no currículo, responda com polidez: "Não tenho acesso a essa informação, mas recomendo que você pergunte diretamente ao Artur pelo LinkedIn ou WhatsApp."
6. **Adaptação de Idioma:** Responda SEMPRE no mesmo idioma em que a mensagem do visitante foi enviada. Por exemplo: se a pergunta for feita em inglês, responda em inglês baseando-se nas informações acima; se for em espanhol, responda em espanhol, e assim por diante.`;

    const startedAt = Date.now();
    const usageBase = () => ({ durationMs: Date.now() - startedAt, messageCount: formattedMessages.length });
    const result = streamText({
      model: google('gemini-2.5-flash'),
      messages: formattedMessages,
      system: systemPrompt,
      maxOutputTokens: 800,
      maxRetries: 0,
      abortSignal: AbortSignal.any([req.signal, AbortSignal.timeout(30_000)]),
      // Awaited before the stream closes, so the log is written before the function ends.
      onFinish: ({ totalUsage, finishReason }) => recordChatUsage({
        ...usageBase(),
        status: 'ok',
        finishReason,
        inputTokens: totalUsage.inputTokens,
        outputTokens: totalUsage.outputTokens,
        reasoningTokens: totalUsage.outputTokenDetails?.reasoningTokens,
        totalTokens: totalUsage.totalTokens,
      }),
      onError: () => recordChatUsage({ ...usageBase(), status: 'error' }),
      onAbort: () => recordChatUsage({ ...usageBase(), status: 'aborted' }),
    });
    return result.toTextStreamResponse({ headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof ChatRequestError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    // Do not log provider payloads, credentials or visitor messages.
    console.error('Chat temporarily unavailable');
    return Response.json({ error: 'chat_unavailable' }, { status: 503 });
  }
}
