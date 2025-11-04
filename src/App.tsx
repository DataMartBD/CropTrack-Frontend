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
import CustomerDatabase from "./pages/MasterData/CustomerDatabase";
import AgentDatabase from "./pages/MasterData/AgentDatabase";
import RateSetup from "./pages/MasterData/RateSetup";
import LoanManagement from "./pages/Accounts/Loan/LoanManagement";
import AccountsGroupBase from "./pages/MasterData/AccountsGroup/AccountsGroupBase";

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
              <Route
                path="/masterdata/customer"
                element={<CustomerDatabase />}
              />
              <Route path="/masterdata/agent" element={<AgentDatabase />} />
              <Route path="/masterdata/rate-setup" element={<RateSetup />} />
              <Route
                path="/masterdata/acc-group"
                element={<AccountsGroupBase />}
              />
              <Route path="/accounts/loanm" element={<LoanManagement />} />
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
