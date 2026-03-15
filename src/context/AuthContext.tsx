import React, { createContext, useContext } from "react";

interface AuthContextValue {
  isAuthenticated: boolean;
  onShowAuthPopup: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  onShowAuthPopup: () => {},
});

export const AuthProvider: React.FC<{
  isAuthenticated: boolean;
  onShowAuthPopup: () => void;
  children: React.ReactNode;
}> = ({ isAuthenticated, onShowAuthPopup, children }) => (
  <AuthContext.Provider value={{ isAuthenticated, onShowAuthPopup }}>
    {children}
  </AuthContext.Provider>
);

export const useAuth = () => useContext(AuthContext);
