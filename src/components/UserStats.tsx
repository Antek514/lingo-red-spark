
import { Award, Flame, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";

export function UserStats() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  
  if (!profile) return null;
  
  const xpToNextLevel = 1000; // In a real app, calculate this based on level
  const xpProgress = (profile.xp % 1000) / xpToNextLevel * 100;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="lingo-card flex items-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-lingo-purple/20 mr-4">
          <Award className="w-6 h-6 text-lingo-purple" />
        </div>
        <div>
          <div className="text-sm font-medium text-muted-foreground">{t("learn.level")}</div>
          <div className="text-2xl font-bold">{profile.level}</div>
        </div>
      </div>
      
      <div className="lingo-card flex items-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-lingo-red/20 mr-4">
          <Flame className="w-6 h-6 text-lingo-red" />
        </div>
        <div>
          <div className="text-sm font-medium text-muted-foreground">{t("learn.streak")}</div>
          <div className="text-2xl font-bold">{profile.streak}</div>
        </div>
      </div>
      
      <div className="lingo-card flex items-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-lingo-yellow/20 mr-4">
          <Star className="w-6 h-6 text-lingo-yellow" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-muted-foreground">{t("learn.xp")}</div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{profile.xp}</div>
            <div className="text-xs text-muted-foreground">/{xpToNextLevel}</div>
          </div>
          <Progress value={xpProgress} className="h-2 mt-1" />
        </div>
      </div>
    </div>
  );
}
