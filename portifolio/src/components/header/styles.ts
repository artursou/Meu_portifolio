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
`;

export const Collumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Img_Profile = styled.img`
  margin-left: 100px;
`

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
`;

export const Title = styled.h1`
  font-size: 40px;
  width: 900px;
  height: 200px;
  text-align: center;
`

export const TextGroup = styled.div`
  margin-left: 200px;
`