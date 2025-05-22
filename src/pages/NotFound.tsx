
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NotFound() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-gray-700">404</h1>
        <h2 className="text-3xl font-semibold">{t("notFound.title")}</h2>
        <p className="text-muted-foreground max-w-md">
          {t("notFound.description")}
        </p>
        <Button onClick={() => navigate('/')}>
          {t("notFound.backHome")}
        </Button>
      </div>
    </div>
  );
}
