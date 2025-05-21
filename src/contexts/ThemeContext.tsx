
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check for stored theme or system preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && (savedTheme === "dark" || savedTheme === "light")) {
      return savedTheme;
    }
    
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  
  useEffect(() => {
    // Update class on document element
    const root = window.document.documentElement;
    
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === "light" ? "dark" : "light");
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
