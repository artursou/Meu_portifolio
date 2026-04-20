'use client';

import React, { useState } from 'react';
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

export function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputTexto, setInputTexto] = useState('');
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isLimitReached = mensagens.filter(m => m.role === 'user').length >= (MAX_MESSAGES / 2);

  // 🛡️ Usamos SyntheticEvent para corrigir o erro 'FormEvent is deprecated'
  const enviarMensagem = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!inputTexto.trim() || isLoading || isLimitReached) return;

    // 1. Adiciona a sua mensagem na tela instantaneamente
    const historicoAtualizado = [...mensagens, { id: Date.now(), role: 'user', content: inputTexto }];
    setMensagens(historicoAtualizado);
    setInputTexto('');
    setIsLoading(true);

    try {
      // 2. Faz a requisição HTTP diretamente, impossível de falhar!
      const resposta = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historicoAtualizado }),
      });

      if (!resposta.body) throw new Error('Sem resposta do servidor');

      // 3. Prepara os leitores de Streaming
      const reader = resposta.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let textoDaIA = '';

      // Cria a bolha da IA vazia que será preenchida letra por letra
      setMensagens(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: '' }]);

      // 4. O laço de repetição que cria o efeito "Digitando..." na tela
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Traduz os bits que chegaram em texto legível
        textoDaIA += decoder.decode(value, { stream: true });

        // Atualiza apenas a última mensagem (a bolha da IA) com o texto novo
        setMensagens(prev => {
          const clone = [...prev];
          clone[clone.length - 1].content = textoDaIA;
          return clone;
        });
      }
    } catch (erro) {
      console.error("🔴 Erro de Conexão:", erro);
      setMensagens(prev => [...prev, { id: Date.now() + 2, role: 'assistant', content: 'Desculpe, ocorreu um erro de conexão.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContainer>
      <ChatButton onClick={() => setIsOpen(!isOpen)}>
        💬
      </ChatButton>

      {isOpen && (
        <ChatWindow>
          <MessagesArea>
            {mensagens.length === 0 && (
              <p style={{ fontSize: 14, textAlign: 'center', color: '#888', marginTop: 20 }}>
                Olá! Pergunte algo sobre as experiências profissionais e projetos do Artur.
              </p>
            )}

            {mensagens.map((m: any) => (
              <MessageBubble key={m.id} $isUser={m.role === 'user'}>
                {m.content}
              </MessageBubble>
            ))}
            
            {isLoading && (
              <MessageBubble $isUser={false} style={{ opacity: 0.7 }}>
                Digitando...
              </MessageBubble>
            )}
          </MessagesArea>

          <InputArea onSubmit={enviarMensagem}>
            <Input
              value={inputTexto}
              onChange={(e: any) => setInputTexto(e.target.value)}
              disabled={isLoading || isLimitReached}
              placeholder={isLimitReached ? "Limite atingido." : "Digite sua mensagem..."}
            />
            <SendButton 
              type="submit" 
              disabled={isLoading || isLimitReached || !inputTexto.trim()}
            >
              Enviar
            </SendButton>
          </InputArea>
        </ChatWindow>
      )}
    </ChatContainer>
  );
}