import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";
import axios, { AxiosResponse, AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-hot-toast";
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
        
        window.localStorage.setItem("jwtToken", res.data.access);
        window.localStorage.setItem("username", res.data.user.username);
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

  // Fetch user data on component mount
  useEffect(() => {
    const fetchAPI = async (user_id: string) => {
      try {
        const res = await axios.get(`${api.base}/user/get/${user_id}`);
        const data = res.data.user;
        // console.log(data);
        
        if (res.data.status === "OK") {
          setLoading(false);
          setCurrentUser(data);
        } else {
          toast.error("User not found");
        }
      } catch (error: unknown) {
        const err = error as AxiosError<{ message: string }>;
        console.error(err);
        toast.error(
          err.response?.data?.message ||
            "An error occurred while fetching user data"
        );
      }
    };

    const token = window.localStorage.getItem("jwtToken");
    if (token) {
      const decoded = jwtDecode<MyToken>(token);
      const { username } = decoded;
      fetchAPI(username);
    } else {
      console.log("No Token Found");
    }
  }, []);

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
