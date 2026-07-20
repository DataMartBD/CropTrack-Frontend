import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";
import axios, { AxiosResponse, AxiosError } from "axios";
import { toast } from "react-hot-toast";
import {
  decodeToken,
  onSessionExpired,
  readStoredToken,
  readStoredUser,
  storeToken,
  storeUser,
} from "../services/session";
// import { useNavigate } from "react-router";

// type for user data
type User = {
  id: string;
  user_role: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  // date_joined: string; // ISO string
  profile_pic: string;
  // user_type: string;
  // module_access: []; // e.g., "Admin", "Staff", etc.
};

type SigninData = {
  username: string;
  password: string;
};

type SigninResponse = {
  status: "OK";
  user: User;
  access: string; // JWT token
  refresh: string; // Refresh token
  message: string;
};

interface MyToken {
  username: string;
  user_role: string;
  // whatever else is in the JWT.
}

const api = {
  base: import.meta.env.VITE_API_BASE_URL,
};

// Define the type for the context
type UserContextType = {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  loading: boolean;
  methodSignin: (
    signinData: SigninData,
    onSuccess?: () => void
  ) => Promise<AxiosResponse<SigninResponse>>;
};

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Custom hook to consume the UserContext
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }
  return context;
};

// UserContextProvider component
type UserContextProviderProps = {
  children: ReactNode;
};

export const UserContextProvider = ({ children }: UserContextProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modified signin method to accept callback
  const methodSignin = async (signinData: SigninData, onSuccess?: () => void) => {
    try {
      setLoading(true);
      const res = await axios.post(`${api.base}/user/login/`, signinData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res) {
        setLoading(false);
        setCurrentUser(res.data.user);
        
        // storeToken also re-arms the expiry broadcast for the new session.
        storeToken(res.data.access);
        window.localStorage.setItem("username", res.data.user.username);
        // The only copy of the profile we will ever be given — cache it so a
        // reload does not empty the header.
        storeUser(res.data.user);
        onSuccess?.();
      }
      return res;
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      setLoading(false);
      
      if (err.response?.status === 401) {
        toast.error("Invalid Username or Password");
      } else if (err.response?.status === 404) {
        toast.error("User not found");
      } else {
        toast.error(err.response?.data?.message || "An error occurred during sign in");
      }
      throw error;
    }
  };

  // Last-resort profile when the cache predates this fix (or was cleared by
  // hand): the JWT itself carries enough to name the user.
  const userFromToken = (): User | null => {
    const token = readStoredToken();
    const claims = token ? (decodeToken(token) as MyToken | null) : null;
    if (!claims?.username) return null;

    return {
      id: "",
      user_role: claims.user_role ?? "",
      username: claims.username,
      first_name: claims.username,
      last_name: "",
      email: "",
      profile_pic: "",
    };
  };

  // Restore the signed-in profile on reload. This used to call
  // GET /user/get/<username>, which does not exist on the backend — it 404s,
  // so currentUser stayed null after every refresh.
  useEffect(() => {
    if (currentUser) return;

    const restored = readStoredUser<User>() ?? userFromToken();
    if (restored) setCurrentUser(restored);
    setLoading(false);
    // Boot-time restore only; later updates flow through methodSignin.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When the session dies (timer or a 401), the cached profile has to go too —
  // otherwise the header keeps showing the signed-out user's name.
  useEffect(() => onSessionExpired(() => setCurrentUser(null)), []);

  // Provide the context value
  const contextValue: UserContextType = {
    currentUser,
    setCurrentUser,
    loading,
    methodSignin,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
