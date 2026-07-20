/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, FormEvent, KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Toaster, toast } from "react-hot-toast";
import { useUserContext } from "../../context/UserContext";
import { useAuth } from "../../context/AuthContext";
import { LanguageSwitch } from "../common/LanguageSwitch";
import { EyeIcon, EyeCloseIcon, LockIcon, UserIcon } from "../../icons";
import rahbarLogo from "../../assets/rahbar-logo-seal.png";

/**
 * Modules advertised on the brand panel. The labels reuse navigation keys that
 * are already translated, so the panel stays in sync with the app's vocabulary
 * instead of introducing a second set of names for the same screens.
 *
 * Each chip carries its own accent rather than a single uniform tint — the
 * panel is the one place on the page with room for colour.
 *
 * Kept to three: the English labels are the longest of the two locales, and at
 * three they still sit on one row at the narrowest lg panel. A fourth wrapped
 * in English while Bangla stayed on one line, so the panel changed shape when
 * the language did.
 */
const HIGHLIGHTS = [
  { key: "booking", className: "bg-amber-300/20 text-amber-100 ring-amber-300/40" },
  { key: "pocket", className: "bg-sky-300/20 text-sky-100 ring-sky-300/40" },
  { key: "accounts", className: "bg-lime-300/20 text-lime-100 ring-lime-300/40" },
] as const;

/** Shared by both fields so the two inputs cannot drift apart. */
const FIELD_CLASS =
  "peer h-12 w-full rounded-xl border border-gray-300 bg-white pl-11 pr-12 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#13725A] focus:ring-4 focus:ring-[#13725A]/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#6FD9BC] dark:focus:ring-[#6FD9BC]/15";

/** Leading icon: greyed at rest, brand green once its field takes focus. */
const ADORNMENT_CLASS =
  "pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-gray-400 transition-colors peer-focus:text-[#13725A] dark:peer-focus:text-[#6FD9BC]";

