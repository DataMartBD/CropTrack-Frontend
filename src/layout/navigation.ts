import type { IconType } from "react-icons";
import {
  FcAddressBook,
  FcApproval,
  FcBarChart,
  FcBookmark,
  FcBullish,
  FcBusinessman,
  FcCalculator,
  FcCalendar,
  FcClock,
  FcComboChart,
  FcConferenceCall,
  FcCurrencyExchange,
  FcDataSheet,
  FcDebt,
  FcDocument,
  FcDoughnutChart,
  FcFinePrint,
  FcGenealogy,
  FcHome,
  FcImport,
  FcInspection,
  FcLibrary,
  FcMoneyTransfer,
  FcNumericalSorting12,
  FcOrgUnit,
  FcPackage,
  FcPieChart,
  FcPlanner,
  FcPlus,
  FcPortraitMode,
  FcPrint,
  FcReading,
  FcRules,
  FcSalesPerformance,
  FcServices,
  FcShipped,
  FcSurvey,
  FcTodoList,
  FcTreeStructure,
  FcViewDetails,
} from "react-icons/fc";

export type NavLeaf = {
  labelKey: string;
  path: string;
  Icon: IconType;
};

export type NavModule = {
  key: string;
  labelKey: string;
  Icon: IconType;
  /** Set on modules that navigate directly instead of opening a panel. */
  path?: string;
  children?: NavLeaf[];
};

/**
 * Single source of truth for the main navigation.
 *
 * Every destination carries its own icon on purpose — the previous sidebar
 * reused one generic box glyph for 21 of 33 entries, which left the icon
 * column carrying no information for staff who navigate by shape rather than
 * by reading the label.
 */
export const NAV_MODULES: NavModule[] = [
  {
    key: "dashboard",
    labelKey: "dashboard",
    Icon: FcHome,
    path: "/",
  },
  // {
  //   key: "booking",
  //   labelKey: "booking",
  //   Icon: FcInspection,
  //   children: [
  //     { labelKey: "booking_new", path: "/booking/new", Icon: FcPlus },
  //     { labelKey: "booking_list", path: "/booking/list", Icon: FcTodoList },
  //   ],
  // },
  // {
  //   key: "token",
  //   labelKey: "token",
  //   Icon: FcBookmark,
  //   children: [
  //     { labelKey: "generate_token", path: "/token/generate", Icon: FcPrint },
  //     { labelKey: "pending_token", path: "/token/pendings", Icon: FcClock },
  //     { labelKey: "counted_token", path: "/token/counted", Icon: FcApproval },
  //   ],
  // },
  // {
  //   key: "inventory",
  //   labelKey: "inventory_flow",
  //   Icon: FcPackage,
  //   children: [
  //     { labelKey: "certificate_new", path: "/certificate/new", Icon: FcDocument },
  //     { labelKey: "certificate_list", path: "/certificate/list", Icon: FcViewDetails },
  //     { labelKey: "load", path: "/certificate/load", Icon: FcImport },
  //     { labelKey: "exchange", path: "/certificate/exchange", Icon: FcCurrencyExchange },
  //     { labelKey: "issue", path: "/certificate/delivery", Icon: FcShipped },
  //     { labelKey: "delivery_list", path: "/ops/delivery-list", Icon: FcRules },
  //   ],
  // },
  // {
  //   key: "masterdata",
  //   labelKey: "master_data",
  //   Icon: FcPortraitMode,
  //   children: [
  //     { labelKey: "customer_database", path: "/masterdata/customer", Icon: FcAddressBook },
  //     { labelKey: "agent_database", path: "/masterdata/agent", Icon: FcBusinessman },
  //     { labelKey: "rate_setup", path: "/masterdata/rate-setup", Icon: FcServices },
  //   ],
  // },
  {
    key: "accounts",
    labelKey: "accounts",
    Icon: FcCalculator,
    children: [
      // { labelKey: "loan_management", path: "/accounts/loanm", Icon: FcDebt },
      { labelKey: "chart_of_accounts", path: "/accounts/chart-of-accounts", Icon: FcTreeStructure },
      { labelKey: "accounts_group", path: "/accounts/group", Icon: FcOrgUnit },
      { labelKey: "journal_voucher", path: "/accounts/journal-voucher", Icon: FcDataSheet },
      { labelKey: "chit_sheet", path: "/accounts/chit-sheet", Icon: FcMoneyTransfer },
      { labelKey: "ledger_report", path: "/accounts/bank-cash-balance", Icon: FcLibrary },
      // { labelKey: "loan_report", path: "/accounts/loan-report", Icon: FcSalesPerformance },
      { labelKey: "balance_sheet", path: "/accounts/report/balance-sheet", Icon: FcComboChart },
      { labelKey: "day_wise_income", path: "/accounts/report/day-wise-income", Icon: FcPlanner },
      { labelKey: "monthly_report", path: "/accounts/report/monthly", Icon: FcCalendar },
    ],
  },
  {
    key: "reports",
    labelKey: "reports",
    Icon: FcSurvey,
    children: [
      { labelKey: "trial_balance", path: "/reports/trial-balance", Icon: FcNumericalSorting12 },
      { labelKey: "balance_sheet", path: "/reports/balance-sheet", Icon: FcBarChart },
      { labelKey: "income_statement", path: "/reports/income-statement", Icon: FcBullish },
      { labelKey: "ledger_details", path: "/reports/gl-ledger", Icon: FcReading },
      { labelKey: "code_manual", path: "/reports/code-manual", Icon: FcFinePrint },
    ],
  },
  {
    key: "shareholders",
    labelKey: "shareholders",
    Icon: FcGenealogy,
    children: [
      { labelKey: "shareholder_list", path: "/shareholders/list", Icon: FcConferenceCall },
      { labelKey: "shareholder_pl", path: "/shareholders/pl", Icon: FcPieChart },
      { labelKey: "shareholder_summary", path: "/shareholders/summary", Icon: FcDoughnutChart },
    ],
  },
];

/** Matches a route, treating `/` as exact and everything else as a prefix. */
export const isPathActive = (pathname: string, path: string): boolean => {
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(path + "/");
};

/**
 * The module that owns the current route, so the task bar can stay lit while
 * the user works inside a screen (including nested routes such as
 * `/accounts/journal-voucher/view/:xvoucher`).
 *
 * Longest matching path wins — `/accounts/report/balance-sheet` must not be
 * claimed by a shorter sibling prefix.
 */
export const findActiveModuleKey = (pathname: string): string | null => {
  let bestKey: string | null = null;
  let bestLength = -1;

  for (const module of NAV_MODULES) {
    const paths = module.path ? [module.path] : (module.children ?? []).map((c) => c.path);

    for (const path of paths) {
      if (isPathActive(pathname, path) && path.length > bestLength) {
        bestKey = module.key;
        bestLength = path.length;
      }
    }
  }

  return bestKey;
};
