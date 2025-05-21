
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Provider } from "@supabase/supabase-js";
import Cookies from "js-cookie";

// Types for user and authentication
type User = {
  id: string;
  email: string;
  username?: string;
  xp?: number;
  level?: number;
  streak?: number;
  created_at?: string;
};

type Profile = {
  id: string;
  username: string | null;
  xp: number;
  level: number;
  streak: number;
  learning_language: string;
  ui_language: string;
  last_active_date: string | null;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateStreak: () => Promise<void>;
};

// Cookie settings
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: window.location.protocol === "https:",
  sameSite: "strict" as const
};

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cookieConsentShown, setCookieConsentShown] = useState<boolean>(false);

  // Fetch the user's profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        // Set profile data in cookies for persistence
        Cookies.set('user_profile', JSON.stringify(data), COOKIE_OPTIONS);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Refresh the user's profile data
  const refreshProfile = async () => {
    if (!user?.id) return;
    await fetchProfile(user.id);
  };

  // Update user streak
  const updateStreak = async () => {
    if (!user?.id || !profile) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const lastActiveDate = profile.last_active_date;
      
      let newStreak = profile.streak;
      let streakUpdated = false;
      
      // If last active date was yesterday, increment streak
      if (lastActiveDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastActiveDate === yesterdayStr) {
          newStreak += 1;
          streakUpdated = true;
        } else if (lastActiveDate !== today) {
          // If last active date was not yesterday or today, reset streak
          newStreak = 1;
          streakUpdated = true;
        }
      } else {
        // First activity ever
        newStreak = 1;
        streakUpdated = true;
      }
      
      if (streakUpdated || lastActiveDate !== today) {
        const { error } = await supabase
          .from('profiles')
          .update({
            streak: newStreak,
            last_active_date: today
          })
          .eq('id', user.id);
          
        if (error) throw error;
        
        // Update local profile
        setProfile({
          ...profile,
          streak: newStreak,
          last_active_date: today
        });
        
        // Update profile cookies
        Cookies.set('user_profile', JSON.stringify({
          ...profile,
          streak: newStreak,
          last_active_date: today
        }), COOKIE_OPTIONS);
        
        if (streakUpdated && newStreak > 1) {
          toast.success(`🔥 ${newStreak} day streak! Keep it up!`);
        }
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  // Check for auth state changes
  useEffect(() => {
    setIsLoading(true);

    // Show cookie consent if it hasn't been shown before
    const consentGiven = localStorage.getItem('cookie_consent');
    if (!consentGiven && !cookieConsentShown) {
      toast("This site uses cookies to enhance your learning experience.", {
        description: "By continuing to use this site, you consent to our use of cookies.",
        action: {
          label: "Accept",
          onClick: () => {
            localStorage.setItem('cookie_consent', 'true');
            setCookieConsentShown(true);
          }
        },
        duration: 10000
      });
      setCookieConsentShown(true);
    }

    // Check cookies first for quick restoration
    const storedUser = Cookies.get('user_session');
    const storedProfile = Cookies.get('user_profile');
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        Cookies.remove('user_session');
      }
    }
    
    if (storedProfile) {
      try {
        const parsedProfile = JSON.parse(storedProfile);
        setProfile(parsedProfile);
      } catch (e) {
        Cookies.remove('user_profile');
      }
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user;
        
        if (currentUser) {
          const userData = {
            id: currentUser.id,
            email: currentUser.email || '',
          };
          
          setUser(userData);
          Cookies.set('user_session', JSON.stringify(userData), COOKIE_OPTIONS);
          
          // Fetch profile with setTimeout to avoid potential infinite loops
          setTimeout(() => {
            fetchProfile(currentUser.id);
          }, 0);
          
        } else {
          setUser(null);
          setProfile(null);
          Cookies.remove('user_session');
          Cookies.remove('user_profile');
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user;
      
      if (currentUser) {
        const userData = {
          id: currentUser.id,
          email: currentUser.email || '',
        };
        
        setUser(userData);
        Cookies.set('user_session', JSON.stringify(userData), COOKIE_OPTIONS);
        fetchProfile(currentUser.id);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Set cookies for persistent login
      if (data.user) {
        const userData = {
          id: data.user.id,
          email: data.user.email || '',
        };
        Cookies.set('user_session', JSON.stringify(userData), COOKIE_OPTIONS);
      }
      
      toast.success("Successfully logged in!");
      
      // Update streak on login
      if (data.user) {
        setTimeout(() => {
          updateStreak();
        }, 1000);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google' as Provider,
        options: {
          redirectTo: window.location.origin,
        },
      });
      
      if (error) throw error;
      
      // Cookies will be set by onAuthStateChange when redirected back
    } catch (error: any) {
      toast.error(error.message || "Failed to login with Google");
      throw error;
    }
  };

  // Signup function
  const signup = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    try {
      // Configure Supabase to not require email verification
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: username,
          },
          emailRedirectTo: undefined,
        },
      });
      
      if (error) throw error;
      
      if (data.user) {
        const userData = {
          id: data.user.id,
          email: data.user.email || '',
        };
        Cookies.set('user_session', JSON.stringify(userData), COOKIE_OPTIONS);
        
        // Initialize streak
        setTimeout(() => {
          updateStreak();
        }, 1000);
      }
      
      toast.success("Account created successfully! Welcome aboard!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear cookies on logout
      Cookies.remove('user_session');
      Cookies.remove('user_profile');
      
      toast.success("Successfully logged out");
    } catch (error: any) {
      toast.error(error.message || "Failed to logout");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        signup,
        logout,
        refreshProfile,
        updateStreak,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
