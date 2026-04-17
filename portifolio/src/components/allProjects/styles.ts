import styled from "styled-components";

export const Container = styled.div` /* ou styled.section */
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
`;

export const FlagsRow = styled.div`
  display: flex;
  gap: 15px;
`;

export const Title = styled.h1`
  font-size: 32px;
  font-weight: normal;
  letter-spacing: 2px;
`;

export const ProjectsWrapper = styled.div`
  width: 100%;
  padding: 0 40px; 
  display: flex;
  flex-direction: column;
  gap: 100px; 
`;

/* Adicionada a interface de tipo para o $isEven no TypeScript */
export const ProjectCard = styled.div<{ $isEven: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 60px;
  width: 100%;
  
  /* Lógica das cores intercaladas com base na prop */
  background-color: ${(props) => (props.$isEven ? '#000' : '#333')};
  
  padding: 40px; 
  border-radius: 16px;

  /* Responsividade: Empilha numa única coluna em ecrãs mais pequenos */
  @media (max-width: 900px) {
    flex-direction: column;
    padding: 20px;
  }
`;

export const ProjectLeft = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const ProjectRight = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
`;

export const ProjectsTitle = styled.h2`
  font-size: 30px;
  font-weight: normal;
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
`;

export const TechContainer = styled.div`
  display: flex;
  gap: 30px;
  justify-content: center;
  flex-wrap: wrap; 
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
`;