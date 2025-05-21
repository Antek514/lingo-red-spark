
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { UserStats } from "@/components/UserStats";
import { LearningLanguageSelector } from "@/components/LearningLanguageSelector";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Define types for our lessons
type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed';

interface LessonProgress {
  id: string;
  lesson_id: string;
  status: LessonStatus;
  progress: number;
  started_at: string | null;
  completed_at: string | null;
  last_attempted_at: string | null;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  level: number;
  xp: number;
  unit: number;
  sequence_order: number;
  icon: string;
  progress?: number;
  status?: LessonStatus;
}

export default function Learn() {
  const { t, learningLanguage } = useLanguage();
  const { user, isAuthenticated, updateStreak } = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  
  // Fetch lessons and user progress using React Query
  const { data: lessonsData, isLoading, refetch } = useQuery({
    queryKey: ['lessons', user?.id, learningLanguage],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      // First fetch all lessons
      const { data: allLessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .order('sequence_order', { ascending: true });
      
      if (lessonsError) {
        toast.error("Failed to load lessons");
        throw lessonsError;
      }
      
      // Then fetch user progress for these lessons
      const { data: progress, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (progressError) {
        toast.error("Failed to load lesson progress");
        throw progressError;
      }
      
      // Merge the data
      const mergedData = allLessons.map((lesson) => {
        const userProgress = progress.find(p => p.lesson_id === lesson.id);
        return {
          ...lesson,
          progress: userProgress?.progress || 0,
          status: userProgress?.status || 'locked'
        };
      });
      
      return mergedData;
    },
    enabled: !!user && isAuthenticated,
  });
  
  // Update lessons state when data is loaded
  useEffect(() => {
    if (lessonsData) {
      setLessons(lessonsData);
    }
  }, [lessonsData]);
  
  // Update streak when visiting the learn page
  useEffect(() => {
    if (isAuthenticated && user) {
      updateStreak();
    }
  }, [isAuthenticated, user, updateStreak]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  // Handle starting or continuing a lesson
  const handleLessonClick = async (lesson: Lesson) => {
    if (!user) return;
    
    if (lesson.status === 'locked') {
      toast.error("This lesson is currently locked. Complete the previous lessons first to unlock it.");
      return;
    }
    
    try {
      const now = new Date().toISOString();
      let newStatus = lesson.status;
      
      // If lesson is available, mark it as in_progress
      if (lesson.status === 'available' && lesson.progress === 0) {
        newStatus = 'in_progress';
        
        // Update the lesson status in the database
        await supabase
          .from('user_lesson_progress')
          .update({ 
            status: 'in_progress', 
            started_at: now,
            last_attempted_at: now 
          })
          .eq('user_id', user.id)
          .eq('lesson_id', lesson.id);
      } else {
        // Just update the last attempted timestamp
        await supabase
          .from('user_lesson_progress')
          .update({ last_attempted_at: now })
          .eq('user_id', user.id)
          .eq('lesson_id', lesson.id);
      }
      
      // Navigate to the lesson
      navigate(`/lesson/${lesson.id}`);
      
    } catch (error) {
      console.error("Error starting lesson:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };
  
  if (isLoading) {
    return (
      <div className="container max-w-5xl py-6 space-y-8 flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p>Loading your lessons...</p>
        </div>
      </div>
    );
  }
  
  // Group lessons by unit
  const lessonsByUnit = lessons.reduce((acc, lesson) => {
    const unit = lesson.unit;
    if (!acc[unit]) acc[unit] = [];
    acc[unit].push(lesson);
    return acc;
  }, {} as Record<number, Lesson[]>);
  
  return (
    <div className="container max-w-5xl py-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">
          Your Learning Path
        </h1>
        <LearningLanguageSelector />
      </div>
      
      <UserStats />
      
      <div className="space-y-8">
        {Object.entries(lessonsByUnit).map(([unitNumber, unitLessons]) => (
          <div key={unitNumber}>
            <h2 className="text-2xl font-bold mb-4">Unit {unitNumber}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {unitLessons.map((lesson) => (
                <Card 
                  key={lesson.id} 
                  className={`border-2 transition-all duration-200 hover:shadow-md ${
                    lesson.status === 'completed' 
                      ? "border-lingo-green" 
                      : lesson.status === 'available' || lesson.status === 'in_progress' 
                        ? "border-lingo-purple"
                        : "border-gray-300"
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="text-4xl">{lesson.icon}</div>
                      <div className="badge-level">Level {lesson.level}</div>
                    </div>
                    <CardTitle className="mt-2">{lesson.title}</CardTitle>
                    <CardDescription>{lesson.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div className="badge-xp">+{lesson.xp} XP</div>
                      
                      {/* Progress bar */}
                      {lesson.status !== 'locked' && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div 
                            className={`h-2.5 rounded-full transition-all ${
                              lesson.status === 'completed' ? 'bg-lingo-green' : 'bg-lingo-purple'
                            }`} 
                            style={{ width: `${lesson.progress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className={`w-full transition ${
                        lesson.status === 'locked' 
                          ? "bg-gray-400" 
                          : lesson.status === 'completed' 
                            ? "bg-lingo-green hover:bg-lingo-green/90" 
                            : "bg-lingo-purple hover:bg-lingo-purple/90"
                      }`}
                      onClick={() => handleLessonClick(lesson)}
                      disabled={lesson.status === 'locked'}
                    >
                      {lesson.status === 'locked' ? (
                        <span className="flex items-center">
                          <Lock className="h-4 w-4 mr-2" />
                          Lesson Locked
                        </span>
                      ) : lesson.status === 'completed' ? (
                        "Practice Again"
                      ) : lesson.progress > 0 ? (
                        `Continue (${Math.round(lesson.progress)}%)`
                      ) : (
                        "Start Lesson"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
