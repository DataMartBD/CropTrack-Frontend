import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
// import NotificationDropdown from "../components/header/NotificationDropdown";
import UserDropdown from "../components/header/UserDropdown";

import rahbarLogo from "../assets/rahbar-logo-seal.png";
import { ChevronDownIcon, CloseIcon } from "../icons";
import {
  NAV_MODULES,
  findActiveModuleKey,
  isPathActive,
  type NavModule,
} from "./navigation";

// const api = {
//   base: import.meta.env.VITE_API_BASE_URL,
//   static: import.meta.env.VITE_UPLOAD_URL,
// }

const AppHeader: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  const activeModuleKey = findActiveModuleKey(location.pathname);
  const openModule = NAV_MODULES.find((m) => m.key === openKey) ?? null;

  const closePanel = useCallback(() => setOpenKey(null), []);

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen((prev) => !prev);
  };

  // A completed navigation always dismisses the module panel and the mobile menu.
  useEffect(() => {
    setOpenKey(null);
    setApplicationMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!openKey) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
    };

    const handlePointerDown = (event: MouseEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) closePanel();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [openKey, closePanel]);

  const moduleClasses = (module: NavModule) => {
    const isCurrent = activeModuleKey === module.key;
    const isOpen = openKey === module.key;

    const base =
      "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#13725A]";

    if (isCurrent || isOpen) {
      return `${base} bg-[#13725A]/10 text-[#13725A] dark:bg-[#3BB68F]/15 dark:text-[#3BB68F]`;
    }

    return `${base} text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white`;
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-99999 w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
    >
      {/* Single row on desktop: modules | controls.
          Below lg the controls wrap onto their own line when toggled open. */}
      <div className="flex w-full flex-wrap items-center gap-x-3 px-3 lg:px-6">
        {/* The seal's ring is dark navy, so it needs a white disc behind it to stay
            legible on the dark-mode header. On the white light-mode header it is invisible. */}
        <Link to="/" className="order-1 shrink-0 py-2" aria-label={t("rahbar")}>
          <img
            src={rahbarLogo}
            alt={t("rahbar")}
            width={36}
            height={36}
            className="h-9 w-9 rounded-full bg-white object-contain"
          />
        </Link>

        {/* Reveals the language / theme / user controls below lg. */}
        <button
          onClick={toggleApplicationMenu}
          aria-expanded={isApplicationMenuOpen}
          aria-label={t("menu")}
          className="order-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 lg:hidden dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z"
              fill="currentColor"
            />
          </svg>
        </button>

        {/* Modules — always the leading element; scrolls horizontally when they overflow. */}
        <nav
          aria-label={t("menu")}
          // min-w-0 lets the nav shrink inside the flex row so overflow-x-auto can actually scroll.
          className="order-2 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-2 no-scrollbar"
        >
          {NAV_MODULES.map((module) => {
            const isOpen = openKey === module.key;

            if (module.path) {
              return (
                <Link
                  key={module.key}
                  to={module.path}
                  onClick={closePanel}
                  className={moduleClasses(module)}
                >
                  <span className="text-lg">
                    <module.Icon />
                  </span>
                  <span>{t(module.labelKey)}</span>
                </Link>
              );
            }

            return (
              <button
                key={module.key}
                type="button"
                onClick={() => setOpenKey(isOpen ? null : module.key)}
                aria-expanded={isOpen}
                // Only reference the panel while it exists in the DOM.
                aria-controls={isOpen ? `nav-panel-${module.key}` : undefined}
                className={`${moduleClasses(module)} cursor-pointer`}
              >
                <span className="text-lg">
                  <module.Icon />
                </span>
                <span>{t(module.labelKey)}</span>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* z-50 keeps the user dropdown above the module panel (z-40). */}
        <div
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden"
          } relative z-50 order-4 w-full shrink-0 items-center justify-between gap-4 border-t border-gray-200 py-3 shadow-theme-md lg:flex lg:w-auto lg:justify-end lg:border-t-0 lg:py-0 lg:shadow-none dark:border-gray-800`}
        >
          <div className="flex items-center gap-2 2xsm:gap-3">
            {/* <!-- Language Toggle --> */}
            <button
              onClick={() =>
                i18n.changeLanguage(i18n.language === "en" ? "bn" : "en")
              }
              className="rounded-full bg-[#13725A] px-4 py-2 text-white hover:bg-[#13503E]"
            >
              {i18n.language === "en" ? "English" : "বাংলা"}
            </button>
            <ThemeToggleButton />
            {/* <!-- Dark Mode Toggler --> */}
            {/* <NotificationDropdown /> */}
            {/* <!-- Notification Menu Area --> */}
          </div>
          {/* <!-- User Area --> */}
          <UserDropdown />
        </div>
      </div>

      {openModule?.children && (
        <div
          id={`nav-panel-${openModule.key}`}
          className="absolute inset-x-0 top-full z-40 border-b border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="w-full px-4 py-5 lg:px-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                {t(openModule.labelKey)}
              </h2>
              <button
                type="button"
                onClick={closePanel}
                aria-label={t("close")}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {openModule.children.map((leaf) => {
                const isCurrent = isPathActive(location.pathname, leaf.path);

                return (
                  <Link
                    key={leaf.path}
                    to={leaf.path}
                    onClick={closePanel}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl border p-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#13725A] ${
                      isCurrent
                        ? "border-[#13725A] bg-[#13725A]/8 dark:border-[#3BB68F] dark:bg-[#3BB68F]/10"
                        : "border-gray-200 hover:border-[#13725A] hover:bg-gray-50 dark:border-gray-700 dark:hover:border-[#3BB68F] dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-gray-100 text-2xl dark:bg-gray-800">
                      <leaf.Icon />
                    </span>
                    <span className="text-sm leading-snug font-medium text-gray-800 dark:text-gray-100">
                      {t(leaf.labelKey)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
