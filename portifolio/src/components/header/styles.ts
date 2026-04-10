import styled from "styled-components";

export const Container = styled.header`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  margin: 0px;
`;

export const Collumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Img = styled.img`

`

export const TopRight = styled.div`
  position: absolute;
  top: 20px;
  right: 40px;
  display: flex;
  gap: 12px;
  align-items: center;
`;

export const Title = styled.h1`
  font-size: 40px;
  width: 900px;
  height: 200px;
  text-align: center;
`