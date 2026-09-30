"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [access, setAccess] = useState<'checking' | 'allowed' | 'denied'>('checking');
  const router = useRouter();

  useEffect(() => {
    let active = true;
    let generation = 0;
    const checkAuth = async () => {
      const current = ++generation;
      try {
        // Verify with Auth, then ask the database's authoritative allowlist.
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!active || current !== generation) return;
        if (error || !user) {
          setAccess('denied');
          router.replace('/login');
          return;
        }
        const { data, error: permissionError } = await supabase.rpc('is_portfolio_admin');
        if (active && current === generation) setAccess(!permissionError && data === true ? 'allowed' : 'denied');
      } catch {
        if (active && current === generation) setAccess('denied');
      }
    };
    void checkAuth();
    // Re-check in the background on every auth event (sign-out, refresh, password
    // change) without unmounting the panel; a denial still hides it immediately.
    // Schedule outside the Supabase auth callback to avoid its internal lock.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      queueMicrotask(() => { if (active) void checkAuth(); });
    });
    return () => { active = false; generation++; subscription.unsubscribe(); };
  }, [router]);

  if (access !== 'allowed') {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#000', color: '#fff' }}>
        <h2>{access === 'checking' ? 'Verificando credenciais...' : 'Acesso restrito ao administrador.'}</h2>
      </div>
    );
  }
  return <>{children}</>;
}
