import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// 1. Importe o plugin de detecção
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  pt: {
    translation: {
      // --- Textos do Header ---
      "title": "Engenharia, automação e ideias que viram soluções reais.",
      "btn_about": "Sobre",
      "btn_projects": "Projetos",

      "about_title": "Sobre Mim",
      "about_text": "Sou Artur, tenho 22 anos e sou formado em Engenharia de Software na Universidade Católica do Tocantins. Atuo com desenvolvimento e automação desde 2024 e iniciei minha trajetória como desenvolvedor web front-end no mesmo ano. Tenho interesse em criar soluções práticas, aprender continuamente e evoluir minhas habilidades em tecnologia.",
      
      "more_projects_loading": "Carregando...",
      "more_projects_title_1": "Mais",
      "more_projects_title_2": "Projetos",
      "more_projects_btn": "Ver todos",

      "main_projects_loading": "Carregando...",
      "main_projects_title": "Principais Projetos",
      "main_projects_empty": "Nenhum dado encontrado.",

      "skills_title": "Skills & Competências",
      "skills_empty": "Nenhum dado encontrado.",

      "contacts_title": "Contatos",
      "contacts_email": "E-mail: artursousantos@gmail.com",
      "contacts_phone": "Telefone: (63) 99201-5605",

      "all_projects": "Projetos",
      "project_link": "Ver projeto",

      "chat_welcome": "Olá! Pergunte algo sobre as experiências profissionais e projetos do Artur.",
      "chat_typing": "Digitando...",
      "chat_placeholder": "Digite sua mensagem...",
      "chat_limit": "Limite atingido.",
      "chat_send": "Enviar",
      "chat_error": "Desculpe, ocorreu um erro de conexão.",
      "chat_rate_limited": "Muitas mensagens em pouco tempo. Tente novamente mais tarde."
    }
  },
  en: {
    translation: {
      // --- Textos do Header ---
      "title": "Engineering, automation and ideas that turn into real solutions.",
      "btn_about": "About",
      "btn_projects": "Projects",

      "about_title": "About Me",
      "about_text": "I'm Artur, 22 years old, and I hold a degree in Software Engineering from the Catholic University of Tocantins. I have been working with development and automation since 2024, and I started my journey as a front-end web developer the same year. I am interested in creating practical solutions, continuously learning, and evolving my skills in technology.",
      
      "more_projects_loading": "Loading...",
      "more_projects_title_1": "More",
      "more_projects_title_2": "Projects",
      "more_projects_btn": "View all",

      "main_projects_loading": "Loading...",
      "main_projects_title": "Main Projects",
      "main_projects_empty": "No data found.",

      "skills_title": "Skills & Competencies",
      "skills_empty": "No data found.",

      // --- Textos de Contato ---
      "contacts_title": "Contacts",
      "contacts_email": "E-mail: artursousantos@gmail.com",
      "contacts_phone": "Phone: +55 (63) 99201-5605",

      "all_projects": "Projects",
      "project_link": "View project",

      "chat_welcome": "Hi! Ask anything about Artur's professional experience and projects.",
      "chat_typing": "Typing...",
      "chat_placeholder": "Type your message...",
      "chat_limit": "Limit reached.",
      "chat_send": "Send",
      "chat_error": "Sorry, a connection error occurred.",
      "chat_rate_limited": "Too many messages in a short time. Please try again later."
    }
  }
};

i18n
  .use(LanguageDetector) // 2. Ative o detector ANTES do initReactI18next
  .use(initReactI18next)
  .init({
    resources,
    // lng: "pt", <--- IMPORTANTE: Apague ou comente essa linha!
    fallbackLng: "pt", // Idioma de segurança caso dê erro ou não ache nada
    supportedLngs: ["pt", "en"],
    load: "languageOnly", // "pt-BR" vira "pt", "en-US" vira "en"
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;