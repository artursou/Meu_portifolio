"use client";

import { AboutMe } from "@/components/aboutMe";
import { Contacts } from "@/components/contacts";
import { Header } from "@/components/header";
import { MoreProjects } from "@/components/moreProjects";
import { MainProjects } from "@/components/projects"
import { Skills } from "@/components/skills";
import { useIsClient } from "@/hooks/useIsClient";
import '@/i18n';

export default function Home() {
  // Só é true no navegador, nunca no servidor
  const isClient = useIsClient();

  // Se ainda não está no navegador, não renderiza a interface (evita o erro do servidor)
  if (!isClient) {
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