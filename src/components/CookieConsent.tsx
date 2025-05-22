
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export function CookieConsent() {
  const { t } = useLanguage();
  const [showConsent, setShowConsent] = useState(false);
  
  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = localStorage.getItem("cookie-consent");
    if (!cookieConsent) {
      setShowConsent(true);
    }
  }, []);
  
  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowConsent(false);
  };
  
  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setShowConsent(false);
  };
  
  if (!showConsent) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg z-50 flex items-center justify-between">
      <div className="flex-1 max-w-3xl">
        <h3 className="font-medium">{t("cookie.title")}</h3>
        <p className="text-sm text-muted-foreground">{t("cookie.description")}</p>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <Button size="sm" variant="outline" onClick={handleDecline}>
          {t("cookie.decline")}
        </Button>
        <Button size="sm" onClick={handleAccept}>
          {t("cookie.accept")}
        </Button>
        <Button size="icon" variant="ghost" onClick={handleDecline}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
