import { Suspense } from "react";
import { Navigate, Route, Routes, useRoutes } from "react-router-dom";
import routes from "tempo-routes";
import LoginForm from "./components/auth/LoginForm";
import Dashboard from "./components/pages/dashboard";
import BrandsPage from "./components/pages/brands";
import BrandPage from "./components/pages/brand";
import InfluencersPage from "./components/pages/influencers";
import InfluencerPage from "./components/pages/influencer";
import CampaignsPage from "./components/pages/campaigns";
import CampaignVideoDetail from "./components/campaigns/CampaignVideoDetail";
import CampaignVideoForm from "./components/campaigns/CampaignVideoForm";
import VideoEditPage from "./components/pages/videoEdit";
import DashboardLayout from "./components/dashboard/layout/DashboardLayout";
import AnalyticsPage from "./components/pages/analytics";
import FinancesPage from "./components/pages/finances";
import SettingsPage from "./components/pages/settings";
import HelpPage from "./components/pages/help";
import Success from "./components/pages/success";
import Home from "./components/pages/home";
import AssignmentsPage from "./components/pages/assignments";
import AssignmentDetailPage from "./components/pages/assignmentDetail";
import UsersPage from "./components/pages/users";
import { AuthProvider, useAuth } from "../supabase/auth";
import DataProvider from "./context/DataContext";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/brands"
          element={
            <PrivateRoute>
              <BrandsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/brand/:id"
          element={
            <PrivateRoute>
              <BrandPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/influencers"
          element={
            <PrivateRoute>
              <InfluencersPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/influencer/:id"
          element={
            <PrivateRoute>
              <InfluencerPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/campaigns"
          element={
            <PrivateRoute>
              <CampaignsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/video/new"
          element={
            <PrivateRoute>
              <DashboardLayout activeItem="Campaigns">
                <CampaignVideoForm mode="create" />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/video/:id/edit"
          element={
            <PrivateRoute>
              <VideoEditPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/video/:id"
          element={
            <PrivateRoute>
              <DashboardLayout activeItem="Campaigns">
                <CampaignVideoDetail />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <PrivateRoute>
              <AnalyticsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/finances"
          element={
            <PrivateRoute>
              <FinancesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/help"
          element={
            <PrivateRoute>
              <HelpPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/assignments"
          element={
            <PrivateRoute>
              <AssignmentsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/assignments/:id"
          element={
            <PrivateRoute>
              <AssignmentDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <UsersPage />
            </PrivateRoute>
          }
        />
        <Route path="/success" element={<Success />} />
      </Routes>
      {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Suspense fallback={<p>Loading...</p>}>
          <AppRoutes />
        </Suspense>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
