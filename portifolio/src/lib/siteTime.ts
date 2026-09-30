// Palmas (TO) não tem horário de verão: UTC-3 fixo o ano todo.
export const SITE_TIME_ZONE = "America/Araguaina";
export const SITE_UTC_OFFSET = "-03:00";

// Data no formato YYYY-MM-DD no fuso do site.
export const siteDay = (date: Date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: SITE_TIME_ZONE }).format(date);

// Intervalo [início, fim) de um dia do site, em ISO, para filtrar timestamps.
export const siteDayRange = (day: string) => {
  const start = new Date(`${day}T00:00:00${SITE_UTC_OFFSET}`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
};
