"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Container, 
  Title, 
  Collumn, 
  Form, 
  InputWrapper, 
  InputField, 
  Label,
  GalaxyBtn,
  GalaxyBtnContent,
  GalaxyBtnIcon,
  GalaxyBtnStars
} from "./styles";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Função auxiliar para não precisarmos escrever cada span na mão [cite: 262]
  const renderAnimatedLabel = (text: string) => {
    return text.split('').map((char, index) => (
      <span key={index} style={{ transitionDelay: `${index * 50}ms` }}>
        {char}
      </span>
    ));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Chama a função de autenticação do Supabase [cite: 240]
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("E-mail ou senha incorretos.");
      setLoading(false);
      return;
    }

    // Se deu certo, redireciona para a área logada [cite: 242]
    router.push("/admin");
  };

  return (
    <Container>
      <Collumn>
        <Title>Acesso Restrito</Title>
        
        <Form onSubmit={handleLogin}>
          
          <InputWrapper>
            <InputField
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required /* O required é OBRIGATÓRIO para a classe :valid do CSS funcionar [cite: 264] */
            />
            <Label>
              {renderAnimatedLabel("E-mail")}
            </Label>
          </InputWrapper>
          
          <InputWrapper>
            <InputField
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required /* O required é OBRIGATÓRIO para a classe :valid do CSS funcionar [cite: 264] */
            />
            <Label>
              {renderAnimatedLabel("Senha")}
            </Label>
          </InputWrapper>

          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

          <GalaxyBtn type="submit" disabled={loading}>
            <GalaxyBtnContent>
              <span>{loading ? "Entrando..." : "Entrar"}</span>
              <GalaxyBtnIcon
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path fill="none" d="M0 0h24v24H0z"></path>
                <path
                  d="M13 14h-2a8.999 8.999 0 0 0-7.968 4.81A10.136 10.136 0 0 1 3 18C3 12.477 7.477 8 13 8V3l10 8-10 8v-5z"
                  fill="currentColor"
                ></path>
              </GalaxyBtnIcon>
            </GalaxyBtnContent>
            <GalaxyBtnStars />
          </GalaxyBtn>

        </Form>
      </Collumn>
    </Container>
  );
}