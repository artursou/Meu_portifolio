"use client";

import { useState, useEffect } from "react";
import { AdminPage } from "@/components/adminPage";


export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; 
  }

  return (
    <>
      <AdminPage/>
    </>
  );
}