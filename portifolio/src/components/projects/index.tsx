"use client";
import { Container, Collumn, Title, Row, Projects, ProjectsTitle, ProjectsText, ProjectsImg, ProjectsIcon, ProjectsLink, TechContainer, TechItem } from "./styles";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getLocalized } from "@/lib/localize";
import type { ProjectWithTechs } from "@/types";
import { useTranslation } from "react-i18next";

export const MainProjects = () => {
  const [data, setData] = useState<ProjectWithTechs[]>([]);
  const [loading, setLoading] = useState(true);

  // Puxamos o "t" para os textos fixos e o "i18n" para saber o idioma atual
  const { t, i18n } = useTranslation();

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
        .eq("main", true); // Filtra apenas os projetos onde main é true

      if (error) {
        console.error("Erro ao buscar projetos principais:", error.message);
        setLoading(false);
        return;
      }

      setData((data as ProjectWithTechs[]) || []);
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
                
                {/* Renderiza a descrição com base no idioma atual do i18n */}
                <ProjectsText>
                  {getLocalized(item.description, i18n.language)}
                </ProjectsText>

                <TechContainer>
                  {item.project_technologies && item.project_technologies.map((pt) => {
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
                {item.project_url && (
                  <ProjectsText>
                    <ProjectsLink href={item.project_url} target="_blank" rel="noopener noreferrer">
                      {t("project_link")} ↗
                    </ProjectsLink>
                  </ProjectsText>
                )}
              </Projects>
            ))
          )}
        </Row>
      </Collumn>
    </Container>
  );
};