import "./services/apiClient"; // Initialize global axios interceptor
import { BrowserRouter as Router, Routes, Route } from "react-router";

import { AuthProvider } from "./context/AuthContext";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DeveloperInfo from "./pages/OtherPage";
import NewBooking from "./pages/Booking/NewBooking";
import NewCertificate from "./pages/Certificate/NewCertificate";
import NewLoad from "./pages/Pocket/NewLoad";
import NewDelivery from "./pages/Pocket/NewDelivery";
import NewExchange from "./pages/Pocket/NewExchange";
import GenerateToken from "./pages/Token/GenerateToken";
import PendingTokens from "./pages/Token/PendingTokens";
import BookingList from "./pages/Booking/BookingList";
import CountedTokens from "./pages/Token/CountedTokens";
import CertificateList from "./pages/Certificate/CertificateList";
import LoadPage from "./pages/Certificate/Load/Load";
import ExchangePage from "./pages/Certificate/Exchange/Exchange";
import DeliveryPage from "./pages/Certificate/Delivery/Delivery";
import DeliveryList from "./pages/Certificate/Delivery/DeliveryList";
import CustomerDatabase from "./pages/MasterData/CustomerDatabase";
import AgentDatabase from "./pages/MasterData/AgentDatabase";
import RateSetup from "./pages/MasterData/RateSetup";
import LoanManagement from "./pages/Accounts/Loan/LoanManagement";
import AccountsGroupBase from "./pages/Accounts/AccountsGroup/AccountsGroupBase";
import ChartOfAccountsBase from "./pages/Accounts/COA/ChartOfAccountsBase";
import JournalVoucherList from "./pages/Accounts/JournalVoucher/JournalVoucherList";
import JournalVoucherEntry from "./pages/Accounts/JournalVoucher/JournalVoucherEntry";
import JournalVoucherUpdate from "./pages/Accounts/JournalVoucher/JournalVoucherUpdate";
import JournalVoucherView from "./pages/Accounts/JournalVoucher/JournalVoucherView";
import GeneralLedger from "./pages/Accounts/GL/GeneralLedger";
import BalanceSheet from "./pages/Accounts/GL/BalanceSheet";
import BankCashBalanceSheet from "./pages/Accounts/Reports/BankCashBalanceSheet";
import LoanReports from "./pages/Accounts/Reports/LoanReports";
import TrialBalance from "./pages/Reports/TrialBalance";
import CodeManual from "./pages/Reports/CodeManual";
import BalanceSheetCrystal from "./pages/Reports/BalanceSheetCrystal";
import IncomeStatementCrystal from "./pages/Reports/IncomeStatementCrystal";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Home />} />
              <Route path="/blank" element={<Blank />} />
              <Route path="/ut5ob" element={<DeveloperInfo />} />
              <Route path="/booking/new" element={<NewBooking />} />
              <Route path="/booking/list" element={<BookingList />} />
              <Route path="/certificate/new" element={<NewCertificate />} />
              <Route path="/certificate/list" element={<CertificateList />} />
              <Route path="/certificate/load" element={<LoadPage />} />
              <Route path="/certificate/exchange" element={<ExchangePage />} />
              <Route path="/certificate/delivery" element={<DeliveryPage />} />
              <Route path="/pocket/load" element={<NewLoad />} />
              <Route path="/pocket/delivery" element={<NewDelivery />} />
              <Route path="/pocket/exchange" element={<NewExchange />} />
              <Route path="/token/generate" element={<GenerateToken />} />
              <Route path="/token/pendings" element={<PendingTokens />} />
              <Route path="/token/counted" element={<CountedTokens />} />
              <Route path="/ops/delivery-list" element={<DeliveryList />} />
              <Route
                path="/masterdata/customer"
                element={<CustomerDatabase />}
              />
              <Route path="/masterdata/agent" element={<AgentDatabase />} />
              <Route path="/masterdata/rate-setup" element={<RateSetup />} />
              <Route path="/accounts/group" element={<AccountsGroupBase />} />
              <Route
                path="/accounts/chart-of-accounts"
                element={<ChartOfAccountsBase />}
              />
              <Route
                path="/accounts/journal-voucher"
                element={<JournalVoucherList />}
              />
              <Route
                path="/accounts/journal-voucher/new"
                element={<JournalVoucherEntry />}
              />
              <Route
                path="/accounts/journal-voucher/update/:xvoucher"
                element={<JournalVoucherUpdate />}
              />
              <Route
                path="/accounts/journal-voucher/view/:xvoucher"
                element={<JournalVoucherView />}
              />
              <Route path="/accounts/loanm" element={<LoanManagement />} />
              <Route
                path="/accounts/general-ledger"
                element={<GeneralLedger />}
              />
              <Route
                path="/accounts/bank-cash-balance"
                element={<BankCashBalanceSheet />}
              />
              <Route path="/accounts/loan-report" element={<LoanReports />} />
              <Route
                path="/accounts/report/balance-sheet"
                element={<BalanceSheet />}
              />

              <Route path="/reports/trial-balance" element={<TrialBalance />} />
              <Route
                path="/reports/balance-sheet"
                element={<BalanceSheetCrystal />}
              />
              <Route
                path="/reports/income-statement"
                element={<IncomeStatementCrystal />}
              />
              <Route path="/reports/code-manual" element={<CodeManual />} />
            </Route>
          </Route>

          {/* Public Routes */}
          <Route path="/signin" element={<SignIn />} />
          {/* <Route path="/signup" element={<SignUp />} /> */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
