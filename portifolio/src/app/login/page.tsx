"use client";

import '@/i18n';
import LoginPage from "@/components/login";
import { useIsClient } from "@/hooks/useIsClient";


export default function Home() {
  const isClient = useIsClient();

  if (!isClient) {
    return null;
  }

  return (
    <>
      <LoginPage/>
    </>
  );
}
