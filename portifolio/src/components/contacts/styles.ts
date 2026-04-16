import styled from "styled-components";

export const Container = styled.header`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #333;
  width: 100%;
  padding: 40px 0;
`;

export const Collumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center; /* Isso centraliza o Title */
  width: 100%;
  max-width: 1200px; /* Opcional: define um limite de largura */
`;

export const Title = styled.h1`
  font-size: 40px;
  color: white;
  margin-bottom: 30px;
  text-align: center;
`;

export const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Alinha os textos à esquerda */
  width: 100%; /* Garante que ele ocupe a largura para o alinhamento funcionar */
  padding-left: 20px; /* Ajuste isso para dar o recuo que você desejar da borda */
`;

export const TextContacts = styled.p`
  font-size: 20px;
  color: white;
  margin: 5px 0;
  font-family: monospace; /* Para ficar com esse estilo de código da sua imagem */
`;