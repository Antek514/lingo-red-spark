
import { useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage, SupportedUILanguage } from "@/contexts/LanguageContext";

const languageNames: Record<SupportedUILanguage, string> = {
  en: "English",
  pl: "Polski",
  fr: "Français",
  es: "Español",
};

export function LanguageSelector() {
  const { uiLanguage, setUILanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-9 gap-1 px-3 font-normal"
        >
          <Globe size={16} className="mr-1" />
          {languageNames[uiLanguage]}
          <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        {Object.entries(languageNames).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => {
              setUILanguage(code as SupportedUILanguage);
              setIsOpen(false);
            }}
            className="cursor-pointer"
          >
            <span className="flex-grow">{name}</span>
            {uiLanguage === code && <Check size={16} />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
