
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { UserStats } from "@/components/UserStats";
import { LearningLanguageSelector } from "@/components/LearningLanguageSelector";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Mock lesson data - in a real app, this would come from an API based on the selected language
const lessons = [
  {
    id: "basics-1",
    title: "Basics 1",
    description: "Learn the essentials",
    level: 1,
    xp: 10,
    completed: true,
    icon: "🏠"
  },
  {
    id: "phrases",
    title: "Common Phrases",
    description: "Essential expressions",
    level: 1,
    xp: 15,
    completed: true,
    icon: "👋"
  },
  {
    id: "food",
    title: "Food",
    description: "Learn food vocabulary",
    level: 1,
    xp: 20,
    completed: false,
    icon: "🍕"
  },
  {
    id: "animals",
    title: "Animals",
    description: "Animal names and sounds",
    level: 2,
    xp: 20,
    completed: false,
    icon: "🐶"
  },
  {
    id: "verbs",
    title: "Present Tense",
    description: "Basic verb conjugations",
    level: 2,
    xp: 25,
    completed: false,
    icon: "📝"
  }
];

export default function Learn() {
  const { t, learningLanguage } = useLanguage();
  const navigate = useNavigate();
  
  return (
    <div className="container max-w-5xl py-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">
          {t("nav.learn")}
        </h1>
        <LearningLanguageSelector />
      </div>
      
      <UserStats />
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Unit 1</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.slice(0, 3).map((lesson) => (
              <Card key={lesson.id} className={`border-2 ${lesson.completed ? "border-lingo-green" : ""}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="text-4xl">{lesson.icon}</div>
                    <div className="badge-level">Level {lesson.level}</div>
                  </div>
                  <CardTitle className="mt-2">{lesson.title}</CardTitle>
                  <CardDescription>{lesson.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="badge-xp">+{lesson.xp} XP</div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full ${lesson.completed ? "bg-lingo-green" : "bg-lingo-purple"}`}
                    onClick={() => navigate(`/lesson/${lesson.id}`)}
                  >
                    {lesson.completed ? t("learn.practiceSkill") : t("learn.startLesson")}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-4">Unit 2</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.slice(3, 5).map((lesson) => (
              <Card key={lesson.id} className={`border-2 ${lesson.completed ? "border-lingo-green" : ""}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="text-4xl">{lesson.icon}</div>
                    <div className="badge-level">Level {lesson.level}</div>
                  </div>
                  <CardTitle className="mt-2">{lesson.title}</CardTitle>
                  <CardDescription>{lesson.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="badge-xp">+{lesson.xp} XP</div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full ${lesson.completed ? "bg-lingo-green" : "bg-lingo-purple"}`}
                    onClick={() => navigate(`/lesson/${lesson.id}`)}
                  >
                    {lesson.completed ? t("learn.practiceSkill") : t("learn.startLesson")}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
