// src/app/admin/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // Pede ao Supabase a sessão atual
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Se não tem sessão, redireciona para o login
        router.push("/login");
      } else {
        // Se tem sessão, libera o acesso parando o loading
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Enquanto estiver verificando, mostra uma tela preta de loading
  // (Isso evita que a página do admin "pisque" antes de redirecionar um invasor)
  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', color: '#fff' }}>
        <h2>Verificando credenciais...</h2>
      </div>
    );
  }

  // Se passou do loading, renderiza a página do admin
  return <>{children}</>;
}