export default function SignInForm() {
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const { methodSignin } = useUserContext();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password.trim()) {
      toast.error(t("credentials_required"));
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
      toast.error(error.response?.data?.message || t("sign_in_failed"));
    } finally {
      setIsLoading(false);
    }
  };

  // getModifierState is only meaningful on a real key event, so both the down
  // and up handlers feed it — otherwise the hint lags a keystroke behind.
  const trackCapsLock = (e: KeyboardEvent<HTMLInputElement>) =>
    setCapsLock(e.getModifierState("CapsLock"));

  return (
    <div className="min-h-screen w-full bg-white lg:grid lg:grid-cols-[1.05fr_1fr] dark:bg-gray-900">
      <Toaster position="top-right" />

      {/* ===== Brand panel — desktop only ===== */}
      <aside className="relative hidden overflow-hidden bg-[#0F5645] lg:flex lg:flex-col dark:bg-[#0B4436]">
        {/* Depth: a diagonal wash plus two soft glows, so the flat green does
            not read as a solid block behind the illustration. */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#13725A] via-[#0F5645] to-[#08302598]" />
        <div className="absolute -top-24 -left-16 h-80 w-80 rounded-full bg-lime-300/10 blur-3xl" />
        <div className="absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="relative z-10 flex items-center gap-3 p-10">
          {/* The seal's ring is dark navy — it needs a white disc to stay
              legible on green, same as in AppHeader. */}
          <img
            src={rahbarLogo}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 rounded-full bg-white object-contain"
          />
          <div>
            <p className="text-xl leading-tight font-bold text-white">
              Crop<span className="text-amber-300">Track</span>
            </p>
            <p className="text-xs text-white/70">{t("rahbar")}</p>
          </div>
        </div>

        {/* flex-1 + centred: the copy claims whatever height the logo row and
            the illustration below leave, and sits in the middle of it. */}
        <div className="relative z-10 flex max-w-lg flex-1 flex-col justify-center px-10 py-6">
          <h1 className="text-title-sm font-bold text-white xl:text-title-md">
            {t("welcome")}
          </h1>
          {/* The module chips carry the "what's inside" message on their own —
              a prose tagline above them only restated the same words. */}
          <ul className="mt-6 flex flex-wrap gap-2">
            {HIGHLIGHTS.map((item) => (
              <li
                key={item.key}
                className={`rounded-full px-3.5 py-1.5 text-theme-sm font-medium ring-1 ring-inset ${item.className}`}
              >
                {t(item.key)}
              </li>
            ))}
          </ul>
        </div>

        {/* Decorative farmland band. In normal flow rather than absolutely
            positioned, so flexbox reserves its height and the copy above can
            never land on top of the artwork at any panel width.
            The box is shorter than the artwork's own 1440x407 and anchored to
            its bottom: that trims the near-empty upper strip, whose only mark
            is a lime disc that reads as a stray blob once the sky around it is
            green rather than white. */}
        <div
          aria-hidden="true"
          className="pointer-events-none relative z-0 aspect-[1440/296] w-full shrink-0 overflow-hidden select-none"
        >
          <img
            src="/images/cold-storage/farm.svg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-bottom opacity-90"
          />
        </div>
      </aside>

      {/* ===== Form panel ===== */}
      <main className="relative flex min-h-screen flex-col lg:min-h-0">
        {/* Mobile keeps a compact green band so the page is still branded
            when the panel above is dropped. */}
        <div className="flex items-center justify-between gap-4 bg-[#0F5645] px-5 py-4 lg:justify-end lg:bg-transparent lg:px-10 lg:py-6 dark:bg-[#0B4436] lg:dark:bg-transparent">
          <div className="flex items-center gap-2.5 lg:hidden">
            <img
              src={rahbarLogo}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 rounded-full bg-white object-contain"
            />
            <div>
              <p className="leading-tight font-bold text-white">
                Crop<span className="text-amber-300">Track</span>
              </p>
              <p className="text-theme-xs text-white/70">{t("rahbar")}</p>
            </div>
          </div>
          <LanguageSwitch />
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
          <div className="w-full max-w-sm">
            {/* Both headings are sized to fit one line in the 384px column
                (English 309px, Bangla 294px), so the fields below start at the
                same place in either language without reserving a second line. */}
            <header className="mb-8">
              <h2 className="text-title-sm font-bold text-gray-800 dark:text-white">
                {t("sign_in_heading")}
              </h2>
              <p className="mt-2 text-theme-sm text-gray-500 dark:text-gray-400">
                {t("sign_in_subtitle")}
              </p>
            </header>

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-5">
                <label
                  className="mb-2 block text-theme-sm font-medium text-gray-700 dark:text-gray-300"
                  htmlFor="username"
                >
                  {t("username")}
                </label>
                {/* Input first, adornments after: peer-* styling only reaches
                    later siblings. */}
                <div className="relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    autoFocus
                    placeholder={t("username_placeholder")}
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className={FIELD_CLASS}
                  />
                  <span className={ADORNMENT_CLASS}>
                    <UserIcon className="h-5 w-5" />
                  </span>
                </div>
              </div>

              <div className="mb-2">
                <label
                  className="mb-2 block text-theme-sm font-medium text-gray-700 dark:text-gray-300"
                  htmlFor="password"
                >
                  {t("password")}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder={t("password_placeholder")}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    onKeyDown={trackCapsLock}
                    onKeyUp={trackCapsLock}
                    onBlur={() => setCapsLock(false)}
                    className={FIELD_CLASS}
                  />
                  <span className={ADORNMENT_CLASS}>
                    <LockIcon className="h-5 w-5" />
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={t(showPassword ? "hide_password" : "show_password")}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-0 flex w-12 cursor-pointer items-center justify-center rounded-r-xl text-gray-400 transition-colors hover:text-[#13725A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#13725A]/40 dark:hover:text-[#6FD9BC]"
                  >
                    {showPassword ? (
                      <EyeIcon className="h-5 w-5 fill-current" />
                    ) : (
                      <EyeCloseIcon className="h-5 w-5 fill-current" />
                    )}
                  </button>
                </div>
              </div>

              {/* Reserved line: the hint appearing must not shift the button. */}
              <p
                aria-live="polite"
                className={`mb-4 min-h-5 text-theme-xs font-medium text-orange-600 transition-opacity dark:text-orange-400 ${
                  capsLock ? "opacity-100" : "opacity-0"
                }`}
              >
                {t("caps_lock_on")}
              </p>

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#13725A] text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0F5645] active:bg-[#0B4436] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#13725A]/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading && (
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  />
                )}
                {isLoading ? t("signing_in") : t("sign_in")}
              </button>
            </form>
          </div>
        </div>

        {/* Matches AppFooter so the attribution reads identically before and
            after sign-in. */}
        <footer className="px-5 pb-6 text-center sm:px-10">
          <p className="text-theme-xs text-gray-500 dark:text-gray-400">
            {t("developed_by")}{" "}
            <a
              href="https://datamartbd.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#0F5645] transition-colors hover:underline dark:text-[#6FD9BC]"
            >
              DataMart BD Limited
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
