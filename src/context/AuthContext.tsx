import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  TOKEN_KEY,
  bootedWithExpiredSession,
  clearSession,
  expireSession,
  isTokenExpired,
  onSessionExpired,
  readStoredToken,
  scheduleExpiry,
  storeToken,
} from "../services/session";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

  // Read synchronously so the first render already knows whether we are signed
  // in — an async check would flash protected content (or the sign-in page).
  const [token, setTokenState] = useState<string | null>(() => readStoredToken());

  const setToken = useCallback((newToken: string | null) => {
    if (newToken) {
      storeToken(newToken);
    } else {
      clearSession();
    }
    setTokenState(newToken);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setTokenState(null);
  }, []);

  // Arm the expiry timer for whatever token is current — including one that
  // arrived from a fresh sign-in, which the old mount-only effect never saw.
  useEffect(() => {
    if (!token) return;
    return scheduleExpiry(token, () => expireSession("expired"));
  }, [token]);

  // Timers do not fire on schedule in a background tab and do not run at all
  // while the machine sleeps, so re-check whenever the tab comes back.
  useEffect(() => {
    if (!token) return;

    const check = () => {
      if (isTokenExpired(token)) expireSession("expired");
    };

    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);
    return () => {
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("focus", check);
    };
  }, [token]);

  // Anything outside React that ends the session (the axios 401 interceptor,
  // the expiry timer) lands here: drop the token, tell the user why.
  useEffect(
    () =>
      onSessionExpired(() => {
        setTokenState(null);
        // Shared id: several failed requests must not stack up toasts. The
        // toast survives the redirect and renders on the sign-in screen.
        toast.error(t("session_expired"), { id: "session-expired" });
      }),
    [t],
  );

  // Reloading with a token that died while the app was closed.
  useEffect(() => {
    if (bootedWithExpiredSession) {
      toast.error(t("session_expired"), { id: "session-expired" });
    }
  }, [t]);

  // Signing out in one tab signs out the others.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== TOKEN_KEY) return;
      const next = event.newValue;
      setTokenState(next && !isTokenExpired(next) ? next : null);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value = {
    token,
    setToken,
    logout,
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
