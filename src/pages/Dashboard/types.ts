/** Shape of GET /accounts/dashboard/ (already unwrapped from the API envelope). */

export type DepositExpense = {
  deposit: number;
  expense: number;
};

export type BankAccount = {
  xacc: string;
  xdesc: string;
  xbalance: number;
};

export type IncomeStatementPeriod = {
  total_income: number;
  total_expenditure: number;
  total_pl: number;
};

export type DashboardData = {
  deposit_expense: {
    daily: DepositExpense;
    monthly: DepositExpense;
    yearly: DepositExpense;
  };
  cash: {
    total_cash: number;
  };
  banks: {
    accounts: BankAccount[];
    bank_total: number;
  };
  cash_and_bank_total: number;
  income_statement: {
    monthly: IncomeStatementPeriod;
    yearly: IncomeStatementPeriod;
  };
};

/** The three windows the API reports deposit/expense over. */
export type FlowPeriod = "daily" | "monthly" | "yearly";

/** The two windows the API reports the income statement over. */
export type StatementPeriod = "monthly" | "yearly";

/**
 * Shape of GET /accounts/dashboard/chart/ — the same two concerns as the cards
 * above, but broken out month by month instead of rolled up into a period.
 *
 * Both arrays run only as far as the months the books have closed, so a chart
 * in July gets seven points, not twelve padded with zeros.
 */

/** One month of cash movement. `month` is 1-based; `label` is the API's "Jan". */
export type MonthlyFlow = {
  month: number;
  label: string;
  /** Credit-side, so it arrives negative. See CashFlowTrendCard. */
  deposit: number;
  expense: number;
};

/** One month of the income statement, signed as the books report it. */
export type MonthlyStatement = {
  month: number;
  label: string;
  total_income: number;
  total_expenditure: number;
  total_pl: number;
};

export type DashboardChartData = {
  deposit_expense: MonthlyFlow[];
  income_statement: MonthlyStatement[];
};
