
import { createContext, useContext, useState, useEffect } from "react";

export type SupportedUILanguage = "en" | "pl" | "fr" | "es";
export type SupportedLearningLanguage = "spanish" | "english" | "polish" | "french" | "italian" | "german";

type LanguageContextType = {
  uiLanguage: SupportedUILanguage;
  learningLanguage: SupportedLearningLanguage;
  setUILanguage: (language: SupportedUILanguage) => void;
  setLearningLanguage: (language: SupportedLearningLanguage) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Simple translation system
const translations: Record<SupportedUILanguage, Record<string, string>> = {
  en: {
    "app.name": "LingoRed",
    "nav.home": "Home",
    "nav.learn": "Learn",
    "nav.practice": "Practice",
    "nav.profile": "Profile",
    "auth.login": "Login",
    "auth.signup": "Sign Up",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.username": "Username",
    "auth.forgotPassword": "Forgot password?",
    "settings.theme": "Theme",
    "settings.language": "Language",
    "settings.learningLanguage": "Learning Language",
    "learn.level": "Level",
    "learn.streak": "Day Streak",
    "learn.xp": "XP",
    "learn.startLesson": "Start Lesson",
    "learn.practiceSkill": "Practice Skill",
    "settings.logout": "Log Out",
  },
  pl: {
    "app.name": "LingoRed",
    "nav.home": "Strona główna",
    "nav.learn": "Nauka",
    "nav.practice": "Ćwiczenia",
    "nav.profile": "Profil",
    "auth.login": "Zaloguj się",
    "auth.signup": "Zarejestruj się",
    "auth.email": "Email",
    "auth.password": "Hasło",
    "auth.username": "Nazwa użytkownika",
    "auth.forgotPassword": "Zapomniałeś hasła?",
    "settings.theme": "Motyw",
    "settings.language": "Język",
    "settings.learningLanguage": "Język do nauki",
    "learn.level": "Poziom",
    "learn.streak": "Seria dni",
    "learn.xp": "PD",
    "learn.startLesson": "Rozpocznij lekcję",
    "learn.practiceSkill": "Ćwicz umiejętność",
    "settings.logout": "Wyloguj się",
  },
  fr: {
    "app.name": "LingoRed",
    "nav.home": "Accueil",
    "nav.learn": "Apprendre",
    "nav.practice": "Pratique",
    "nav.profile": "Profil",
    "auth.login": "Connexion",
    "auth.signup": "Inscription",
    "auth.email": "Email",
    "auth.password": "Mot de passe",
    "auth.username": "Nom d'utilisateur",
    "auth.forgotPassword": "Mot de passe oublié?",
    "settings.theme": "Thème",
    "settings.language": "Langue",
    "settings.learningLanguage": "Langue d'apprentissage",
    "learn.level": "Niveau",
    "learn.streak": "Série de jours",
    "learn.xp": "XP",
    "learn.startLesson": "Commencer la leçon",
    "learn.practiceSkill": "Entraîner la compétence",
    "settings.logout": "Se déconnecter",
  },
  es: {
    "app.name": "LingoRed",
    "nav.home": "Inicio",
    "nav.learn": "Aprender",
    "nav.practice": "Practicar",
    "nav.profile": "Perfil",
    "auth.login": "Iniciar sesión",
    "auth.signup": "Registrarse",
    "auth.email": "Correo electrónico",
    "auth.password": "Contraseña",
    "auth.username": "Nombre de usuario",
    "auth.forgotPassword": "¿Olvidaste tu contraseña?",
    "settings.theme": "Tema",
    "settings.language": "Idioma",
    "settings.learningLanguage": "Idioma de aprendizaje",
    "learn.level": "Nivel",
    "learn.streak": "Racha de días",
    "learn.xp": "XP",
    "learn.startLesson": "Empezar lección",
    "learn.practiceSkill": "Practicar habilidad",
    "settings.logout": "Cerrar sesión",
  }
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [uiLanguage, setUILanguage] = useState<SupportedUILanguage>(() => {
    const saved = localStorage.getItem("uiLanguage") as SupportedUILanguage;
    return saved || "en";
  });

  const [learningLanguage, setLearningLanguage] = useState<SupportedLearningLanguage>(() => {
    const saved = localStorage.getItem("learningLanguage") as SupportedLearningLanguage;
    return saved || "spanish";
  });

  useEffect(() => {
    localStorage.setItem("uiLanguage", uiLanguage);
  }, [uiLanguage]);

  useEffect(() => {
    localStorage.setItem("learningLanguage", learningLanguage);
  }, [learningLanguage]);

  const t = (key: string): string => {
    return translations[uiLanguage][key] || key;
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        uiLanguage, 
        learningLanguage, 
        setUILanguage, 
        setLearningLanguage, 
        t 
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
