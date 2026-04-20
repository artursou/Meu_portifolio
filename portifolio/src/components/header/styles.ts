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

  /* Só muda no celular */
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    padding: 100px 20px 40px; /* Espaço para não bater nas bandeiras */
  }
`;

export const Collumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Img_Profile = styled.img`
  margin-left: 100px;

  @media (max-width: 768px) {
    margin-left: 0;
    max-width: 200px; /* Diminui a foto no celular */
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
    position: relative; /* No celular ele flutua junto com o conteúdo */
    right: auto;
    bottom: auto;
    margin-top: 20px;
  }
`;

export const Title = styled.h1`
  font-size: 40px;
  width: 900px; /* Mantido seu original */
  height: 200px; /* Mantido seu original */
  text-align: center;

  @media (max-width: 768px) {
    width: 100%; /* No celular ocupa a tela toda */
    height: auto;
    font-size: 28px;
    padding: 0 10px;
  }
`;

export const TextGroup = styled.div`
  margin-left: 200px; /* Mantido seu original */

  @media (max-width: 768px) {
    margin-left: 0; /* Centraliza no celular */
  }
`;