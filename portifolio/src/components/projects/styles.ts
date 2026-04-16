import styled from "styled-components";

export const Container = styled.header`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 45px;
  margin: 0px;
`;

export const Collumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;



export const Title = styled.h1`
  font-size: 40px;
  margin: 20px 0;
  align-itens: center;
`

export const Projects = styled.div`
  width: 50%;
  margin: 0 30px;
`

export const ProjectsTitle = styled.h1`
  font-size: 30px;
  text-align: center;
`

export const ProjectsText = styled.p`
  text-align: center;
  margin: 10px 50px;
`

export const ProjectsImg = styled.img`
  width: 800px;
  display: block;
  margin: 0 auto;
`

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