export type Lang = "pt" | "en";

export type LocalizedText = Partial<Record<Lang, string>>;

export interface Technology {
  id: string;
  name: string;
  logo_url: string | null;
  category: string;
}

export interface Project {
  id: string;
  title: string;
  main: boolean;
  // JSONB no banco; registros antigos podem estar salvos como string
  description: LocalizedText | string | null;
  cover_url: string | null;
  project_url: string | null;
}

export interface ProjectWithTechs extends Project {
  project_technologies: { technologies: Pick<Technology, "id" | "name" | "logo_url"> | null }[] | null;
}

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  // Mensagens geradas no cliente (erros, limite) não entram no histórico enviado à API
  local?: boolean;
}
