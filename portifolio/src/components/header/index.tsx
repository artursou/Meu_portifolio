import { Container, Collumn, Row, Img, Title,TopRight } from "./styles";
import { Button } from "../button";

export const Header = () => {
  return (
      <Row>
        <Collumn>
          <Title>Engenharia, automação e ideias que viram soluções reais.</Title>
          <Row>
            <Button title="Sobre" />
            <Button title="Projetos" />
          </Row>
        </Collumn>
        <img src="/eu.svg" alt="imagem"/>
        <Collumn>
          <TopRight>
            <Img src="/iconBr.svg" alt="Brasil" />
            <Img src="/iconUSA.svg" alt="USA" />
          </TopRight>
            <Img src="/git.svg" alt="imagem"/>
        </Collumn>
      </Row>
  );
};