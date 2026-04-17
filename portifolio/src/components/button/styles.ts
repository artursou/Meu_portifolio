import styled from "styled-components";

export const Container = styled.button`
  /* O background transparente é essencial para vermos o fundo deslizar atrás do texto */
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

  /* Efeito quando o mouse passa por cima do botão */
  &:hover {
    color: #ffffff;
    transform: scale(1.1);
    outline: 2px solid #70bdca;
    box-shadow: 4px 5px 17px -4px #268391;
  }

  /* O bloco colorido que vai deslizar (inicia com width: 0) */
  &::before {
    content: "";
    position: absolute;
    left: -50px;
    top: 0;
    width: 0;
    height: 100%;
    background-color: #2c9caf;
    transform: skewX(45deg); /* Dá aquele efeito inclinado na cor de fundo */
    z-index: -1; /* Garante que o fundo fique atrás do texto */
    transition: width 1000ms;
  }

  /* Quando o mouse passa por cima, o bloco invisível cresce para 250% preenchendo tudo */
  &:hover::before {
    width: 250%;
  }
`;