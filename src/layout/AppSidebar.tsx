/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import { ChevronDownIcon, HorizontaLDots, FcPieChart } from "../icons";
import {
  FcInspection,
  FcPackage,
  FcPaid,
  FcPortraitMode,
  // FcShipped,
  FcBookmark,
  FcOvertime,
  FcCalculator,
  FcParallelTasks,
  FcBullish,
  FcDataSheet,
  FcDocument,
  FcNeutralTrading,
  FcTreeStructure 
} from "react-icons/fc";

import { useSidebar } from "../context/SidebarContext";
// import SidebarWidget from "./SidebarWidget";

import { useTranslation } from "react-i18next";

// const api = {
//   base: import.meta.env.VITE_API_BASE_URL,
//   static: import.meta.env.VITE_UPLOAD_URL,
// }

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: {
    name: string;
    path: string;
    icon?: React.ReactNode;
    pro?: boolean;
    new?: boolean;
  }[];
};

const getTranslatedNavItems = (t: any): NavItem[] => [
  {
    icon: <FcPieChart />,
    name: t("dashboard"),
    path: "/",
  },
  {
    name: t("booking"),
    icon: <FcInspection />,
    subItems: [
      { name: t("booking_new"), icon: <FcPackage />, path: "/booking/new" },
      { name: t("booking_list"), icon: <FcPackage />, path: "/booking/list" },
    ],
  },
  {
    name: t("token"),
    icon: <FcBookmark />,
    subItems: [
      {
        name: t("generate_token"),
        icon: <FcPackage />,
        path: "/token/generate",
      },
      {
        name: t("pending_token"),
        icon: <FcPackage />,
        path: "/token/pendings",
      },
      {
        name: t("counted_token"),
        icon: <FcPackage />,
        path: "/token/counted",
      },
    ],
  },
  {
    name: t("inventory_flow"),
    icon: <FcPaid />,
    subItems: [
      {
        name: t("certificate_new"),
        icon: <FcPackage />,
        path: "/certificate/new",
      },
      {
        name: t("certificate_list"),
        icon: <FcPackage />,
        path: "/certificate/list",
      },
      {
        name: t("load"),
        icon: <FcPackage />,
        path: "/certificate/load",
      },
      {
        name: t("exchange"),
        icon: <FcPackage />,
        path: "/certificate/exchange",
      },
      {
        name: t("issue"),
        icon: <FcPackage />,
        path: "/certificate/delivery",
      },
      {
        name: t("delivery_list"),
        icon: <FcPackage />,
        path: "/ops/delivery-list",
      },
    ],
  },
  // {
  //   name: t("pocket"),
  //   icon: <FcPaid />,
  //   subItems: [
  //     { name: t("load"), icon: <FcPackage />, path: "/pocket/load" },
  //     { name: t("exchange"), icon: <FcPackage />, path: "/pocket/exchange" },
  //     { name: t("issue"), icon: <FcPackage />, path: "/pocket/delivery" },
  //   ],
  // },
  {
    name: t("master_data"),
    icon: <FcPortraitMode />,
    subItems: [
      {
        name: t("customer_database"),
        icon: <FcPackage />,
        path: "/masterdata/customer",
      },
      {
        name: t("agent_database"),
        icon: <FcPackage />,
        path: "/masterdata/agent",
      },
      {
        name: t("rate_setup"),
        icon: <FcPackage />,
        path: "/masterdata/rate-setup",
      },
    ],
  },
  {
    name: t("accounts"),
    icon: <FcCalculator />,
    subItems: [
      {
        name: t("loan_management"),
        icon: <FcOvertime />,
        path: "/accounts/loanm",
      },
      {
        name: t("chart_of_accounts"),
        icon: <FcBullish />,
        path: "/accounts/chart-of-accounts",
      },
      {
        name: t("accounts_group"),
        icon: <FcParallelTasks />,
        path: "/accounts/group",
      },
      {
        name: t("journal_voucher"),
        icon: <FcDataSheet />,
        path: "/accounts/journal-voucher",
      },
      {
        name: t("general_ledger"),
        icon: <FcDocument />,
        path: "/accounts/general-ledger",
      },
      {
        name: t("ledger_report"),
        icon: <FcNeutralTrading />,
        path: "/accounts/bank-cash-balance",
      },
      {
        name: t("loan_report"),
        icon: <FcPieChart />,
        path: "/accounts/loan-report",
      },
      {
        name: t("balance_sheet"),
        icon: <FcDataSheet />,
        path: "/accounts/report/balance-sheet",
      },
    ],
  },
  {
    name: t("reports"),
    icon: <FcDocument />,
    subItems: [
      {
        name: t("trial_balance"),
        icon: <FcDocument />,
        path: "/reports/trial-balance",
      },
      {
        name: t("balance_sheet"),
        icon: <FcDocument />,
        path: "/reports/balance-sheet",
      },
      {
        name: t("income_statement"),
        icon: <FcDocument />,
        path: "/reports/income-statement",
      },
      {
        name: t("ledger_details"),
        icon: <FcDocument />,
        path: "/reports/gl-ledger",
      },
      {
        name: t("code_manual"),
        icon: <FcDataSheet />,
        path: "/reports/code-manual",
      },
    ],
  },
  {
    name: t("shareholders"),
    icon: <FcTreeStructure  />,
    subItems: [
      {
        name: t("shareholder_list"),
        icon: <FcPackage />,
        path: "/shareholders/list",
      },
      {
        name: t("shareholder_pl"),
        icon: <FcPackage />,
        path: "/shareholders/pl",
      },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const [filteredNavItems, setFilteredNavItems] = useState<NavItem[]>([]);
  // const [logoImg, setLogoImg] = useState<string | null>(null);

  useEffect(() => {
    const navItems = getTranslatedNavItems(t);
    setFilteredNavItems(navItems);
  }, [i18n.language, t]); // watch for language change

  //module fltering
  // useEffect(() => {
  //   const moduleAccess = window.localStorage.getItem("module_access") || "";
  //   const allowedModules = moduleAccess.split(",");

  //   const logo = window.localStorage.getItem("i_logo") || "";
  //   setLogoImg(logo);

  //   // Helper function to check if a nav item is allowed
  //   const isModuleAllowed = (itemName: string) => {
  //     return allowedModules.some(module => itemName === module);
  //   };

  //   // Filter main nav items
  //   const filteredMain = navItems.filter(item => {
  //     if (isModuleAllowed(item.name)) {
  //       if (item.subItems) {
  //         // Filter sub-items if they exist
  //         const filteredSubs = item.subItems.filter(subItem =>
  //           isModuleAllowed(subItem.name)
  //         );
  //         // Only modify the subItems property, keep the rest of the item intact
  //         item.subItems = filteredSubs;
  //         return true;
  //       }
  //       return true;
  //     }
  //     return false;
  //   });

  //   setFilteredNavItems(filteredMain);
  // }, []);

  // useEffect(() => {
  //   const logo = window.localStorage.getItem("i_logo") || "";
  //   setLogoImg(logo);

  //   // No filtering — show all nav items
  //   setFilteredNavItems(navItems);
  // }, []);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => {
      if (path === "/") return location.pathname === "/";
      return (
        location.pathname === path ||
        location.pathname.startsWith(path + "/")
      );
    },
    [location.pathname],
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main"].forEach((menuType) => {
      const items = menuType === "main" ? filteredNavItems : [];
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, filteredNavItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-blue-400"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.icon && (
                        <span className="flex items-center mr-2 w-4 h-4">
                          {subItem.icon}
                        </span>
                      )}
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-gray-800 dark:bg-gray-900 dark:border-gray-700 text-gray-100 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-700 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
              ? "w-[290px]"
              : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <svg
                className="dark:hidden"
                width="240"
                height="60"
                viewBox="0 0 240 60"
                xmlns="http://www.w3.org/2000/svg"
              >
                <text
                  x="10"
                  y="42"
                  font-family="Segoe UI, Roboto, sans-serif"
                  font-size="36"
                  font-weight="bold"
                >
                  <tspan fill="#ffffff">🥔Crop</tspan>
                  <tspan fill="#4299e1">Track</tspan>
                </text>
              </svg>

              <svg
                className="hidden dark:block"
                width="240"
                height="60"
                viewBox="0 0 240 60"
                xmlns="http://www.w3.org/2000/svg"
              >
                <text
                  x="10"
                  y="42"
                  font-family="Segoe UI, Roboto, sans-serif"
                  font-size="36"
                  font-weight="bold"
                >
                  <tspan fill="#ffffff">🥔Crop</tspan>
                  <tspan fill="#4299e1">Track</tspan>
                </text>
              </svg>
            </>
          ) : (
            // <p className="text-3xl font-bold text-blue-800 dark:text-blue-400"> <span><LiaSchoolSolid /></span>EIMS</p>
            <>
              <svg
                className=" dark:hidden"
                width="80"
                height="60"
                viewBox="0 0 80 60"
                xmlns="http://www.w3.org/2000/svg"
              >
                <text
                  x="10"
                  y="42"
                  font-family="Segoe UI, Roboto, sans-serif"
                  font-size="36"
                  font-weight="bold"
                >
                  <tspan fill="#ffffff">C</tspan>
                  <tspan fill="#4299e1">T</tspan>
                </text>
              </svg>
              <svg
                className="hidden dark:block"
                width="80"
                height="60"
                viewBox="0 0 80 60"
                xmlns="http://www.w3.org/2000/svg"
              >
                <text
                  x="10"
                  y="42"
                  font-family="Segoe UI, Roboto, sans-serif"
                  font-size="36"
                  font-weight="bold"
                >
                  <tspan fill="#ffffff">C</tspan>
                  <tspan fill="#4299e1">T</tspan>
                </text>
              </svg>
            </>
          )}
        </Link>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-blue-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(filteredNavItems, "main")}
            </div>
          </div>
        </nav>
        {/* {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
      </div>

      {/* Added Footer Text Block */}
      <div 
        className={`mt-auto pb-2 pt-2 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered || isMobileOpen ? "block" : "hidden"
        }`}
      >
        <p className="text-sm font-semibold text-gray-200 dark:text-gray-500">
          © DataMart<span className="text-[#F97317]">BD Limited</span>
        </p>
      </div>

    </aside>
  );
};

export default AppSidebar;