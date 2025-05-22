
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

// Define types for lesson content
type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
};

type LessonContentByLanguage = {
  [key: string]: {
    title: string;
    description: string;
    questions: Question[];
  }
};

// Comprehensive lesson content for different languages
const lessonsContent: Record<string, LessonContentByLanguage> = {
  "basics-1": {
    spanish: {
      title: "Spanish Basics 1",
      description: "Learn essential Spanish words and phrases",
      questions: [
        {
          id: 1,
          question: "How do you say 'hello' in Spanish?",
          options: ["Hola", "Adiós", "Gracias", "Buenos días"],
          correctAnswer: "Hola"
        },
        {
          id: 2,
          question: "What does 'Buenos días' mean?",
          options: ["Good morning", "Good night", "Good afternoon", "Goodbye"],
          correctAnswer: "Good morning"
        },
        {
          id: 3,
          question: "How do you say 'thank you' in Spanish?",
          options: ["Gracias", "Por favor", "De nada", "Lo siento"],
          correctAnswer: "Gracias"
        }
      ]
    },
    french: {
      title: "French Basics 1",
      description: "Learn essential French words and phrases",
      questions: [
        {
          id: 1,
          question: "How do you say 'hello' in French?",
          options: ["Bonjour", "Au revoir", "Merci", "S'il vous plaît"],
          correctAnswer: "Bonjour"
        },
        {
          id: 2,
          question: "What does 'Bonne nuit' mean?",
          options: ["Good night", "Good morning", "Good afternoon", "Goodbye"],
          correctAnswer: "Good night"
        },
        {
          id: 3,
          question: "How do you say 'thank you' in French?",
          options: ["Merci", "S'il vous plaît", "De rien", "Pardon"],
          correctAnswer: "Merci"
        }
      ]
    },
    german: {
      title: "German Basics 1",
      description: "Learn essential German words and phrases",
      questions: [
        {
          id: 1,
          question: "How do you say 'hello' in German?",
          options: ["Hallo", "Auf Wiedersehen", "Danke", "Bitte"],
          correctAnswer: "Hallo"
        },
        {
          id: 2,
          question: "What does 'Guten Morgen' mean?",
          options: ["Good morning", "Good night", "Good afternoon", "Goodbye"],
          correctAnswer: "Good morning"
        },
        {
          id: 3,
          question: "How do you say 'thank you' in German?",
          options: ["Danke", "Bitte", "Entschuldigung", "Tschüss"],
          correctAnswer: "Danke"
        }
      ]
    },
    italian: {
      title: "Italian Basics 1",
      description: "Learn essential Italian words and phrases",
      questions: [
        {
          id: 1,
          question: "How do you say 'hello' in Italian?",
          options: ["Ciao", "Arrivederci", "Grazie", "Buongiorno"],
          correctAnswer: "Ciao"
        },
        {
          id: 2,
          question: "What does 'Buona notte' mean?",
          options: ["Good night", "Good morning", "Good afternoon", "Goodbye"],
          correctAnswer: "Good night"
        },
        {
          id: 3,
          question: "How do you say 'thank you' in Italian?",
          options: ["Grazie", "Per favore", "Prego", "Scusa"],
          correctAnswer: "Grazie"
        }
      ]
    },
    japanese: {
      title: "Japanese Basics 1",
      description: "Learn essential Japanese words and phrases",
      questions: [
        {
          id: 1,
          question: "How do you say 'hello' in Japanese?",
          options: ["こんにちは (Konnichiwa)", "さようなら (Sayōnara)", "ありがとう (Arigatō)", "お願いします (Onegaishimasu)"],
          correctAnswer: "こんにちは (Konnichiwa)"
        },
        {
          id: 2,
          question: "What does 'おやすみなさい (Oyasuminasai)' mean?",
          options: ["Good night", "Good morning", "Good afternoon", "Goodbye"],
          correctAnswer: "Good night"
        },
        {
          id: 3,
          question: "How do you say 'thank you' in Japanese?",
          options: ["ありがとう (Arigatō)", "お願いします (Onegaishimasu)", "どういたしまして (Dō itashimashite)", "すみません (Sumimasen)"],
          correctAnswer: "ありがとう (Arigatō)"
        }
      ]
    }
  },
  "phrases": {
    spanish: {
      title: "Spanish Common Phrases",
      description: "Learn everyday Spanish expressions",
      questions: [
        {
          id: 1,
          question: "What does '¿Cómo estás?' mean?",
          options: ["How are you?", "What's your name?", "Where are you from?", "How old are you?"],
          correctAnswer: "How are you?"
        },
        {
          id: 2,
          question: "How do you ask 'What's your name?' in Spanish?",
          options: ["¿Cómo te llamas?", "¿De dónde eres?", "¿Cuántos años tienes?", "¿Qué hora es?"],
          correctAnswer: "¿Cómo te llamas?"
        },
        {
          id: 3,
          question: "What does 'Mucho gusto' mean?",
          options: ["Nice to meet you", "See you later", "Have a good day", "How are you?"],
          correctAnswer: "Nice to meet you"
        }
      ]
    },
    french: {
      title: "French Common Phrases",
      description: "Learn everyday French expressions",
      questions: [
        {
          id: 1,
          question: "What does 'Comment ça va?' mean?",
          options: ["How are you?", "What's your name?", "Where are you from?", "How old are you?"],
          correctAnswer: "How are you?"
        },
        {
          id: 2,
          question: "How do you ask 'What's your name?' in French?",
          options: ["Comment vous appelez-vous?", "D'où venez-vous?", "Quel âge avez-vous?", "Quelle heure est-il?"],
          correctAnswer: "Comment vous appelez-vous?"
        },
        {
          id: 3,
          question: "What does 'Enchanté' mean?",
          options: ["Nice to meet you", "See you later", "Have a good day", "How are you?"],
          correctAnswer: "Nice to meet you"
        }
      ]
    },
    german: {
      title: "German Common Phrases",
      description: "Learn everyday German expressions",
      questions: [
        {
          id: 1,
          question: "What does 'Wie geht es dir?' mean?",
          options: ["How are you?", "What's your name?", "Where are you from?", "How old are you?"],
          correctAnswer: "How are you?"
        },
        {
          id: 2,
          question: "How do you ask 'What's your name?' in German?",
          options: ["Wie heißt du?", "Woher kommst du?", "Wie alt bist du?", "Wie spät ist es?"],
          correctAnswer: "Wie heißt du?"
        },
        {
          id: 3,
          question: "What does 'Freut mich' mean?",
          options: ["Nice to meet you", "See you later", "Have a good day", "How are you?"],
          correctAnswer: "Nice to meet you"
        }
      ]
    },
    italian: {
      title: "Italian Common Phrases",
      description: "Learn everyday Italian expressions",
      questions: [
        {
          id: 1,
          question: "What does 'Come stai?' mean?",
          options: ["How are you?", "What's your name?", "Where are you from?", "How old are you?"],
          correctAnswer: "How are you?"
        },
        {
          id: 2,
          question: "How do you ask 'What's your name?' in Italian?",
          options: ["Come ti chiami?", "Di dove sei?", "Quanti anni hai?", "Che ora è?"],
          correctAnswer: "Come ti chiami?"
        },
        {
          id: 3,
          question: "What does 'Piacere di conoscerti' mean?",
          options: ["Nice to meet you", "See you later", "Have a good day", "How are you?"],
          correctAnswer: "Nice to meet you"
        }
      ]
    },
    japanese: {
      title: "Japanese Common Phrases",
      description: "Learn everyday Japanese expressions",
      questions: [
        {
          id: 1,
          question: "What does 'お元気ですか？ (O genki desu ka?)' mean?",
          options: ["How are you?", "What's your name?", "Where are you from?", "How old are you?"],
          correctAnswer: "How are you?"
        },
        {
          id: 2,
          question: "How do you ask 'What's your name?' in Japanese?",
          options: ["お名前は何ですか？ (Onamae wa nan desu ka?)", "どこから来ましたか？ (Doko kara kimashita ka?)", "何歳ですか？ (Nan sai desu ka?)", "今何時ですか？ (Ima nanji desu ka?)"],
          correctAnswer: "お名前は何ですか？ (Onamae wa nan desu ka?)"
        },
        {
          id: 3,
          question: "What does 'はじめまして (Hajimemashite)' mean?",
          options: ["Nice to meet you", "See you later", "Have a good day", "How are you?"],
          correctAnswer: "Nice to meet you"
        }
      ]
    }
  },
  "food": {
    spanish: {
      title: "Spanish Food Vocabulary",
      description: "Learn Spanish food and drink words",
      questions: [
        {
          id: 1,
          question: "What is 'manzana' in English?",
          options: ["Apple", "Banana", "Orange", "Strawberry"],
          correctAnswer: "Apple"
        },
        {
          id: 2,
          question: "What is 'agua' in English?",
          options: ["Water", "Wine", "Beer", "Juice"],
          correctAnswer: "Water"
        },
        {
          id: 3,
          question: "What does 'huevo' mean?",
          options: ["Egg", "Cheese", "Bread", "Meat"],
          correctAnswer: "Egg"
        }
      ]
    },
    french: {
      title: "French Food Vocabulary",
      description: "Learn French food and drink words",
      questions: [
        {
          id: 1,
          question: "What is 'pomme' in English?",
          options: ["Apple", "Banana", "Orange", "Strawberry"],
          correctAnswer: "Apple"
        },
        {
          id: 2,
          question: "What is 'eau' in English?",
          options: ["Water", "Wine", "Beer", "Juice"],
          correctAnswer: "Water"
        },
        {
          id: 3,
          question: "What does 'œuf' mean?",
          options: ["Egg", "Cheese", "Bread", "Meat"],
          correctAnswer: "Egg"
        }
      ]
    },
    german: {
      title: "German Food Vocabulary",
      description: "Learn German food and drink words",
      questions: [
        {
          id: 1,
          question: "What is 'Apfel' in English?",
          options: ["Apple", "Banana", "Orange", "Strawberry"],
          correctAnswer: "Apple"
        },
        {
          id: 2,
          question: "What is 'Wasser' in English?",
          options: ["Water", "Wine", "Beer", "Juice"],
          correctAnswer: "Water"
        },
        {
          id: 3,
          question: "What does 'Ei' mean?",
          options: ["Egg", "Cheese", "Bread", "Meat"],
          correctAnswer: "Egg"
        }
      ]
    },
    italian: {
      title: "Italian Food Vocabulary",
      description: "Learn Italian food and drink words",
      questions: [
        {
          id: 1,
          question: "What is 'mela' in English?",
          options: ["Apple", "Banana", "Orange", "Strawberry"],
          correctAnswer: "Apple"
        },
        {
          id: 2,
          question: "What is 'acqua' in English?",
          options: ["Water", "Wine", "Beer", "Juice"],
          correctAnswer: "Water"
        },
        {
          id: 3,
          question: "What does 'uovo' mean?",
          options: ["Egg", "Cheese", "Bread", "Meat"],
          correctAnswer: "Egg"
        }
      ]
    },
    japanese: {
      title: "Japanese Food Vocabulary",
      description: "Learn Japanese food and drink words",
      questions: [
        {
          id: 1,
          question: "What is 'りんご (ringo)' in English?",
          options: ["Apple", "Banana", "Orange", "Strawberry"],
          correctAnswer: "Apple"
        },
        {
          id: 2,
          question: "What is '水 (mizu)' in English?",
          options: ["Water", "Wine", "Beer", "Juice"],
          correctAnswer: "Water"
        },
        {
          id: 3,
          question: "What does '卵 (tamago)' mean?",
          options: ["Egg", "Cheese", "Bread", "Meat"],
          correctAnswer: "Egg"
        }
      ]
    }
  },
  "animals": {
    spanish: {
      title: "Spanish Animal Names",
      description: "Learn animal names in Spanish",
      questions: [
        {
          id: 1,
          question: "What is 'perro' in English?",
          options: ["Dog", "Cat", "Bird", "Fish"],
          correctAnswer: "Dog"
        },
        {
          id: 2,
          question: "What is 'gato' in English?",
          options: ["Cat", "Dog", "Bird", "Mouse"],
          correctAnswer: "Cat"
        },
        {
          id: 3,
          question: "What does 'caballo' mean?",
          options: ["Horse", "Cow", "Sheep", "Pig"],
          correctAnswer: "Horse"
        }
      ]
    },
    french: {
      title: "French Animal Names",
      description: "Learn animal names in French",
      questions: [
        {
          id: 1,
          question: "What is 'chien' in English?",
          options: ["Dog", "Cat", "Bird", "Fish"],
          correctAnswer: "Dog"
        },
        {
          id: 2,
          question: "What is 'chat' in English?",
          options: ["Cat", "Dog", "Bird", "Mouse"],
          correctAnswer: "Cat"
        },
        {
          id: 3,
          question: "What does 'cheval' mean?",
          options: ["Horse", "Cow", "Sheep", "Pig"],
          correctAnswer: "Horse"
        }
      ]
    },
    german: {
      title: "German Animal Names",
      description: "Learn animal names in German",
      questions: [
        {
          id: 1,
          question: "What is 'Hund' in English?",
          options: ["Dog", "Cat", "Bird", "Fish"],
          correctAnswer: "Dog"
        },
        {
          id: 2,
          question: "What is 'Katze' in English?",
          options: ["Cat", "Dog", "Bird", "Mouse"],
          correctAnswer: "Cat"
        },
        {
          id: 3,
          question: "What does 'Pferd' mean?",
          options: ["Horse", "Cow", "Sheep", "Pig"],
          correctAnswer: "Horse"
        }
      ]
    },
    italian: {
      title: "Italian Animal Names",
      description: "Learn animal names in Italian",
      questions: [
        {
          id: 1,
          question: "What is 'cane' in English?",
          options: ["Dog", "Cat", "Bird", "Fish"],
          correctAnswer: "Dog"
        },
        {
          id: 2,
          question: "What is 'gatto' in English?",
          options: ["Cat", "Dog", "Bird", "Mouse"],
          correctAnswer: "Cat"
        },
        {
          id: 3,
          question: "What does 'cavallo' mean?",
          options: ["Horse", "Cow", "Sheep", "Pig"],
          correctAnswer: "Horse"
        }
      ]
    },
    japanese: {
      title: "Japanese Animal Names",
      description: "Learn animal names in Japanese",
      questions: [
        {
          id: 1,
          question: "What is '犬 (inu)' in English?",
          options: ["Dog", "Cat", "Bird", "Fish"],
          correctAnswer: "Dog"
        },
        {
          id: 2,
          question: "What is '猫 (neko)' in English?",
          options: ["Cat", "Dog", "Bird", "Mouse"],
          correctAnswer: "Cat"
        },
        {
          id: 3,
          question: "What does '馬 (uma)' mean?",
          options: ["Horse", "Cow", "Sheep", "Pig"],
          correctAnswer: "Horse"
        }
      ]
    }
  },
  "verbs": {
    spanish: {
      title: "Spanish Present Tense",
      description: "Learn basic Spanish verb conjugations",
      questions: [
        {
          id: 1,
          question: "What is 'I speak' in Spanish?",
          options: ["Yo hablo", "Tú hablas", "Él habla", "Nosotros hablamos"],
          correctAnswer: "Yo hablo"
        },
        {
          id: 2,
          question: "What is 'you eat' (informal singular) in Spanish?",
          options: ["Tú comes", "Yo como", "Él come", "Nosotros comemos"],
          correctAnswer: "Tú comes"
        },
        {
          id: 3,
          question: "What is 'she lives' in Spanish?",
          options: ["Ella vive", "Yo vivo", "Tú vives", "Nosotros vivimos"],
          correctAnswer: "Ella vive"
        }
      ]
    },
    french: {
      title: "French Present Tense",
      description: "Learn basic French verb conjugations",
      questions: [
        {
          id: 1,
          question: "What is 'I speak' in French?",
          options: ["Je parle", "Tu parles", "Il parle", "Nous parlons"],
          correctAnswer: "Je parle"
        },
        {
          id: 2,
          question: "What is 'you eat' (informal singular) in French?",
          options: ["Tu manges", "Je mange", "Il mange", "Nous mangeons"],
          correctAnswer: "Tu manges"
        },
        {
          id: 3,
          question: "What is 'she lives' in French?",
          options: ["Elle habite", "J'habite", "Tu habites", "Nous habitons"],
          correctAnswer: "Elle habite"
        }
      ]
    },
    german: {
      title: "German Present Tense",
      description: "Learn basic German verb conjugations",
      questions: [
        {
          id: 1,
          question: "What is 'I speak' in German?",
          options: ["Ich spreche", "Du sprichst", "Er spricht", "Wir sprechen"],
          correctAnswer: "Ich spreche"
        },
        {
          id: 2,
          question: "What is 'you eat' (informal singular) in German?",
          options: ["Du isst", "Ich esse", "Er isst", "Wir essen"],
          correctAnswer: "Du isst"
        },
        {
          id: 3,
          question: "What is 'she lives' in German?",
          options: ["Sie wohnt", "Ich wohne", "Du wohnst", "Wir wohnen"],
          correctAnswer: "Sie wohnt"
        }
      ]
    },
    italian: {
      title: "Italian Present Tense",
      description: "Learn basic Italian verb conjugations",
      questions: [
        {
          id: 1,
          question: "What is 'I speak' in Italian?",
          options: ["Io parlo", "Tu parli", "Lui parla", "Noi parliamo"],
          correctAnswer: "Io parlo"
        },
        {
          id: 2,
          question: "What is 'you eat' (informal singular) in Italian?",
          options: ["Tu mangi", "Io mangio", "Lui mangia", "Noi mangiamo"],
          correctAnswer: "Tu mangi"
        },
        {
          id: 3,
          question: "What is 'she lives' in Italian?",
          options: ["Lei vive", "Io vivo", "Tu vivi", "Noi viviamo"],
          correctAnswer: "Lei vive"
        }
      ]
    },
    japanese: {
      title: "Japanese Basic Verbs",
      description: "Learn basic Japanese verb forms",
      questions: [
        {
          id: 1,
          question: "What is 'I speak' in Japanese?",
          options: ["私は話します (Watashi wa hanashimasu)", "あなたは話します (Anata wa hanashimasu)", "彼は話します (Kare wa hanashimasu)", "私たちは話します (Watashitachi wa hanashimasu)"],
          correctAnswer: "私は話します (Watashi wa hanashimasu)"
        },
        {
          id: 2,
          question: "What is 'you eat' in Japanese?",
          options: ["あなたは食べます (Anata wa tabemasu)", "私は食べます (Watashi wa tabemasu)", "彼は食べます (Kare wa tabemasu)", "私たちは食べます (Watashitachi wa tabemasu)"],
          correctAnswer: "あなたは食べます (Anata wa tabemasu)"
        },
        {
          id: 3,
          question: "What is 'she lives' in Japanese?",
          options: ["彼女は住んでいます (Kanojo wa sunde imasu)", "私は住んでいます (Watashi wa sunde imasu)", "あなたは住んでいます (Anata wa sunde imasu)", "私たちは住んでいます (Watashitachi wa sunde imasu)"],
          correctAnswer: "彼女は住んでいます (Kanojo wa sunde imasu)"
        }
      ]
    }
  }
};

