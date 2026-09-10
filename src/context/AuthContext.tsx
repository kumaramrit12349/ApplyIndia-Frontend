import React, { createContext, useContext } from "react";

interface AuthContextValue {
  isAuthenticated: boolean;
  /** Opens the sign-in popup. Pass a path to automatically navigate there
   *  once login succeeds, instead of leaving the user where they started. */
  onShowAuthPopup: (redirectTo?: string) => void;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  onShowAuthPopup: () => {},
});

export const AuthProvider: React.FC<{
  isAuthenticated: boolean;
  onShowAuthPopup: (redirectTo?: string) => void;
  children: React.ReactNode;
}> = ({ isAuthenticated, onShowAuthPopup, children }) => (
  <AuthContext.Provider value={{ isAuthenticated, onShowAuthPopup }}>
    {children}
  </AuthContext.Provider>
);

export const useAuth = () => useContext(AuthContext);
