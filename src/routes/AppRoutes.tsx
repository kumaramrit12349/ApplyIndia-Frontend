import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../pages/Home/HomePage";
import DashboardPage from "../pages/admin/DashboardPage";
import AddNotificationPage from "../pages/admin/AddNotificationPage";
import EditNotificationPage from "../pages/admin/EditNotificationPage";
import ReviewNotificationPage from "../pages/admin/ReviewNotificationPage";
import CategoryView from "../features/notifications/components/CategoryView";
import UserNotificationDetailPage from "../features/notifications/components/UserNotificationDetailPage";
import AdminFeedbackPage from "../pages/admin/AdminFeedbackPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route
          path="/admin/addNotification"
          element={<AddNotificationPage />}
        />
        <Route path="/admin/edit/:id" element={<EditNotificationPage />} />
        <Route path="/admin/review/:id" element={<ReviewNotificationPage />} />
        <Route path="/admin/feedback" element={<AdminFeedbackPage />} />

        {/* Infinite scroll per category */}
        <Route
          path="/notification/category/:category"
          element={<CategoryView />}
        />

        {/* User-facing detail page */}
        <Route
          path="/notification/:id"
          element={<UserNotificationDetailPage />}
        />
      </Routes>
    </Router>
  );
}
export default App;
