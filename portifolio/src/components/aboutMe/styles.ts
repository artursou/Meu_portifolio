import styled from 'styled-components';

// 1. O Container Pai
export const AboutContainer = styled.section`
  position: relative; 
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px 20px;
  background-color: #333; 
  overflow: hidden; 
`;


export const CentralTextWrapper = styled.div`
  max-width: 600px;
  text-align: center;
  color: white;
  z-index: 2; /* Garante que o texto fique por cima dos ícones, caso se cruzem */
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

`;

export const Title = styled.h1`
  font-size: 40px;
  margin: 20px 0;
  align-itens: center;
`

export const TextAboutMe = styled.p`
  font-size: 25px;
`