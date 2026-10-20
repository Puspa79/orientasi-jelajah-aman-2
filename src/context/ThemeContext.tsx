// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme as useDeviceColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  colors: {
    background: string;
    card: string;
    text: string;
    subtext: string;
    border: string;
    primary: string;
  };
}

const lightColors = {
  background: "#f8fafc",
  card: "#ffffff",
  text: "#0f172a",
  subtext: "#64748b",
  border: "#e2e8f0",
  primary: "#0284c7",
};

const darkColors = {
  background: "#0f172a",
  card: "#1e293b",
  text: "#f8fafc",
  subtext: "#94a3b8",
  border: "#334155",
  primary: "#38bdf8",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceColorScheme = useDeviceColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    AsyncStorage.getItem("user_theme").then((val) => {
      if (val === "light" || val === "dark" || val === "system") {
        setThemeModeState(val);
      }
    });
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem("user_theme", mode);
  };

  const isDark =
    themeMode === "system"
      ? deviceColorScheme === "dark"
      : themeMode === "dark";

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, setThemeMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme harus digunakan di dalam ThemeProvider");
  }
  return context;
}