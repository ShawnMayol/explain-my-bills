import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "./pages/LandingPage.jsx";
import SignUp from "./pages/SignUp.jsx";
import SignIn from "./pages/SignIn.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfilePage from "./pages/ProfilePage.jsx";
import NotFound from "./pages/NotFound.jsx";
import EditUsername from "./pages/EditUsername.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import BillSummarization from "./pages/BillSummarization.jsx";
import BillAwaiting from "./pages/BillAwaiting.jsx";
import BillResult from "./pages/BillResult.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import BillsPage from "./pages/BillsPage.jsx";
import BillDetail from "./pages/BillDetail.jsx";

// Test Page
import MirrAnalyticsPage from "./pages/MirrAnalyticsPage.jsx";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 10000, // 10 seconds
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit-username"
          element={
            <ProtectedRoute>
              <EditUsername />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bill/summarization"
          element={
            <ProtectedRoute>
              <BillSummarization />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bill/awaiting"
          element={
            <ProtectedRoute>
              <BillAwaiting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bill/result"
          element={
            <ProtectedRoute>
              <BillResult />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bills"
          element={
            <ProtectedRoute>
              <BillsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bill/:billId"
          element={
            <ProtectedRoute>
              <BillDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mirr-analytics"
          element={
            <ProtectedRoute>
              <MirrAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
