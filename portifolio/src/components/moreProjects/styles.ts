import styled from "styled-components";

export const CarouselSection = styled.section`
  background-color: #4A4A4A; /* Cor de fundo parecida com a sua imagem */
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden; /* Importante para o carrossel não vazar a tela */
`;

export const CarouselTitle = styled.h2`
  color: white;
  font-size: 2.5rem;
  font-weight: 300;
  text-align: center;
  margin-bottom: 40px;
  font-family: monospace; /* Ajuste para a sua fonte */
`;

export const ViewAllButton = styled.button`
  background-color: #5A8CFF;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 12px 32px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 40px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #4a77e5;
  }
`;

export const SlideImage = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.5);
`;