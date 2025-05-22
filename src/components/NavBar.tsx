
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Home, Book, Award, User } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSelector } from "./LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { isAuthenticated, logout } = useAuth();

  const navLinks = [
    {
      name: t("nav.home"),
      path: "/",
      icon: Home
    },
    {
      name: t("nav.learn"),
      path: "/learn",
      icon: Book
    },
    {
      name: t("nav.practice"),
      path: "/practice",
      icon: Award
    },
    {
      name: t("nav.profile"),
      path: "/profile",
      icon: User
    }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-3 md:py-4">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="h-10 w-10 rounded-xl bg-lingo-red flex items-center justify-center mr-2">
                <span className="text-white text-xl font-bold">S</span>
              </div>
              <span className="text-xl font-bold">
                <span className="text-lingo-red">Snap</span>
                <span>Go</span>
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                {navLinks.map((link) => (
                  <Link 
                    key={link.path} 
                    to={link.path}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent"
                  >
                    <link.icon size={18} className="mr-2" />
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-3">
            <LanguageSelector />
            <ThemeToggle />
            
            {isAuthenticated ? (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={logout}
                className="hidden md:flex"
              >
                {t("settings.logout")}
              </Button>
            ) : (
              <div className="hidden md:flex space-x-2">
                <Button variant="outline" asChild>
                  <Link to="/login">{t("auth.login")}</Link>
                </Button>
                <Button variant="default" asChild>
                  <Link to="/signup">{t("auth.signup")}</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full bg-background/95 backdrop-blur-sm md:hidden transition-transform duration-300 ease-in-out",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full p-6 pt-20">
          {isAuthenticated ? (
            <div className="space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center p-3 text-lg font-medium rounded-lg hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon size={24} className="mr-4" />
                  {link.name}
                </Link>
              ))}
              <Button 
                variant="outline" 
                className="w-full mt-6"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
              >
                {t("settings.logout")}
              </Button>
            </div>
          ) : (
            <div className="space-y-3 w-full">
              <Button 
                variant="outline" 
                className="w-full"
                asChild
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link to="/login">{t("auth.login")}</Link>
              </Button>
              <Button 
                variant="default" 
                className="w-full"
                asChild
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link to="/signup">{t("auth.signup")}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
