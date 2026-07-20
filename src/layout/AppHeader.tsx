import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
// import NotificationDropdown from "../components/header/NotificationDropdown";
import UserDropdown from "../components/header/UserDropdown";

import rahbarLogo from "../assets/rahbar-logo-seal.png";
import { ChevronDownIcon } from "../icons";
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
  const { t } = useTranslation();
  const location = useLocation();

  const [openKey, setOpenKey] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  const activeModuleKey = findActiveModuleKey(location.pathname);
  const openModule = NAV_MODULES.find((m) => m.key === openKey) ?? null;

  const closePanel = useCallback(() => setOpenKey(null), []);

  // A completed navigation always dismisses the module panel.
  useEffect(() => {
    setOpenKey(null);
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
      "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70";

    // Active — the current route (direct or a child) or an open drawer — is a
    // white wash. Every module reads the same way; Dashboard is not special.
    //
    // The wash carries the whole active/inactive distinction now. Dimming the
    // label was doing that job before, but it cost legibility on every module
    // the user is *not* on — which is most of the bar, most of the time.
    if (isCurrent || isOpen) {
      return `${base} bg-white/20 text-white`;
    }

    return `${base} text-white/90 hover:bg-white/10 hover:text-white`;
  };

  return (
    <header
      ref={headerRef}
      // Darker than the #13725A brand green used for buttons elsewhere, and
      // deliberately so: inactive module labels over #13725A measured 4.06:1,
      // under the 4.5:1 WCAG AA floor for body text. #0F5645 plus the lift to
      // white/90 takes that to 7.32:1 (8.62:1 for the active, fully white
      // label) without changing the hue.
      className="sticky top-0 z-99999 w-full bg-[#0F5645] dark:bg-[#0B4436]"
    >
      {/* Single row on desktop: modules | controls.
          Below lg the controls wrap onto their own line when toggled open. */}
      <div className="flex w-full flex-wrap items-center gap-x-3 px-3 lg:px-6">
        {/* The seal's ring is dark navy, so it needs a white disc behind it to
            stay legible against the green bar. */}
        <Link to="/" className="order-1 shrink-0 py-2" aria-label={t("rahbar")}>
          <img
            src={rahbarLogo}
            alt={t("rahbar")}
            width={36}
            height={36}
            className="h-9 w-9 rounded-full bg-white object-contain"
          />
        </Link>

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

        {/* Language and theme now live inside the user menu, so this is a
            single always-visible control rather than a cluster behind a
            disclosure button. z-50 keeps it above the module panel (z-40). */}
        <div className="relative z-50 order-3 ml-auto shrink-0 py-2">
          <UserDropdown />
        </div>
      </div>

      {openModule?.children && (
        <div
          id={`nav-panel-${openModule.key}`}
          // Same green as the bar so the drawer reads as an extension of the
          // header; the hairline top border is the only seam between them.
          className="absolute inset-x-0 top-full z-40 border-t border-white/15 bg-[#0F5645] shadow-lg dark:bg-[#0B4436]"
        >
          {/* No title row or close button — the lit tab names the open module,
              and Esc / click-outside dismiss the panel. */}
          <div className="w-full px-4 py-3 lg:px-6">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {openModule.children.map((leaf) => {
                const isCurrent = isPathActive(location.pathname, leaf.path);

                return (
                  <Link
                    key={leaf.path}
                    to={leaf.path}
                    onClick={closePanel}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`flex items-center gap-2.5 rounded-lg border p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                      isCurrent
                        ? "border-white bg-white/15"
                        : "border-white/20 bg-white/5 hover:border-white/50 hover:bg-white/10"
                    }`}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center text-xl">
                      <leaf.Icon />
                    </span>
                    <span className="text-sm leading-snug font-medium text-white">
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
