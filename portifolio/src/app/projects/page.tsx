"use client";

import '@/i18n';
import { AllProjects } from "@/components/allProjects";
import { useIsClient } from "@/hooks/useIsClient";

export default function Home() {
  const isClient = useIsClient();

  if (!isClient) {
    return null;
  }

  return (
    <>
      <AllProjects/>
    </>
  );
}
