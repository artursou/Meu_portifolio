import styled from "styled-components";

export const Container = styled.header`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
`;

export const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 45px;
  margin: 0px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    padding-top: 60px; /* Espaço para as bandeiras não cobrirem o texto */
  }
`;

export const Collumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Img_Profile = styled.img`
  margin-left: 100px; /* Seu original */

  @media (max-width: 768px) {
    margin-left: 0;
    width: 180px; /* Foto menor e controlada no celular */
    order: -1; /* Joga a foto para cima do texto no celular, se preferir */
  }
`;

export const TopRight = styled.div`
  position: absolute;
  top: 20px;
  right: 40px;
  display: flex;
  gap: 12px;
  align-items: center;
`;

export const BottomRight = styled.div`
  position: absolute;
  bottom: 20px;
  right: 40px;
  display: flex;
  gap: 12px;
  align-items: center;

  @media (max-width: 768px) {
    position: relative;
    right: auto;
    bottom: auto;
    margin-top: 20px;
  }
`;

export const Title = styled.h1`
  font-size: 40px;
  width: 900px; /* Seu original */
  height: 200px; /* Seu original */
  text-align: center;

  @media (max-width: 768px) {
    width: 100%; 
    height: auto;
    font-size: 26px;
    padding: 0 15px;
  }
`;

export const TextGroup = styled.div`
  margin-left: 200px; /* Seu original intocado no PC */

  @media (max-width: 1024px) {
    margin-left: 50px; /* Ajuste para tablets/laptops pequenos */
  }

  @media (max-width: 768px) {
    margin-left: 0; /* Centraliza no celular */
  }
`;