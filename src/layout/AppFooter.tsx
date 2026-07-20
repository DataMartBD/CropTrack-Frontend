import { useTranslation } from "react-i18next";

/**
 * Attribution strip pinned to the bottom of every page inside AppLayout.
 * Deliberately small and low-contrast — it should be findable, not noticed.
 */
const AppFooter: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-gray-200 px-4 py-3 text-center dark:border-white/10">
      <p className="text-theme-xs text-gray-500 dark:text-gray-400">
        {t("developed_by")}{" "}
        <a
          href="https://datamartbd.com"
          target="_blank"
          // noreferrer implies noopener, but both are spelled out because the
          // pairing is what reviewers look for.
          rel="noopener noreferrer"
          className="font-medium text-[#0F5645] transition-colors hover:underline dark:text-[#6FD9BC]"
        >
          DataMart BD Limited
        </a>
      </p>
    </footer>
  );
};

export default AppFooter;
