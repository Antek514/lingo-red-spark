
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  useLanguage,
  SupportedLearningLanguage
} from "@/contexts/LanguageContext";

// Language flag emojis
const languageFlags: Record<SupportedLearningLanguage, string> = {
  spanish: "🇪🇸",
  english: "🇬🇧",
  french: "🇫🇷",
  polish: "🇵🇱",
  italian: "🇮🇹",
  german: "🇩🇪",
};

// Language display names (should be translated in a real app)
const languageNames: Record<SupportedLearningLanguage, string> = {
  spanish: "Spanish",
  english: "English",
  french: "French",
  polish: "Polish",
  italian: "Italian",
  german: "German",
};

export function LearningLanguageSelector() {
  const { learningLanguage, setLearningLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 border-2 font-medium"
        >
          <span>{languageFlags[learningLanguage]}</span>
          <span>{languageNames[learningLanguage]}</span>
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-[180px]">
        {Object.entries(languageNames).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLearningLanguage(code as SupportedLearningLanguage)}
            className="cursor-pointer"
          >
            <span className="mr-2">{languageFlags[code as SupportedLearningLanguage]}</span>
            <span className="flex-grow">{name}</span>
            {learningLanguage === code && <Check size={16} />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
