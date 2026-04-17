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
  background-color: transparent; /* O fundo transparente é essencial para o efeito [cite: 321] */
  padding: 1em 2em;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  letter-spacing: 5px;
  text-transform: uppercase;
  cursor: pointer;
  color: #2c9caf; /* Cor principal do texto e borda [cite: 312] */
  transition: all 1000ms;
  font-size: 15px;
  position: relative;
  overflow: hidden;
  outline: 2px solid #2c9caf;
  margin-top: 40px; /* Mantido do seu código original para o espaçamento */

  /* Efeito quando o mouse passa por cima [cite: 313] */
  &:hover {
    color: #ffffff;
    transform: scale(1.1);
    outline: 2px solid #70bdca;
    box-shadow: 4px 5px 17px -4px #268391; /* [cite: 314] */
  }

  /* O bloco de cor escondido que vai deslizar [cite: 315] */
  &::before {
    content: "";
    position: absolute;
    left: -50px;
    top: 0;
    width: 0;
    height: 100%;
    background-color: #2c9caf;
    transform: skewX(45deg); 
    z-index: -1; 
    transition: width 1000ms; /* [cite: 316] */
  }

  /* Faz o bloco crescer no hover [cite: 316] */
  &:hover::before {
    width: 250%;
  }
`;

export const SlideImage = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.5);
`;