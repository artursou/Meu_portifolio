import styled from 'styled-components';

// 1. O Container Pai
export const AboutContainer = styled.section`
  position: relative; 
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 60px 20px; /* Aumentei um pouco o padding para dar respiro */
  background-color: #333; 
  overflow: hidden; 
`;

export const CentralTextWrapper = styled.div`
  max-width: 600px;
  text-align: center;
  color: white;
  z-index: 2; /* Garante que o texto fique por cima dos ícones, caso se cruzem */
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 0 10px;
  }
`;

interface IconProps {
  $top?: string;
  $bottom?: string;
  $left?: string;
  $right?: string;
}

export const FloatingIcon = styled.img<IconProps>`
  position: absolute;
  width: 70px;
  z-index: 1;

  top: ${props => props.$top || 'auto'};
  bottom: ${props => props.$bottom || 'auto'};
  left: ${props => props.$left || 'auto'};
  right: ${props => props.$right || 'auto'};

  /* 👇 Responsividade dos Ícones 👇 */
  @media (max-width: 768px) {
    width: 45px; /* Diminui o tamanho dos ícones */
    opacity: 0.2; /* Deixa transparente para não atrapalhar a leitura do texto */
  }
`;

export const Title = styled.h1`
  font-size: 40px;
  margin: 20px 0;
  align-items: center; /* Corrigido de align-itens para align-items */

  /* 👇 Responsividade do Título 👇 */
  @media (max-width: 768px) {
    font-size: 32px;
  }
`;

export const TextAboutMe = styled.p`
  font-size: 25px;
  line-height: 1.5; /* Adicionado para melhorar a leitura */

  /* 👇 Responsividade do Texto 👇 */
  @media (max-width: 768px) {
    font-size: 18px; /* Fonte menor para telas pequenas */
  }
`;