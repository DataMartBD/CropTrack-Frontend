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
