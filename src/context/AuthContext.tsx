// import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// interface AuthContextType {
//   token: string | null;
//   setToken: (token: string | null) => void;
//   isAuthenticated: boolean;
// }

// const AuthContext = createContext<AuthContextType | null>(null);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [token, setToken] = useState<string | null>(null);

//   useEffect(() => {
//     const storedToken = localStorage.getItem('jwtToken');
//     if (storedToken) {
//       setToken(storedToken);
//     }
//   }, []);

//   const value = {
//     token,
//     setToken,
//     isAuthenticated: !!token
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  exp: number;
  token_type: string;
  user_id: string;
  username: string;
  user_role: string;
  business_id: number;
}

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("jwtToken", newToken);
    } else {
      localStorage.removeItem("jwtToken");
    }
    setTokenState(newToken);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("jwtToken");
    if (storedToken) {
      try {
        const decoded = jwtDecode<JwtPayload>(storedToken);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          // Token expired
          setToken(null);
        } else {
          setTokenState(storedToken);

          const timeout = (decoded.exp - currentTime) * 1000;
          const timer = setTimeout(() => {
            setToken(null);
            // Optionally: show a toast or redirect
          }, timeout);

          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error("Invalid token:", err);
        setToken(null);
      }
    }
  }, []);

  const value = {
    token,
    setToken,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
