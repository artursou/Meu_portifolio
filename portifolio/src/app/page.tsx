"use client";

import { useState, useEffect } from "react"; // 1. Importe os hooks
import { AboutMe } from "@/components/aboutMe";
import { Contacts } from "@/components/contacts";
import { Header } from "@/components/header";
import { MoreProjects } from "@/components/moreProjects";
import { MainProjects } from "@/components/projects"
import { Skills } from "@/components/skills";
import '@/i18n';

export default function Home() {
  // 2. Crie um estado para saber se já estamos no navegador
  const [isMounted, setIsMounted] = useState(false);

  // 3. O useEffect só roda no navegador, nunca no servidor
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 4. Se ainda não montou, não renderiza a interface (evita o erro do servidor)
  if (!isMounted) {
    return null; // Você também pode retornar um <div style={{ height: "100vh", backgroundColor: "#333" }} /> para evitar tela branca
  }

  return (
    <>
      <Header/>
      <AboutMe/>
      <MainProjects/>
      <MoreProjects/>
      <Skills/>
      <Contacts/>
    </>
  );
}