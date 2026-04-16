"use client";
import { Container, Collumn, Title, Row, Projects, ProjectsTitle, ProjectsText, ProjectsImg, ProjectsIcon, TechContainer, TechItem } from "./styles";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";

export const MainProjects = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 1. Puxamos o "t" para os textos fixos e o "i18n" para saber o idioma atual
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language; // Vai ser "pt" ou "en"

  useEffect(() => {
    const fetchAbout = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          project_technologies (
            technologies (
              id,
              name,
              logo_url
            )
          )
        `);

      console.log("DATA:", data);
      console.log("ERROR:", error);

      if (error) {
        console.log(error.message);
        setLoading(false);
        return;
      }

      setData(data || []);
      setLoading(false);
    };

    fetchAbout();
  }, []);

  return (
    <Container>
      <Collumn>
        {/* 2. Tradução do Título (com a lógica de loading) */}
        <Title>{loading ? t("main_projects_loading") : t("main_projects_title")}</Title>
        <Row>
          {!loading && data.length === 0 ? (
            // 3. Tradução do texto de array vazio
            <p>{t("main_projects_empty")}</p>
          ) : (
            data.map((item) => (
              <Projects key={item.id}>
                {/* DICA DE BANCO DE DADOS: 
                  Se você alterar o Supabase para guardar os textos em JSON 
                  (ex: { "pt": "Meu Projeto", "en": "My Project" }), 
                  você usará: {item.title[currentLang]} 
                */}
                <ProjectsTitle>{item.title}</ProjectsTitle>
                
                {item.cover_url && (
                  <ProjectsImg src={item.cover_url} alt={item.title} />
                )}
                
                {/* Mesma regra do title se aplica a description */}
                <ProjectsText>{item.description}</ProjectsText>
                
                <TechContainer>
                  {item.project_technologies && item.project_technologies.map((pt: any) => {
                    const tech = pt.technologies;
                    if (!tech) return null;

                    return (
                      <TechItem key={tech.id}>
                        {tech.logo_url && (
                          <ProjectsIcon src={tech.logo_url} alt={`Logo ${tech.name}`} />
                        )}
                      </TechItem>
                    );
                  })}
                </TechContainer>
                <ProjectsText>{item.project_url}</ProjectsText>
              </Projects>
            ))
          )}
        </Row>
      </Collumn>
    </Container>
  );
};