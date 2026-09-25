"use client";

import { AdminPage } from "@/components/adminPage";
import { useIsClient } from "@/hooks/useIsClient";


export default function Home() {
  const isClient = useIsClient();

  if (!isClient) {
    return null;
  }

  return (
    <>
      <AdminPage/>
    </>
  );
}
