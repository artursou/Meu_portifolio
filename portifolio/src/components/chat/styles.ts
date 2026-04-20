import styled from 'styled-components';

export const ChatContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
`;

export const ChatButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  background-color: #007bff; /* Cor principal do seu site */
  color: white;
  border: none;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

export const ChatWindow = styled.div`
  width: 320px;
  height: 400px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  position: absolute;
  bottom: 70px;
  right: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  overflow: hidden;
`;

export const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #f9f9f9;
`;

// O $ antes de isUser diz ao styled-components que é uma "transient prop"
export const MessageBubble = styled.div<{ $isUser: boolean }>`
  align-self: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
  background-color: ${props => props.$isUser ? '#007bff' : '#ffffff'};
  color: ${props => props.$isUser ? '#ffffff' : '#333333'};
  border: 1px solid ${props => props.$isUser ? '#007bff' : '#e0e0e0'};
  padding: 10px 14px;
  border-radius: 12px;
  border-bottom-right-radius: ${props => props.$isUser ? '4px' : '12px'};
  border-bottom-left-radius: ${props => props.$isUser ? '12px' : '4px'};
  max-width: 85%;
  color: #000000;
  font-size: 14px;
  line-height: 1.4;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
`;

export const InputArea = styled.form`
  padding: 12px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 8px;
  background-color: #ffffff;
  color: #000000;
`;

export const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #cccccc;
  border-radius: 6px;
  outline: none;
  font-size: 14px;

  &:focus {
    border-color: #007bff;
  }
`;

export const SendButton = styled.button`
  padding: 10px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;