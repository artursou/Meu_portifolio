"use client";
import { supabase } from "@/lib/supabase";
import { Row, TechContainer, TechItem, ProjectsIcon, Container, Title, Collumn } from "./styles";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next"; // 1. Importe o hook

export const Skills = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 2. Chame o hook
  const { t } = useTranslation();

  useEffect(() => {
    const fetchSkills = async () => {
      const { data, error } = await supabase
        .from("technologies")
        .select(`*`);

      if (error) {
        console.log(error.message);
        setLoading(false);
        return;
      }

      setData(data || []);
      setLoading(false);
    };

    fetchSkills();
  }, []);

  return (
    <Container>
      <Collumn>
        {/* 3. Aplique a tradução no título */}
        <Title>
          {t("skills_title")}
        </Title>
        
        {!loading && data.length === 0 ? (
          // 4. Aplique a tradução na mensagem de array vazio
          <p>{t("skills_empty")}</p>
        ) : (
          <TechContainer>
            {data.map((tech) => (
              <TechItem key={tech.id}>
                {tech.logo_url && (
                  <ProjectsIcon src={tech.logo_url} alt={`Logo ${tech.name}`} />
                )}
              </TechItem>
            ))}
          </TechContainer>
        )}
      </Collumn>
    </Container>
  );
};