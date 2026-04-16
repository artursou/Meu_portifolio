import { AboutContainer, CentralTextWrapper, FloatingIcon, Title, TextAboutMe } from './styles';

import { useTranslation } from "react-i18next"; // 1. Importe o hook

  

export const AboutMe = () => {
  const { t } = useTranslation();
  return (
    <AboutContainer id="sobre">
      
      <FloatingIcon 
        src="/react.svg" 
        alt="React Logo" 
        $top="10%" 
        $left="5%" 
      />

      <FloatingIcon 
        src="/next.svg" 
        alt="Next Logo" 
        $top="20%" 
        $right="15%" 
      />

      <FloatingIcon 
        src="/ts.svg" 
        alt="TS Logo" 
        $bottom="10%" 
        $left="10%" 
      />

      <FloatingIcon 
        src="/n8n.svg" 
        alt="n8n Logo" 
        $bottom="25%" 
        $right="10%" 
      />

      <CentralTextWrapper>
        <Title>{t("about_title")}</Title>
      
      <TextAboutMe>
        {t("about_text")}
      </TextAboutMe>
      </CentralTextWrapper>

    </AboutContainer>
  );
};