export default function LessonDetail() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { learningLanguage } = useLanguage();
  const { toast } = useToast();
  
  const [lesson, setLesson] = useState<any | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [progress, setProgress] = useState(0);
  const [userProgress, setUserProgress] = useState<any | null>(null);
  
  // Get lesson content based on selected language
  const getLessonContent = () => {
    if (!lessonId) return null;
    
    const lessonContent = lessonsContent[lessonId];
    if (!lessonContent) return null;
    
    // Default to Spanish if selected language not available
    return lessonContent[learningLanguage] || lessonContent.spanish;
  };
  
  const content = getLessonContent();
  const questions = content?.questions || [];
  
  // Function to calculate progress percentage
  const calculateProgressPercentage = (questionIndex: number, total: number) => {
    return Math.round(((questionIndex) / total) * 100);
  };
  
  // Fetch lesson and user progress data
  useEffect(() => {
    const fetchLessonAndProgress = async () => {
      if (!lessonId || !user) return;
      
      try {
        // Get lesson data
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .single();
          
        if (lessonError) throw lessonError;
        setLesson(lessonData);
        
        // Get user progress for this lesson
        const { data: progressData, error: progressError } = await supabase
          .from('user_lesson_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId)
          .single();
          
        if (progressError && progressError.code !== 'PGRST116') throw progressError;
        
        // Set progress and current question
        if (progressData) {
          setUserProgress(progressData);
          setProgress(progressData.progress);
          
          // If lesson was in progress, resume from saved position
          if (progressData.progress > 0 && progressData.progress < 100) {
            const questionIndex = Math.floor((progressData.progress / 100) * questions.length);
            setCurrentQuestionIndex(Math.min(questionIndex, questions.length - 1));
          }
        } else {
          // If no progress record, create one with 0% progress
          const { error: insertError } = await supabase
            .from('user_lesson_progress')
            .insert({
              user_id: user.id,
              lesson_id: lessonId,
              status: 'available',
              progress: 0,
              started_at: new Date().toISOString()
            });
            
          if (insertError) throw insertError;
        }
      } catch (error) {
        console.error('Error fetching lesson data:', error);
        toast({
          title: "Error",
          description: "Could not load lesson data",
          variant: "destructive"
        });
      }
    };
    
    fetchLessonAndProgress();
  }, [lessonId, user, toast, questions.length]);
  
  // Handle answer selection
  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    setIsAnswerCorrect(isCorrect);
  };
  
  // Handle moving to next question
  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswerCorrect(null);
      
      // Calculate and update progress
      const newProgress = calculateProgressPercentage(currentQuestionIndex + 1, questions.length);
      setProgress(newProgress);
      
      // Save progress to database
      if (user) {
        await supabase
          .from('user_lesson_progress')
          .update({
            progress: newProgress,
            last_attempted_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId);
      }
    } else {
      // Lesson completed
      if (user) {
        // Update lesson as completed
        await supabase
          .from('user_lesson_progress')
          .update({
            status: 'completed',
            progress: 100,
            completed_at: new Date().toISOString(),
            last_attempted_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId);
          
        // Update user XP and streak
        const { data: profileData } = await supabase
          .from('profiles')
          .select('xp, streak, last_active_date')
          .eq('id', user.id)
          .single();
          
        if (profileData) {
          // Calculate if streak should be incremented
          const today = new Date().toISOString().split('T')[0];
          const lastActive = profileData.last_active_date;
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayString = yesterday.toISOString().split('T')[0];
          
          // Get XP value from the lesson
          const { data: lessonData } = await supabase
            .from('lessons')
            .select('xp')
            .eq('id', lessonId)
            .single();
            
          const xpToAdd = lessonData?.xp || 10;
          
          let streakValue = profileData.streak;
          
          // If last active was yesterday or today, keep the streak
          if (lastActive === yesterdayString || lastActive === today) {
            streakValue += 1;
          } else if (lastActive !== today) {
            // If not active yesterday and not already logged in today, reset streak to 1
            streakValue = 1;
          }
          
          // Update profile with new XP and streak
          await supabase
            .from('profiles')
            .update({
              xp: profileData.xp + xpToAdd,
              streak: streakValue,
              last_active_date: today
            })
            .eq('id', user.id);
        }
        
        // Check for the next lesson to unlock
        const { data: currentLessonData } = await supabase
          .from('lessons')
          .select('sequence_order')
          .eq('id', lessonId)
          .single();
          
        if (currentLessonData) {
          // Find the next lesson in sequence
          const { data: nextLessonData } = await supabase
            .from('lessons')
            .select('id')
            .eq('sequence_order', currentLessonData.sequence_order + 1)
            .single();
            
          // If next lesson exists, set its status to available
          if (nextLessonData) {
            await supabase
              .from('user_lesson_progress')
              .update({
                status: 'available'
              })
              .eq('user_id', user.id)
              .eq('lesson_id', nextLessonData.id);
          }
        }
        
        // Show completion message
        toast({
          title: "Lesson Completed!",
          description: "Congratulations! You've completed this lesson.",
        });
        
        // Navigate back to learn page
        navigate('/learn');
      }
    }
  };
  
  if (!lesson || !content) {
    return (
      <div className="container py-8 flex justify-center">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle>Loading lesson...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container py-8 flex justify-center">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>{content.title}</CardTitle>
          <CardDescription>{content.description}</CardDescription>
          <Progress value={progress} className="mt-2" />
          <div className="text-sm text-right mt-1">
            {currentQuestionIndex + 1} of {questions.length} questions
          </div>
        </CardHeader>
        
        <CardContent>
          {questions.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xl font-medium">
                {questions[currentQuestionIndex].question}
              </h3>
              
              <RadioGroup
                value={selectedAnswer || ""}
                onValueChange={handleAnswerSelect}
                className="space-y-3"
              >
                {questions[currentQuestionIndex].options.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-2 border p-3 rounded-md 
                      ${selectedAnswer === option && isAnswerCorrect === true ? "border-green-500 bg-green-50" : ""} 
                      ${selectedAnswer === option && isAnswerCorrect === false ? "border-red-500 bg-red-50" : ""}`}
                  >
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              {isAnswerCorrect !== null && (
                <div className={`p-3 rounded-md ${isAnswerCorrect ? "bg-green-100" : "bg-red-100"}`}>
                  {isAnswerCorrect ? (
                    <p className="text-green-700">Correct! Great job!</p>
                  ) : (
                    <p className="text-red-700">
                      Incorrect. The correct answer is {questions[currentQuestionIndex].correctAnswer}.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/learn')}
          >
            Exit Lesson
          </Button>
          <Button
            disabled={selectedAnswer === null}
            onClick={handleNextQuestion}
          >
            {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Complete Lesson"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
