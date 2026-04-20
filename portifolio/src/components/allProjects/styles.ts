import styled from "styled-components";

export const Container = styled.div` 
  width: 100%;
  min-height: 100vh;
  background-color: #000;
  color: #fff;
  padding: 40px 0; 
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  overflow-x: hidden; 
`;

export const Header = styled.header`
  width: 100%;
  padding: 0 40px; 
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 80px;

  /* 👇 Reduz o espaçamento nas bordas e margem inferior no celular */
  @media (max-width: 768px) {
    padding: 0 20px;
    margin-bottom: 40px;
  }
`;

export const FlagsRow = styled.div`
  display: flex;
  gap: 15px;

  @media (max-width: 768px) {
    gap: 10px; /* Aproxima um pouco as bandeiras */
  }
`;

export const Title = styled.h1`
  font-size: 32px;
  font-weight: normal;
  letter-spacing: 2px;

  /* 👇 Diminui o título no celular para não espremer as bandeiras e o botão de voltar */
  @media (max-width: 768px) {
    font-size: 20px;
    text-align: center;
    letter-spacing: 1px;
  }
`;

export const ProjectsWrapper = styled.div`
  width: 100%;
  padding: 0 40px; 
  display: flex;
  flex-direction: column;
  gap: 100px; 

  /* 👇 Reduz as margens laterais e aproxima os projetos no celular */
  @media (max-width: 768px) {
    padding: 0 15px;
    gap: 50px; 
  }
`;

export const ProjectCard = styled.div<{ $isEven: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 60px;
  width: 100%;
  background-color: ${(props) => (props.$isEven ? '#000' : '#333')};
  padding: 40px; 
  border-radius: 16px;

  /* Seu código original para Tablets (900px) */
  @media (max-width: 900px) {
    flex-direction: column;
    padding: 20px;
  }

  /* 👇 Refinamento extra para celulares (768px) */
  @media (max-width: 768px) {
    gap: 30px; /* Reduz o espaço entre a foto e a descrição quando empilhados */
  }
`;

export const ProjectLeft = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;

  /* Centraliza no celular */
  @media (max-width: 768px) {
    align-items: center;
    text-align: center;
  }
`;

export const ProjectRight = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;

  @media (max-width: 768px) {
    gap: 25px; /* Reduz o buraco entre o texto e as tecnologias */
  }
`;

export const ProjectsTitle = styled.h2`
  font-size: 30px;
  font-weight: normal;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

export const ProjectsImg = styled.img`
  width: 100%;
  max-width: 800px;
  border-radius: 8px;
`;

export const ProjectsText = styled.p`
  font-size: 16px;
  font-family: monospace;
  line-height: 1.6;
  
  &.description {
    text-align: center;
    max-width: 800px;
  }

  /* 👇 Fonte um pouquinho menor para leitura confortável no celular */
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

export const TechContainer = styled.div`
  display: flex;
  gap: 30px;
  justify-content: center;
  flex-wrap: wrap; 

  /* 👇 Reduz o espaço entre os ícones para caberem de forma harmônica */
  @media (max-width: 768px) {
    gap: 15px;
  }
`;

export const TechItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ProjectsIcon = styled.img`
  width: 50px;
  height: 50px;
  object-fit: contain;

  /* 👇 Ícones de tecnologias levemente menores no celular */
  @media (max-width: 768px) {
    width: 35px;
    height: 35px;
  }
`;