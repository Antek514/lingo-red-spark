
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from '@supabase/supabase-js';
import Cookies from 'js-cookie';

// Types for user and authentication
type UserProfile = {
  id: string;
  username: string;
  email: string;
  xp: number;
  level: number;
  streak: number;
  learning_language: string;
  ui_language: string;
  last_active_date: string;
};

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cookie names
const SESSION_COOKIE = "snapGoSession";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }
      
      if (data) {
        console.log("Profile data received:", data);
        setProfile(data as UserProfile);
      } else {
        console.log("No profile data found");
        setProfile(null);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setProfile(null);
    }
  };

  // Function to refresh profile data
  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, newSession) => {
          console.log("Auth state changed:", event);
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          // Update cookie on auth change
          if (newSession) {
            Cookies.set(SESSION_COOKIE, "authenticated", { 
              expires: 7,
              secure: true,
              sameSite: 'Strict'
            });
          } else {
            Cookies.remove(SESSION_COOKIE);
          }
          
          // Fetch user profile if logged in
          if (newSession?.user) {
            setTimeout(() => {
              fetchUserProfile(newSession.user.id);
            }, 0);
          } else {
            setProfile(null);
          }
        }
      );
      
      // Get initial session
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      
      // Fetch user profile if there's an active session
      if (initialSession?.user) {
        await fetchUserProfile(initialSession.user.id);
      }
      
      setIsLoading(false);
      
      // Cleanup
      return () => {
        subscription.unsubscribe();
      };
    };
    
    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Authentication state will be updated by the listener
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: username
          }
        }
      });
      
      if (error) throw error;
      
      // Authentication state will be updated by the listener
      // The handle_new_user database trigger will create the profile
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      Cookies.remove(SESSION_COOKIE);
      // Auth state listener will handle the rest
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        profile,
        isLoading, 
        login, 
        signup, 
        logout,
        isAuthenticated: !!user,
        refreshProfile
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
