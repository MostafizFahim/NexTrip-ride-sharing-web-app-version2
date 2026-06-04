import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  clearStoredAuth,
  getStoredAuth,
  saveStoredAuth,
} from "../services/api";
import { disconnectSocket } from "../services/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    async function loadAuth() {
      try {
        const auth = await getStoredAuth();
        if (auth?.token && auth?.user) {
          setToken(auth.token);
          setUser(auth.user);
        }
      } finally {
        setBooting(false);
      }
    }

    loadAuth();
  }, []);

  async function signIn(auth) {
    const normalizedUser = {
      ...auth.user,
      role: String(auth.user.role || "").toUpperCase(),
    };

    await saveStoredAuth({ token: auth.token, user: normalizedUser });
    setToken(auth.token);
    setUser(normalizedUser);
  }

  async function signOut() {
    await clearStoredAuth();
    disconnectSocket();
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, token, booting, signIn, signOut }),
    [user, token, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
