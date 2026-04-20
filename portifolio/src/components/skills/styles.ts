import styled from "styled-components";

export const Container = styled.header`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px; /* Adicionado um respiro geral na seção */

  @media (max-width: 768px) {
    padding: 30px 15px;
  }
`;

export const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 45px;
  margin: 0px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;

export const Collumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

export const Title = styled.h1`
  font-size: 40px;
  margin: 20px 0;
  align-items: center; /* Corrigido de align-itens */
  text-align: center;

  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

export const TechContainer = styled.div`
  display: flex;
  justify-content: center; 
  align-items: center; 
  gap: 50px; 
  margin-top: 20px; 
  flex-wrap: wrap; /* Isso já ajuda muito, ele quebra a linha sozinho! */

  /* 👇 No celular, diminuímos o espaço entre os ícones para caberem mais por linha */
  @media (max-width: 768px) {
    gap: 25px; 
  }
`;

export const TechItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  margin: 5px 0 20px 0;

  @media (max-width: 768px) {
    margin: 0px 0 10px 0; /* Diminui a margem inferior para o grid ficar mais compacto */
  }
`;

export const ProjectsIcon = styled.img`
  width: 100px;

  /* 👇 Ícones menores no celular para o layout ficar harmonioso */
  @media (max-width: 768px) {
    width: 60px; 
  }
`;