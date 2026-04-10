import { Container } from "./styles";
import { IButton } from "./types";

export const Button = ({title}: IButton) => {
  return (
    <Container>{title}</Container>
  ); 
};