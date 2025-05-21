
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Check, ArrowRight, Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Exercise types
type ExerciseType = 'multiple-choice' | 'translation' | 'fill-blank';

interface Exercise {
  id: number;
  type: ExerciseType;
  question: string;
  options?: string[];
  correctAnswer: string;
  userAnswer?: string;
}

// Generate exercises for a lesson
const generateExercises = (lessonTitle: string): Exercise[] => {
  const baseExercises: Exercise[] = [
    {
      id: 1,
      type: 'multiple-choice',
      question: `How would you say "Hello" in Spanish?`,
      options: ['Hola', 'Adiós', 'Gracias', 'Por favor'],
      correctAnswer: 'Hola'
    },
    {
      id: 2,
      type: 'multiple-choice',
      question: `Which means "Thank you" in Spanish?`,
      options: ['Por favor', 'Gracias', 'Buenos días', 'De nada'],
      correctAnswer: 'Gracias'
    },
    {
      id: 3,
      type: 'translation',
      question: `Translate "Good morning" to Spanish`,
      correctAnswer: 'Buenos días'
    },
    {
      id: 4,
      type: 'fill-blank',
      question: `Complete the phrase: "¿_____ estás?"`,
      options: ['Qué', 'Cómo', 'Dónde', 'Quién'],
      correctAnswer: 'Cómo'
    },
    {
      id: 5,
      type: 'translation',
      question: `Translate "I want water" to Spanish`,
      correctAnswer: 'Quiero agua'
    }
  ];

  // Customize based on lesson title (simplified)
  if (lessonTitle.includes("Food")) {
    baseExercises[0].question = `How would you say "Apple" in Spanish?`;
    baseExercises[0].options = ['Manzana', 'Banana', 'Naranja', 'Uva'];
    baseExercises[0].correctAnswer = 'Manzana';
    
    baseExercises[1].question = `Which means "I am hungry" in Spanish?`;
    baseExercises[1].options = ['Tengo sed', 'Tengo hambre', 'Quiero comer', 'Me gusta la comida'];
    baseExercises[1].correctAnswer = 'Tengo hambre';
  }
  
  return baseExercises;
};

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentAnswers, setCurrentAnswers] = useState<Record<number, string>>({});
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

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

  // Initialize exercises once lesson is loaded
  useEffect(() => {
    if (lesson && lesson.title) {
      setExercises(generateExercises(lesson.title));
    }
  }, [lesson]);

  // Initialize progress from database
  useEffect(() => {
    if (progress) {
      // If lesson was completed, initialize to completed state
      if (progress.status === 'completed') {
        setIsCompleted(true);
      } 
      // If in progress, try to restore position
      else if (progress.progress > 0) {
        const stepPosition = Math.floor((progress.progress / 100) * exercises.length);
        setCurrentStep(Math.min(stepPosition, exercises.length - 1));
      }
    }
  }, [progress, exercises.length]);

  // Handle answer input
  const handleAnswerChange = (answer: string) => {
    setCurrentAnswers({
      ...currentAnswers,
      [currentStep]: answer
    });
  };

  // Check if answer is correct
  const checkAnswer = () => {
    const currentExercise = exercises[currentStep];
    const userAnswer = currentAnswers[currentStep] || '';
    
    if (!currentExercise) return;

    let isCorrect = false;
    
    if (currentExercise.type === 'translation') {
      // For translation, be more lenient (case insensitive, trim)
      isCorrect = userAnswer.trim().toLowerCase() === currentExercise.correctAnswer.toLowerCase();
    } else {
      // For multiple choice and fill-blank, exact match
      isCorrect = userAnswer === currentExercise.correctAnswer;
    }
    
    setIsAnswerCorrect(isCorrect);
    setShowAnswer(true);
    
    if (isCorrect) {
      toast.success("Correct! Well done!");
    } else {
      toast.error(`Not quite. The correct answer is: ${currentExercise.correctAnswer}`);
    }
    
    // Update the exercise with user answer
    const updatedExercises = [...exercises];
    updatedExercises[currentStep].userAnswer = userAnswer;
    setExercises(updatedExercises);
  };

  // Calculate progress percentage
  const progressPercent = Math.round((currentStep / exercises.length) * 100);

  // Update progress in the database
  const updateProgress = async () => {
    if (!user?.id || !lessonId || isCompleted || savingProgress) return;

    setSavingProgress(true);
    try {
      const progressUpdate = {
        progress: progressPercent,
      };

      // Update as completed if all exercises are done
      if (currentStep >= exercises.length) {
        setIsCompleted(true);
        Object.assign(progressUpdate, {
          status: 'completed' as const,
          completed_at: new Date().toISOString(),
        });
        
        // Only add XP if the lesson was not previously completed
        if (progress && progress.status !== 'completed') {
          // Add XP to the user's profile
          if (lesson) {
            await supabase
              .from('profiles')
              .update({
                xp: progress ? ((profile?.xp || 0) + lesson.xp) : (profile?.xp || 0) + lesson.xp,
              })
              .eq('id', user.id);
          }
        }
      }

      await supabase
        .from('user_lesson_progress')
        .update(progressUpdate)
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId);

      // Refresh user profile to update XP and other stats
      if (currentStep >= exercises.length) {
        await refreshProfile();
        toast.success(`Congratulations! You've earned ${lesson?.xp} XP!`);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error("Failed to save your progress");
    } finally {
      setSavingProgress(false);
    }
  };

  // Handle next step (after answering)
  const handleNextStep = async () => {
    // If already showing answer, proceed to next step
    if (showAnswer) {
      setShowAnswer(false);
      setIsAnswerCorrect(null);
      
      if (currentStep < exercises.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Lesson complete
        await updateProgress();
      }
    } else {
      // Check answer first
      checkAnswer();
    }
  };

  // Update progress whenever currentStep changes
  useEffect(() => {
    updateProgress();
  }, [currentStep]);

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
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p>Loading lesson...</p>
        </div>
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

  const currentExercise = exercises[currentStep];

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
            {isCompleted ? "Lesson Complete!" : `Exercise ${currentStep + 1} of ${exercises.length}`}
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
          ) : currentExercise ? (
            <div className="min-h-[300px]">
              {/* Exercise question */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">{currentExercise.question}</h3>
                
                {/* Different exercise types */}
                {currentExercise.type === 'multiple-choice' && (
                  <RadioGroup
                    value={currentAnswers[currentStep] || ''}
                    onValueChange={handleAnswerChange}
                    className="space-y-3"
                    disabled={showAnswer}
                  >
                    {currentExercise.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={option}
                          id={`option-${index}`}
                          className={showAnswer ? 
                            option === currentExercise.correctAnswer ? 
                              "border-green-500" : 
                              option === currentAnswers[currentStep] && option !== currentExercise.correctAnswer ?
                                "border-red-500" : "" : ""}
                        />
                        <Label 
                          htmlFor={`option-${index}`}
                          className={showAnswer ? 
                            option === currentExercise.correctAnswer ? 
                              "text-green-500 font-bold" : 
                              option === currentAnswers[currentStep] && option !== currentExercise.correctAnswer ?
                                "text-red-500" : "" : ""}
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                
                {currentExercise.type === 'fill-blank' && (
                  <RadioGroup
                    value={currentAnswers[currentStep] || ''}
                    onValueChange={handleAnswerChange}
                    className="space-y-3"
                    disabled={showAnswer}
                  >
                    {currentExercise.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={option}
                          id={`fill-${index}`}
                          className={showAnswer ? 
                            option === currentExercise.correctAnswer ? 
                              "border-green-500" : 
                              option === currentAnswers[currentStep] && option !== currentExercise.correctAnswer ?
                                "border-red-500" : "" : ""}
                        />
                        <Label 
                          htmlFor={`fill-${index}`}
                          className={showAnswer ? 
                            option === currentExercise.correctAnswer ? 
                              "text-green-500 font-bold" : 
                              option === currentAnswers[currentStep] && option !== currentExercise.correctAnswer ?
                                "text-red-500" : "" : ""}
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                
                {currentExercise.type === 'translation' && (
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Type your answer here..."
                      value={currentAnswers[currentStep] || ''}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      disabled={showAnswer}
                      className={showAnswer ? (isAnswerCorrect ? "border-green-500" : "border-red-500") : ""}
                    />
                    {showAnswer && (
                      <div className={`text-sm mt-2 ${isAnswerCorrect ? "text-green-600" : "text-red-600"}`}>
                        {isAnswerCorrect 
                          ? "✓ Correct!" 
                          : `✗ Correct answer: ${currentExercise.correctAnswer}`}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Answer feedback when shown */}
              {showAnswer && (
                <div className={`p-3 rounded-md mt-4 ${isAnswerCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {isAnswerCorrect 
                    ? "Great job! Your answer is correct." 
                    : `That's not quite right. The correct answer is: ${currentExercise.correctAnswer}`}
                </div>
              )}
            </div>
          ) : (
            <div className="min-h-[200px] flex items-center justify-center">
              <p>Loading exercises...</p>
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
              disabled={!currentExercise || (!showAnswer && !currentAnswers[currentStep])}
            >
              {showAnswer ? (
                currentStep === exercises.length - 1 ? (
                  "Complete Lesson"
                ) : (
                  <span className="flex items-center">
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )
              ) : (
                "Check Answer"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
