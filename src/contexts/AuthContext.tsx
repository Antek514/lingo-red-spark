
import { createContext, useContext, useEffect, useState } from "react";

// Types for user and authentication
type User = {
  id: string;
  username: string;
  email: string;
  xp: number;
  level: number;
  streak: number;
  createdAt: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

// Mock user data - in a real app, this would come from a database
const MOCK_USER: User = {
  id: "1",
  username: "lingoLearner",
  email: "user@example.com",
  xp: 750,
  level: 5,
  streak: 3,
  createdAt: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real app, this would verify the auth token with your backend
        const savedUser = localStorage.getItem("lingoUser");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Authentication error:", error);
        localStorage.removeItem("lingoUser");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call to your authentication endpoint
      // For now, we'll simulate a successful login with mock data
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      
      if (email !== "user@example.com" || password !== "password") {
        throw new Error("Invalid credentials");
      }
      
      setUser(MOCK_USER);
      localStorage.setItem("lingoUser", JSON.stringify(MOCK_USER));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // In a real app, this would register the user in your database
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      
      const newUser: User = {
        ...MOCK_USER,
        username,
        email,
        xp: 0,
        level: 1,
        streak: 0,
      };
      
      setUser(newUser);
      localStorage.setItem("lingoUser", JSON.stringify(newUser));
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("lingoUser");
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        login, 
        signup, 
        logout,
        isAuthenticated: !!user
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
