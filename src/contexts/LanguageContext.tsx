
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
    "app.name": "SnapGo",
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
    "learn.continueLesson": "Continue Lesson",
    "learn.practiceSkill": "Practice Skill",
    "learn.locked": "Locked",
    "learn.loading": "Loading lessons...",
    "learn.unit": "Unit",
    "learn.complete": "complete",
    "learn.noLessons": "No lessons available",
    "settings.logout": "Log Out",
    "cookie.title": "We use cookies",
    "cookie.description": "This website uses cookies to enhance user experience.",
    "cookie.accept": "Accept",
    "cookie.decline": "Decline",
    "notFound.title": "Page Not Found",
    "notFound.description": "Sorry, the page you are looking for does not exist.",
    "notFound.backHome": "Back to Home"
  },
  pl: {
    "app.name": "SnapGo",
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
    "learn.continueLesson": "Kontynuuj lekcję",
    "learn.practiceSkill": "Ćwicz umiejętność",
    "learn.locked": "Zablokowane",
    "learn.loading": "Ładowanie lekcji...",
    "learn.unit": "Rozdział",
    "learn.complete": "ukończone",
    "learn.noLessons": "Brak dostępnych lekcji",
    "settings.logout": "Wyloguj się",
    "cookie.title": "Używamy ciasteczek",
    "cookie.description": "Ta strona używa ciasteczek, aby poprawić doświadczenie użytkownika.",
    "cookie.accept": "Akceptuję",
    "cookie.decline": "Odrzucam",
    "notFound.title": "Nie znaleziono strony",
    "notFound.description": "Przepraszamy, strona której szukasz nie istnieje.",
    "notFound.backHome": "Powrót do strony głównej"
  },
  fr: {
    "app.name": "SnapGo",
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
    "learn.continueLesson": "Continuer la leçon",
    "learn.practiceSkill": "Entraîner la compétence",
    "learn.locked": "Verrouillé",
    "learn.loading": "Chargement des leçons...",
    "learn.unit": "Unité",
    "learn.complete": "terminé",
    "learn.noLessons": "Pas de leçons disponibles",
    "settings.logout": "Se déconnecter",
    "cookie.title": "Nous utilisons des cookies",
    "cookie.description": "Ce site utilise des cookies pour améliorer l'expérience utilisateur.",
    "cookie.accept": "Accepter",
    "cookie.decline": "Refuser",
    "notFound.title": "Page non trouvée",
    "notFound.description": "Désolé, la page que vous cherchez n'existe pas.",
    "notFound.backHome": "Retour à l'accueil"
  },
  es: {
    "app.name": "SnapGo",
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
    "learn.continueLesson": "Continuar lección",
    "learn.practiceSkill": "Practicar habilidad",
    "learn.locked": "Bloqueado",
    "learn.loading": "Cargando lecciones...",
    "learn.unit": "Unidad",
    "learn.complete": "completo",
    "learn.noLessons": "No hay lecciones disponibles",
    "settings.logout": "Cerrar sesión",
    "cookie.title": "Usamos cookies",
    "cookie.description": "Este sitio utiliza cookies para mejorar la experiencia del usuario.",
    "cookie.accept": "Aceptar",
    "cookie.decline": "Rechazar",
    "notFound.title": "Página no encontrada",
    "notFound.description": "Lo sentimos, la página que estás buscando no existe.",
    "notFound.backHome": "Volver al inicio"
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
