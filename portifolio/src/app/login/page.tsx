"use client";

import { useState, useEffect } from "react";

import '@/i18n';
import LoginPage from "@/components/login";


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
      <LoginPage/>
    </>
  );
}