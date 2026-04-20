import styled from "styled-components";

export const CarouselSection = styled.section`
  background-color: #4A4A4A;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;

  /* 👇 Controle do Swiper via CSS em vez de inline no TSX 👇 */
  .swiper-slide {
    width: 600px; /* Mantém os 600px no computador */
    
    @media (max-width: 768px) {
      width: 85%; /* No celular, o slide ocupa quase a tela toda, deixando uma pontinha do próximo slide visível */
    }
  }

  /* Ajusta os botões de navegação (setas) do Swiper no celular, pois costumam sobrepor a imagem */
  @media (max-width: 768px) {
    .swiper-button-next, .swiper-button-prev {
      display: none; /* Esconde as setinhas no celular, o usuário pode apenas arrastar com o dedo */
    }
  }
`;

export const CarouselTitle = styled.h2`
  color: white;
  font-size: 2.5rem;
  font-weight: 300;
  text-align: center;
  margin-bottom: 40px;
  font-family: monospace;

  /* 👇 Responsividade do Título */
  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 20px;
  }
`;

export const SlideImage = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.5);

  /* 👇 Diminui a altura da imagem no celular para não ocupar a tela toda verticalmente */
  @media (max-width: 768px) {
    height: 250px;
  }
`;

export const ViewAllButton = styled.button`
  background-color: transparent;
  padding: 1em 2em;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  letter-spacing: 5px;
  text-transform: uppercase;
  cursor: pointer;
  color: #2c9caf;
  transition: all 1000ms;
  font-size: 15px;
  position: relative;
  overflow: hidden;
  outline: 2px solid #2c9caf;
  margin-top: 40px;

  /* Efeito Hover original mantido */
  &:hover {
    color: #ffffff;
    transform: scale(1.1);
    outline: 2px solid #70bdca;
    box-shadow: 4px 5px 17px -4px #268391;
  }

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
    transition: width 1000ms;
  }

  &:hover::before {
    width: 250%;
  }

  /* 👇 No celular, o botão fica um pouco mais compacto */
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 0.8em 1.5em;
    letter-spacing: 2px;
  }
`;