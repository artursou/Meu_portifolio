import { Container, Collumn, Row, Img_Profile, Title, TopRight, BottomRight, TextGroup } from "./styles";
import { Button } from "../button";
// 1. Importe o hook
import { useTranslation } from "react-i18next";

export const Header = () => {
  // 2. Inicialize o t (tradutor) e o i18n (controle do idioma)
  const { t, i18n } = useTranslation();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Faz a rolagem suave até o elemento
      element.scrollIntoView({ behavior: "smooth" }); 
    }
  };

  return (
    <Container>
      <Row>
        <TextGroup>
          <Collumn>
            {/* 3. Troque os textos fixos por t('chave') */}
            <Title>{t("title")}</Title>
            <Row>
              <Button title={t("btn_about")} onClick={() => scrollToSection("sobre")} />
              <Button title={t("btn_projects")} onClick={() => scrollToSection("projetos")} />
            </Row>
          </Collumn>
        </TextGroup>
        <Img_Profile src="/eu.svg" alt="imagem"/>
        <Collumn>
          <TopRight>
            {/* 4. Adicione o evento de clique nas bandeiras */}
            <img 
              src="/iconBr.svg" 
              alt="Brasil" 
              onClick={() => i18n.changeLanguage('pt')} 
              style={{ cursor: "pointer" }} 
            />
            <img 
              src="/iconUSA.svg" 
              alt="USA" 
              onClick={() => i18n.changeLanguage('en')} 
              style={{ cursor: "pointer" }} 
            />
          </TopRight>
          <BottomRight>
            <img src="/git.svg" alt="imagem"/>
          </BottomRight>
        </Collumn>
      </Row>
    </Container>
  );
};