import type { Lang, LocalizedText } from "@/types";

// Converte "pt-BR", "en-US" etc. para "pt" / "en"
export const toLang = (language?: string): Lang =>
  language?.substring(0, 2) === "en" ? "en" : "pt";

// Registros antigos podem ter o JSONB salvo como string
export const parseLocalized = (text: LocalizedText | string | null | undefined): LocalizedText => {
  if (!text) return {};
  if (typeof text !== "string") return text;
  try {
    return JSON.parse(text);
  } catch {
    return { pt: text };
  }
};

export const getLocalized = (text: LocalizedText | string | null | undefined, language?: string): string => {
  const parsed = parseLocalized(text);
  const lang = toLang(language);
  return parsed[lang] || parsed.pt || parsed.en || "";
};
