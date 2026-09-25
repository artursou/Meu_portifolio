'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import type { ChatMessage } from '@/types';
import {
  ChatContainer,
  ChatButton,
  ChatWindow,
  MessagesArea,
  MessageBubble,
  InputArea,
  Input,
  SendButton
} from './styles';

const MAX_MESSAGES = 10;
const MAX_CHARS_PER_MESSAGE = 1000;

export function Chat() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputTexto, setInputTexto] = useState('');
  const [mensagens, setMensagens] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isLimitReached = mensagens.filter(m => m.role === 'user').length >= (MAX_MESSAGES / 2);

  // 🛡️ Usamos SyntheticEvent para corrigir o erro 'FormEvent is deprecated'
  const enviarMensagem = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!inputTexto.trim() || isLoading || isLimitReached) return;

    // 1. Adiciona a sua mensagem na tela instantaneamente
    const historicoAtualizado: ChatMessage[] = [...mensagens, { id: Date.now(), role: 'user', content: inputTexto }];
    setMensagens(historicoAtualizado);
    setInputTexto('');
    setIsLoading(true);

    try {
      // 2. Faz a requisição HTTP diretamente
      const resposta = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historicoAtualizado.map(({ role, content }) => ({ role, content })) }),
      });

      if (resposta.status === 429) {
        setMensagens(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: t('chat_rate_limited') }]);
        return;
      }

      if (!resposta.ok || !resposta.body) throw new Error(`Resposta inválida do servidor (${resposta.status})`);

      // 3. Prepara os leitores de Streaming
      const reader = resposta.body.getReader();
      const decoder = new TextDecoder('utf-8');
      const idDaIA = Date.now() + 1;
      let textoDaIA = '';

      // Cria a bolha da IA vazia que será preenchida letra por letra
      setMensagens(prev => [...prev, { id: idDaIA, role: 'assistant', content: '' }]);

      // 4. O laço de repetição que cria o efeito "Digitando..." na tela
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Traduz os bits que chegaram em texto legível
        textoDaIA += decoder.decode(value, { stream: true });

        // Atualiza apenas a bolha da IA com o texto novo (sem mutar o estado anterior)
        const textoAtual = textoDaIA;
        setMensagens(prev => prev.map(m => (m.id === idDaIA ? { ...m, content: textoAtual } : m)));
      }
    } catch (erro) {
      console.error("🔴 Erro de Conexão:", erro);
      setMensagens(prev => [...prev, { id: Date.now() + 2, role: 'assistant', content: t('chat_error') }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContainer>
      <ChatButton onClick={() => setIsOpen(!isOpen)} aria-label="Chat">
        💬
      </ChatButton>

      {isOpen && (
        <ChatWindow>
          <MessagesArea>
            {mensagens.length === 0 && (
              <p style={{ fontSize: 14, textAlign: 'center', color: '#888', marginTop: 20 }}>
                {t('chat_welcome')}
              </p>
            )}

            {mensagens.map((m) => (
              <MessageBubble key={m.id} $isUser={m.role === 'user'}>
                {m.content}
              </MessageBubble>
            ))}

            {isLoading && mensagens[mensagens.length - 1]?.role === 'user' && (
              <MessageBubble $isUser={false} style={{ opacity: 0.7 }}>
                {t('chat_typing')}
              </MessageBubble>
            )}
          </MessagesArea>

          <InputArea onSubmit={enviarMensagem}>
            <Input
              value={inputTexto}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputTexto(e.target.value)}
              disabled={isLoading || isLimitReached}
              maxLength={MAX_CHARS_PER_MESSAGE}
              placeholder={isLimitReached ? t('chat_limit') : t('chat_placeholder')}
            />
            <SendButton
              type="submit"
              disabled={isLoading || isLimitReached || !inputTexto.trim()}
            >
              {t('chat_send')}
            </SendButton>
          </InputArea>
        </ChatWindow>
      )}
    </ChatContainer>
  );
}
