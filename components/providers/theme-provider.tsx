"use client";

import { useEffect } from "react";
import { initTheme } from "@/lib/theme";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // 初始化主题
  useEffect(() => {
    initTheme();
  }, []);

  return <>{children}</>;
}
