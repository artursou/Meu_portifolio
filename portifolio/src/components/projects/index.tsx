"use client";
import { Container, Collumn, Title, Row, Projects, ProjectsTitle, ProjectsText, ProjectsImg, ProjectsIcon, TechContainer, TechItem } from "./styles";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";

export const MainProjects = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Puxamos o "t" para os textos fixos e o "i18n" para saber o idioma atual
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

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
        `)
        .eq("main", true); // <--- ALTERAÇÃO 1: Filtra apenas os projetos onde main é true

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
        {/* Tradução do Título (com a lógica de loading) */}
        <Title>{loading ? t("main_projects_loading") : t("main_projects_title")}</Title>
        <Row>
          {!loading && data.length === 0 ? (
            // Tradução do texto de array vazio
            <p>{t("main_projects_empty")}</p>
          ) : (
            data.map((item) => (
              <Projects key={item.id}> 
                
                {/* Se o title também virar JSONB no futuro, basta usar {item.title[currentLang]} */}
                <ProjectsTitle>{item.title}</ProjectsTitle>
                
                {item.cover_url && (
                  <ProjectsImg src={item.cover_url} alt={item.title} />
                )}
                
                {/* ALTERAÇÃO 2: Renderiza a descrição com base no idioma atual do i18n */}
                <ProjectsText>
                  {item.description ? item.description[currentLang] : ""}
                </ProjectsText>
                
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