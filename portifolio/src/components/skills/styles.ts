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


export const TechContainer = styled.div`
  display: flex;
  justify-content: center; 
  align-items: center; 
  gap: 50px; 
  margin-top: 20px; 
  flex-wrap: wrap; 
`;


export const TechItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  margin: 5px 0 20px 0;
`;

export const ProjectsIcon = styled.img`
  width: 100px;
`;