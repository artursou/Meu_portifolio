"use client"; // Adicione isso no topo!

import { Container, TextContainer, Title, TextContacts, Collumn } from "./styles";
import { useTranslation } from "react-i18next"; // 1. Importe o hook

export const Contacts = () => {
  const { t } = useTranslation(); // 2. Chame o hook

  return (
    <Container>
      <Collumn>
        {/* 3. Substitua o texto pela chave correspondente */}
        <Title>{t("contacts_title")}</Title>

        <TextContainer>
          <TextContacts>{t("contacts_email")}</TextContacts>
          <TextContacts>{t("contacts_phone")}</TextContacts>
        </TextContainer>
      </Collumn>
    </Container>
  );
};