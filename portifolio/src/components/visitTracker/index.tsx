"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { siteDay } from "@/lib/siteTime";

const STORAGE_KEY = "portfolio-visit-day";

// Avisa o servidor uma vez por dia por navegador. O servidor também deduplica
// por visitante, então isto só evita requisições repetidas.
export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/login")) return;
    const day = siteDay();
    try {
      if (localStorage.getItem(STORAGE_KEY) === day) return;
    } catch {}

    let cancelled = false;
    (async () => {
      // O administrador logado não entra na contagem
      const { data } = await supabase.auth.getSession();
      if (cancelled || data.session) return;
      const response = await fetch("/api/track", { method: "POST", keepalive: true });
      if (response.ok) {
        try { localStorage.setItem(STORAGE_KEY, day); } catch {}
      }
    })().catch(() => {});

    return () => { cancelled = true; };
  }, [pathname]);

  return null;
}
