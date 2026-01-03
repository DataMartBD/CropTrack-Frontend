/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, FormEvent } from "react";
import { useNavigate } from "react-router";
import { Toaster, toast } from "react-hot-toast";
import { useUserContext } from "../../context/UserContext";
import { useAuth } from "../../context/AuthContext";
import { EyeIcon, EyeCloseIcon } from "../../icons";
import Potato from "/potato.png";

export default function SignInForm() {
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const { methodSignin } = useUserContext();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password.trim()) {
      toast.error("User ID and Password are required.");
      return;
    }

    try {
      setIsLoading(true);
      const result = await methodSignin(formData);

      if (result?.data?.access) {
        localStorage.setItem("jwtToken", result.data.access);
        setToken(result.data.access);
        navigate("/", { replace: true });
      }
    } catch (error: any) {
      console.error("Sign in failed:", error);
      toast.error(error.response?.data?.message || "Failed to sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#1D2939]">
      <Toaster position="top-right" />
      <div className="w-full max-w-xs m-auto bg-indigo-100 rounded p-5 shadow-lg">
        <header className="mb-5">
          <img className="w-20 mx-auto mb-3" src={Potato} alt="Logo" />
          <svg
            className="mx-auto dark:hidden"
            width="240"
            height="60"
            viewBox="0 0 240 60"
            xmlns="http://www.w3.org/2000/svg"
          >
            <text
              x="120"
              y="42"
              textAnchor="middle"
              fontFamily="Segoe UI, Roboto, sans-serif"
              fontSize="36"
              fontWeight="bold"
            >
              <tspan fill="#1D2939">Crop</tspan>
              <tspan fill="#4299e1">Track</tspan>
            </text>
          </svg>
        </header>

        <form onSubmit={handleSubmit}>
          <div>
            <label className="block mb-2 text-[#4299E1]" htmlFor="user_id">
              Username
            </label>
            <input
              id="user_id"
              name="user_id"
              type="text"
              placeholder="Enter your username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full p-2 mb-6 text-[#1D2939] border-b-2 border-[#4299E1] outline-none focus:bg-gray-300"
            />
          </div>

          <div>
            <label className="block mb-2 text-[#4299E1]" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full p-2 mb-6 text-[#1D2939] border-b-2 border-[#4299E1] outline-none focus:bg-gray-300"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2/4 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? (
                  <EyeIcon className="mb-5 size-5 fill-[#4299E1]" />
                ) : (
                  <EyeCloseIcon className="mb-5 size-5 fill-[#4299E1]" />
                )}
              </span>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#4299E1] hover:bg-[#F0A65F] text-white font-bold py-2 px-4 mb-6 rounded transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>

        {/* <footer className="text-sm flex justify-between">
          <a className="text-indigo-700 hover:text-pink-700" href="#">
            Forgot Password?
          </a>
          <a className="text-indigo-700 hover:text-pink-700" href="#">
            Create Account
          </a>
        </footer> */}
      </div>
      <footer className="absolute bottom-4 w-full text-center text-sm text-white/60">
        © 2025 DataMart BD Limited
      </footer>
    </div>
  );
}
