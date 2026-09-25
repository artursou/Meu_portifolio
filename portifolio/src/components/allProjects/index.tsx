"use client";

import React, { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next"; 
import { supabase } from '@/lib/supabase';
import { 
  Container, 
  Header,
  FlagsRow,
  Title, 
  ProjectsWrapper,
  ProjectCard,
  ProjectLeft,
  ProjectRight,
  ProjectsIcon, 
  ProjectsImg,
  ProjectsLink,
  ProjectsText,
  ProjectsTitle,
  TechContainer,
  TechItem
} from './styles';
import Link from 'next/link';
import { getLocalized } from '@/lib/localize';
import type { ProjectWithTechs } from '@/types';

export const AllProjects = () => {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<ProjectWithTechs[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
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

      if (error) {
        console.error("Erro ao buscar projetos:", error.message);
        setLoading(false);
        return;
      }

      setData((data as ProjectWithTechs[]) || []);
      setLoading(false);
    };

    fetchProjects();
  }, []);
  

  return (
    <Container>
      <Header>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ color: 'white', fontSize: '24px', cursor: 'pointer' }}>←</span>
        </Link>
        <Title>{t("all_projects")}</Title>
        <FlagsRow>
          <img 
            src="/iconBr.svg" 
            alt="Brasil" 
            onClick={() => i18n.changeLanguage('pt')} 
            style={{ cursor: "pointer", width: '40px' }} 
          />
          <img 
            src="/iconUSA.svg" 
            alt="USA" 
            onClick={() => i18n.changeLanguage('en')} 
            style={{ cursor: "pointer", width: '40px' }} 
          />
        </FlagsRow>
      </Header>

      {/* Lista de Projetos */}
      <ProjectsWrapper>
        {loading ? (
          <Title>{t("main_projects_loading", "Carregando...")}</Title>
        ) : data.length === 0 ? (
          <p style={{ color: 'white' }}>{t("main_projects_empty", "Nenhum projeto encontrado.")}</p>
        ) : (
          data.map((item, index) => (
            <ProjectCard key={item.id} $isEven={index % 2 === 0}>
              <ProjectLeft>
                <ProjectsTitle>{item.title}</ProjectsTitle>
                {item.cover_url && (
                  <ProjectsImg src={item.cover_url} alt={item.title} />
                )}
                {item.project_url && (
                  <ProjectsText>
                    <ProjectsLink href={item.project_url} target="_blank" rel="noopener noreferrer">
                      {t("project_link")} ↗
                    </ProjectsLink>
                  </ProjectsText>
                )}
              </ProjectLeft>

              {/* LADO DIREITO: Descrição e Tecnologias */}
              <ProjectRight>
                <ProjectsText className="description">
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
              </ProjectRight>

            </ProjectCard>
          ))
        )}
      </ProjectsWrapper>
    </Container>
  );
};