"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // Ajuste o caminho se necessário
import { CarouselSection, CarouselTitle, ViewAllButton, SlideImage } from "./styles";
import { useTranslation } from "react-i18next"; // 1. Importando o hook
import Link from 'next/link';
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Navigation, Pagination } from "swiper/modules";

// Importando o CSS padrão do Swiper (Obrigatório)
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";

export const MoreProjects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 2. Chamando o hook AQUI DENTRO, antes do useEffect!
  const { t } = useTranslation();

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, cover_url")
        .not("cover_url", "is", null); 

      if (error) {
        console.error("Erro ao buscar projetos:", error);
      } else {
        setProjects(data || []);
      }
      setLoading(false);
    };

    fetchProjects();
  }, []);

  // 3. Aplicando as traduções com t()
  if (loading) return (
    <CarouselSection>
      <CarouselTitle>{t("more_projects_loading")}</CarouselTitle>
    </CarouselSection>
  );

  return (
    <CarouselSection id="projetos">
      <CarouselTitle>
        {t("more_projects_title_1")}<br/>{t("more_projects_title_2")}
      </CarouselTitle>

      <div style={{ width: "100%", maxWidth: "1200px" }}>
        <Swiper
          effect={"coverflow"} 
          grabCursor={true} 
          centeredSlides={true} 
          slidesPerView={"auto"} 
          initialSlide={1} 
          coverflowEffect={{
            rotate: 0, 
            stretch: 0, 
            depth: 250, 
            modifier: 1, 
            slideShadows: true, 
          }}
          navigation={true} 
          pagination={{ clickable: true }} 
          modules={[EffectCoverflow, Navigation, Pagination]}
          className="mySwiper"
        >
          {projects.map((project) => (
            <SwiperSlide key={project.id} style={{ width: "600px" }}>
              <SlideImage src={project.cover_url} alt={project.title} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <Link href="/projects" style={{ textDecoration: 'none' }}>
        <ViewAllButton>{t("more_projects_btn")}</ViewAllButton>
      </Link>
    </CarouselSection>
  );
};