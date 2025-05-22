
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { LearningLanguageSelector } from "@/components/LearningLanguageSelector";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  return (
    <div className="container max-w-6xl mx-auto">
      {/* Hero section */}
      <section className="flex flex-col md:flex-row items-center justify-between py-12 md:py-20">
        <div className="space-y-6 md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Learn languages <span className="text-lingo-red">the fun way</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Effective, engaging, and fun language learning with SnapGo. Start your language journey today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            {isAuthenticated ? (
              <Button 
                size="lg" 
                className="bg-lingo-green hover:bg-lingo-green/90 text-white"
                onClick={() => navigate("/learn")}
              >
                Continue Learning
              </Button>
            ) : (
              <>
                <Button 
                  size="lg" 
                  className="bg-lingo-green hover:bg-lingo-green/90 text-white"
                  onClick={() => navigate("/signup")}
                >
                  Get Started for Free
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate("/login")}
                >
                  Log In
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="mt-8 md:mt-0 md:w-1/2">
          <div className="relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-lingo-red via-lingo-purple to-lingo-blue opacity-70 blur-xl"></div>
            <div className="relative rounded-2xl overflow-hidden border-2 border-border">
              <img 
                src="https://placehold.co/600x400/f0f0f0/cccccc?text=SnapGo+App+Preview" 
                alt="SnapGo App" 
                className="w-full aspect-video object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-12 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why choose SnapGo?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our platform combines science-backed methods with fun gamification to help you learn languages faster.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="lingo-card">
            <div className="w-14 h-14 rounded-2xl bg-lingo-purple/15 flex items-center justify-center mb-4">
              <span className="text-3xl">🎮</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Learn by Playing</h3>
            <p className="text-muted-foreground">
              Gamified lessons make language learning fun, engaging, and effective.
            </p>
          </div>
          
          <div className="lingo-card">
            <div className="w-14 h-14 rounded-2xl bg-lingo-green/15 flex items-center justify-center mb-4">
              <span className="text-3xl">🔄</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Daily Practice</h3>
            <p className="text-muted-foreground">
              Build habits with streaks and daily goals that keep you motivated.
            </p>
          </div>
          
          <div className="lingo-card">
            <div className="w-14 h-14 rounded-2xl bg-lingo-red/15 flex items-center justify-center mb-4">
              <span className="text-3xl">🌍</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Multiple Languages</h3>
            <p className="text-muted-foreground">
              Choose from various languages to learn at your own pace.
            </p>
          </div>
          
          <div className="lingo-card">
            <div className="w-14 h-14 rounded-2xl bg-lingo-blue/15 flex items-center justify-center mb-4">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Track Progress</h3>
            <p className="text-muted-foreground">
              See your improvement with detailed statistics and progress tracking.
            </p>
          </div>
          
          <div className="lingo-card">
            <div className="w-14 h-14 rounded-2xl bg-lingo-yellow/15 flex items-center justify-center mb-4">
              <span className="text-3xl">🏆</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Earn Rewards</h3>
            <p className="text-muted-foreground">
              Collect XP, unlock achievements, and compete with friends.
            </p>
          </div>
          
          <div className="lingo-card">
            <div className="w-14 h-14 rounded-2xl bg-lingo-purple/15 flex items-center justify-center mb-4">
              <span className="text-3xl">📱</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Learn Anywhere</h3>
            <p className="text-muted-foreground">
              Fully responsive design works on desktop, tablet, and mobile.
            </p>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-12 md:py-20">
        <div className="bg-muted rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start learning?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Choose a language and begin your learning journey with SnapGo today.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <LearningLanguageSelector />
            
            <Button 
              size="lg" 
              className="bg-lingo-red hover:bg-lingo-red/90"
              onClick={() => isAuthenticated ? navigate("/learn") : navigate("/signup")}
            >
              {isAuthenticated ? "Go to Lessons" : "Start Learning Now"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
