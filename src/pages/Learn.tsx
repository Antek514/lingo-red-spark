
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { UserStats } from "@/components/UserStats";
import { LearningLanguageSelector } from "@/components/LearningLanguageSelector";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

// Define types for lessons
type LessonStatus = "locked" | "available" | "completed";

interface Lesson {
  id: string;
  title: string;
  description: string;
  level: number;
  xp: number;
  unit: number;
  icon: string;
  sequence_order: number;
}

interface UserLessonProgress {
  lesson_id: string;
  status: LessonStatus;
  progress: number;
  completed_at: string | null;
  started_at: string | null;
}

export default function Learn() {
  const { t, learningLanguage } = useLanguage();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [userProgressMap, setUserProgressMap] = useState<Record<string, UserLessonProgress>>({});
  const [loading, setLoading] = useState(true);
  
  console.log("User in Learn:", user);
  console.log("Profile in Learn:", profile);
  
  // Fetch lessons and user progress
  useEffect(() => {
    const fetchLessons = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      
      setLoading(true);
      try {
        console.log("Fetching lessons for user:", user.id);
        
        // Fetch all lessons ordered by sequence
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .order('sequence_order', { ascending: true });
          
        if (lessonsError) {
          console.error("Lessons fetch error:", lessonsError);
          throw lessonsError;
        }
        
        console.log("Lessons data:", lessonsData);
        
        // Fetch user progress for lessons
        const { data: progressData, error: progressError } = await supabase
          .from('user_lesson_progress')
          .select('*')
          .eq('user_id', user.id);
          
        if (progressError) {
          console.error("Progress fetch error:", progressError);
          throw progressError;
        }
        
        console.log("Progress data:", progressData);
        
        // Convert progress data to map for easy access
        const progressMap: Record<string, UserLessonProgress> = {};
        progressData?.forEach((progress: UserLessonProgress) => {
          progressMap[progress.lesson_id] = progress;
        });
        
        // If no progress records exist, create initial records
        if (progressData?.length === 0 && lessonsData?.length > 0) {
          console.log("No progress records found, creating initial records");
          
          // Set first lesson as available, all others as locked
          const initialProgress = lessonsData.map((lesson, index) => ({
            user_id: user.id,
            lesson_id: lesson.id,
            status: index === 0 ? 'available' as LessonStatus : 'locked' as LessonStatus,
            progress: 0,
            started_at: null,
            completed_at: null
          }));
          
          await supabase.from('user_lesson_progress').insert(initialProgress);
          
          // Update progress map
          initialProgress.forEach((progress) => {
            progressMap[progress.lesson_id] = progress as UserLessonProgress;
          });
        }
        
        setLessons(lessonsData || []);
        setUserProgressMap(progressMap);
      } catch (error) {
        console.error('Error fetching lessons:', error);
        toast({
          title: "Error",
          description: "Could not load lessons data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLessons();
  }, [user, navigate, toast]);
  
  // Handle clicking on a lesson
  const handleLessonClick = (lesson: Lesson) => {
    const progress = userProgressMap[lesson.id];
    
    if (!progress || progress.status === 'locked') {
      toast({
        title: "Lesson Locked",
        description: "Complete previous lessons to unlock this one.",
        variant: "destructive"
      });
      return;
    }
    
    navigate(`/lesson/${lesson.id}`);
  };
  
  // Group lessons by unit
  const lessonsByUnit = lessons.reduce<Record<number, Lesson[]>>((acc, lesson) => {
    if (!acc[lesson.unit]) {
      acc[lesson.unit] = [];
    }
    acc[lesson.unit].push(lesson);
    return acc;
  }, {});
  
  if (loading) {
    return (
      <div className="container max-w-5xl py-6 space-y-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">{t("learn.loading")}</p>
        </div>
      </div>
    );
  }
  
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
        {Object.entries(lessonsByUnit).length > 0 ? (
          Object.entries(lessonsByUnit).map(([unit, unitLessons]) => (
            <div key={unit}>
              <h2 className="text-2xl font-bold mb-4">{t("learn.unit")} {unit}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {unitLessons.map((lesson) => {
                  const userProgress = userProgressMap[lesson.id] || { status: 'locked', progress: 0, completed_at: null, started_at: null };
                  return (
                    <Card 
                      key={lesson.id} 
                      className={`border-2 ${
                        userProgress.status === 'completed' 
                          ? "border-lingo-green" 
                          : userProgress.status === 'available'
                            ? "border-lingo-purple"
                            : "border-gray-200"
                      }`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <div className="text-4xl">{lesson.icon}</div>
                          <div className="badge-level">{t("learn.level")} {lesson.level}</div>
                        </div>
                        <CardTitle className="mt-2">{lesson.title}</CardTitle>
                        <CardDescription>{lesson.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="badge-xp">+{lesson.xp} XP</div>
                        {userProgress.progress > 0 && userProgress.progress < 100 && (
                          <div className="mt-2">
                            <div className="h-2 bg-gray-200 rounded-full">
                              <div 
                                className="h-full bg-lingo-purple rounded-full"
                                style={{ width: `${userProgress.progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-right mt-1">{userProgress.progress}% {t("learn.complete")}</p>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className={`w-full ${
                            userProgress.status === 'locked' 
                              ? "bg-gray-400" 
                              : userProgress.status === 'completed'
                                ? "bg-lingo-green"
                                : "bg-lingo-purple"
                          }`}
                          onClick={() => handleLessonClick(lesson)}
                          disabled={userProgress.status === 'locked'}
                        >
                          {userProgress.status === 'locked' 
                            ? t("learn.locked") 
                            : userProgress.status === 'completed'
                              ? t("learn.practiceSkill")
                              : userProgress.progress > 0
                                ? t("learn.continueLesson")
                                : t("learn.startLesson")
                          }
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">{t("learn.noLessons")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
