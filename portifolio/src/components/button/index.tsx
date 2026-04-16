import { Container } from "./styles";
import { IButton } from "./types";



export const Button = ({title, onClick}: IButton) => {
  return (
    <Container onClick={onClick}>{title}</Container>
  ); 
};