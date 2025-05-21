
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Check } from "lucide-react";

// Mock exercise data - in a real app, this would be stored in the database
const EXERCISES_COUNT = 5;

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Fetch lesson details
  const { data: lesson, isLoading: isLoadingLesson } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      if (!lessonId) throw new Error("No lesson ID provided");
      
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch lesson progress
  const { data: progress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['lesson-progress', lessonId, user?.id],
    queryFn: async () => {
      if (!lessonId || !user?.id) throw new Error("Missing required data");
      
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!lessonId,
  });

  // Calculate progress percentage
  const progressPercent = (currentStep / EXERCISES_COUNT) * 100;

  // Update progress in the database
  useEffect(() => {
    const updateProgress = async () => {
      if (!user?.id || !lessonId || isCompleted) return;

      try {
        const progressUpdate = {
          progress: progressPercent,
        };

        // Update as completed if all exercises are done
        if (progressPercent === 100) {
          setIsCompleted(true);
          Object.assign(progressUpdate, {
            status: 'completed',
            completed_at: new Date().toISOString(),
          });
        }

        await supabase
          .from('user_lesson_progress')
          .update(progressUpdate)
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId);

        // Refresh user profile to update XP and other stats
        if (progressPercent === 100) {
          // Add XP to the user's profile
          if (lesson) {
            await supabase
              .from('profiles')
              .update({
                xp: progress ? (progress.progress < 100 ? ((profile?.xp || 0) + lesson.xp) : (profile?.xp || 0)) : (profile?.xp || 0) + lesson.xp,
              })
              .eq('id', user.id);
          }
          
          await refreshProfile();
        }
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    };

    updateProgress();
  }, [currentStep, user?.id, lessonId, progressPercent]);

  const handleNextStep = () => {
    if (currentStep < EXERCISES_COUNT) {
      setCurrentStep(currentStep + 1);
    }
  };

  const { data: userProgress } = useQuery({
    queryKey: ['user-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const profile = userProgress;

  if (isLoadingLesson || isLoadingProgress) {
    return (
      <div className="container max-w-5xl py-6 space-y-8 flex justify-center items-center min-h-[50vh]">
        <p>Loading lesson...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container max-w-5xl py-6 space-y-8">
        <h1>Lesson not found</h1>
        <Button onClick={() => navigate("/learn")}>Back to Learn</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-6 space-y-8">
      {/* Lesson header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate("/learn")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">
            {lesson.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span>{lesson.icon}</span>
          <span>+{lesson.xp} XP</span>
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={progressPercent} className="h-2" />
      
      {/* Exercise area */}
      <Card className="lg:w-2/3 mx-auto">
        <CardHeader>
          <CardTitle>
            {isCompleted ? "Lesson Complete!" : `Exercise ${currentStep + 1} of ${EXERCISES_COUNT}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isCompleted ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                <Check className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-xl font-medium text-center">
                Congratulations! You've completed this lesson.
              </p>
              <p className="text-center text-muted-foreground">
                You've earned {lesson.xp} XP. Keep up the great work!
              </p>
            </div>
          ) : (
            <div className="min-h-[200px] flex flex-col items-center justify-center">
              {/* This would contain the actual exercise content */}
              <p className="text-center mb-4">
                This is a simplified demo of exercise {currentStep + 1}.
                In a complete implementation, this area would include interactive
                language exercises like multiple choice, sentence building, etc.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {isCompleted ? (
            <Button 
              className="w-full bg-lingo-green" 
              onClick={() => navigate("/learn")}
            >
              Back to Lessons
            </Button>
          ) : (
            <Button 
              className="w-full bg-lingo-purple" 
              onClick={handleNextStep}
            >
              {currentStep === EXERCISES_COUNT - 1 ? "Complete Lesson" : "Continue"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
