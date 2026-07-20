import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { LanguageSwitch } from "../common/LanguageSwitch";
import { ThemeToggleButton } from "../common/ThemeToggleButton";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useAuth } from "../../context/AuthContext";
import { useUserContext } from "../../context/UserContext";

const SignOutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
      fill="currentColor"
    />
  </svg>
);

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, setCurrentUser } = useUserContext();
  const { logout } = useAuth();
  const { t } = useTranslation();

  const navigate = useNavigate();

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleSignOut = () => {
    // logout() clears storage *and* the auth context — clearing storage alone
    // left isAuthenticated stuck on true.
    logout();
    setCurrentUser(null);
    navigate("/signin", { replace: true });
    closeDropdown();
  };

  const fullName =
    [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(" ") ||
    currentUser?.username ||
    "";

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        className="dropdown-toggle flex h-10 cursor-pointer items-center gap-2 rounded-full bg-white/10 p-1 pr-2 text-white ring-1 ring-inset ring-white/25 transition-colors hover:bg-white/20"
      >
        <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white/90">
          <img
            src="/images/user/blank.png"
            alt=""
            className="h-full w-full object-cover"
          />
        </span>

        <span className="block max-w-[8rem] truncate text-theme-sm font-semibold">
          {currentUser?.first_name}
        </span>
        <svg
          className={`shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* No padding on the panel itself — the identity banner bleeds to the
          edges, so the sections below supply their own. */}
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border-gray-200 bg-white p-0 shadow-theme-lg dark:border-white/10 dark:bg-gray-800"
      >
        {/* Identity banner — the same green as the header it drops out of, so
            the menu reads as belonging to the bar rather than to the page. */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-[#0F5645] to-[#13725A] px-4 py-3.5">
          <span className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-white/90 ring-2 ring-white/40">
            <img
              src="/images/user/blank.png"
              alt=""
              className="h-full w-full object-cover"
            />
          </span>
          {/* min-w-0 lets the truncate below actually engage inside the flex row. */}
          <div className="min-w-0">
            <p className="truncate text-theme-sm font-semibold text-white">
              {fullName}
            </p>
            <p className="mt-0.5 truncate text-theme-xs text-white/70">
              @{currentUser?.username}
            </p>
          </div>
          {currentUser?.user_role && (
            <span className="ml-auto shrink-0 rounded-full bg-[#E0A63C] px-2.5 py-1 text-theme-xs font-semibold text-[#0C2E4A]">
              {currentUser.user_role}
            </span>
          )}
        </div>

        {/* Preferences — label left, control right, one row each. */}
        <div className="flex flex-col gap-1 p-2">
          <div className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5">
            <span className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
              {t("language")}
            </span>
            <LanguageSwitch />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5">
            <span className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
              {t("theme")}
            </span>
            <ThemeToggleButton />
          </div>
        </div>

        <div className="border-t border-gray-200 p-2 dark:border-white/10">
          {/* A button, not a Link: signing out is an action, and the navigation
              it performs is already handled by handleSignOut. */}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-theme-sm font-medium text-error-600 transition-colors hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10"
          >
            <SignOutIcon />
            {t("logout")}
          </button>
        </div>
      </Dropdown>
    </div>
  );
}
