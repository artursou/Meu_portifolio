import styled from "styled-components";

export const Container = styled.header`
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    padding: 40px 0; /* Dá um respiro no topo e na base no celular */
  }
`;

export const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 45px;
  margin: 0px;

  /* 👇 Só afeta o celular: empilha os projetos */
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 60px; /* Dá um espaço maior entre um projeto e outro */
  }
`;

export const Collumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%; /* Garante que ocupe todo o espaço disponível */
  }
`;

export const Title = styled.h1`
  font-size: 40px;
  margin: 20px 0;
  align-items: center; /* Corrigido de align-itens */

  @media (max-width: 768px) {
    font-size: 32px;
    text-align: center;
  }
`;

export const Projects = styled.div`
  width: 50%;
  margin: 0 30px;

  /* 👇 No celular, o projeto ocupa a largura toda e remove as margens gigantes */
  @media (max-width: 768px) {
    width: 100%;
    margin: 0;
    padding: 0 20px;
    box-sizing: border-box; /* Impede que o padding vaze a tela */
  }
`;

export const ProjectsTitle = styled.h1`
  font-size: 30px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 26px;
  }
`;

export const ProjectsText = styled.p`
  text-align: center;
  margin: 10px 50px;

  /* 👇 Reduz as margens laterais no celular para o texto não ficar espremido */
  @media (max-width: 768px) {
    margin: 10px 10px;
  }
`;

export const ProjectsImg = styled.img`
  width: 800px;
  display: block;
  margin: 0 auto;
  border-radius: 8px; /* Opcional: Adicionei um arredondamento leve, se quiser pode tirar */

  /* 👇 Impede que a imagem de 800px quebre telas menores que ela (Tablets e Celulares) */
  @media (max-width: 1024px) {
    max-width: 100%;
    width: 100%;
    height: auto; /* Mantém a proporção da imagem sem esticar */
  }
`;

export const TechContainer = styled.div`
  display: flex;
  justify-content: center; 
  align-items: center; 
  gap: 16px; 
  margin-top: 20px; 
  flex-wrap: wrap; 
`;

export const TechItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

export const ProjectsIcon = styled.img`
  width: 40px;
`;