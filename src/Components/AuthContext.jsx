import React, { createContext, useState, useEffect, useCallback } from "react";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [cookies, setCookie, removeCookie] = useCookies(["token"]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async (token) => {
    const resp = await fetch("/api/Users/my-profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!resp.ok) {
      throw new Error("Profile fetch failed");
    }
    
    const profile = await resp.json();
    setUser({ ...profile, Permissions: [profile.role] });
    return profile;
  }, []);

  const attemptAutoLogin = useCallback(async () => {
    const storedCredentials = localStorage.getItem("authCredentials");
    
    if (!storedCredentials) {
      setIsLoading(false);
      return;
    }
    
    try {
      const { email, password } = JSON.parse(storedCredentials);
      const payload = {
        EmailAddress: email,
        Password: password,
        deviceInfo: { deviceId: "browser", deviceType: "WEB_BROWSER" },
      };

      // Clear any existing authentication state
      setUser(null);
      removeCookie("token", { path: "/" });

      const response = await fetch("/api/Auth/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data.jwtToken) {
        throw new Error("Auto-login failed");
      }
      
      // Process new token
      const { exp } = jwtDecode(data.jwtToken);
      const isProduction = import.meta.env.PROD;
      
      setCookie("token", data.jwtToken, {
        path: "/",
        expires: new Date(exp * 1000),
        sameSite: "Lax",
        secure: isProduction,
      });
      
      await fetchUserProfile(data.jwtToken);
    } catch (error) {
      console.error("Auto-login error:", error);
      // localStorage.removeItem("authCredentials");
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserProfile, removeCookie, setCookie]);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      // Clear any existing authentication state
      setUser(null);
      removeCookie("token", { path: "/" });
      
      await attemptAutoLogin();
      setIsLoading(false);
    };

    initializeAuth();
  }, [attemptAutoLogin, removeCookie]);

  const login = useCallback(async (jwtToken, email, password) => {
    // Clear all previous authentication state
    setUser(null);
    removeCookie("token", { path: "/" });
    // localStorage.removeItem("authCredentials");
    
    // Set new token
    const { exp } = jwtDecode(jwtToken);
    const isProduction = import.meta.env.PROD;
    
    setCookie("token", jwtToken, {
      path: "/",
      expires: new Date(exp * 1000),
      sameSite: "Lax",
      secure: isProduction,
    });
    
    // Store credentials and fetch profile
    if (email && password) {
      localStorage.setItem("authCredentials", JSON.stringify({ email, password }));
    }
    
    await fetchUserProfile(jwtToken);
  }, [fetchUserProfile, removeCookie, setCookie]);

  const logout = useCallback(() => {
    // removeCookie("token", { path: "/" });
    // localStorage.removeItem("authCredentials");
    // setUser(null);
  }, [removeCookie]);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, login, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}