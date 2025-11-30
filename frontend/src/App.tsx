import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardDosen from "./pages/DashboardDosen";
import DashboardMahasiswa from "./pages/DashboardMahasiswa";
import DashboardAdmin from "./pages/DashboardAdmin";
import RatingPage from "./pages/RatingPage";
import ProfilePage from "./pages/ProfilePage";
import KelaskuPage from "./pages/KelaskuPage";
import UserManagement from "./pages/UserManagement";
import KelasManagement from "./pages/KelasManagement";
import EnrollmentManagement from "./pages/EnrollmentManagement";
import DosenPage from "./pages/DosenPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "dosen":
      return <DashboardDosen />;
    case "mahasiswa":
      return <DashboardMahasiswa />;
    case "admin":
      return <DashboardAdmin />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rating"
        element={
          <ProtectedRoute>
            <RatingPage />
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
        path="/kelasku"
        element={
          <ProtectedRoute allowedRoles={["dosen", "mahasiswa"]}>
            <KelaskuPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dosen"
        element={
          <ProtectedRoute>
            <DosenPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-management"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/kelas-management"
        element={
          <ProtectedRoute allowedRoles={["admin", "dosen"]}>
            <KelasManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/enrollment-management"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <EnrollmentManagement />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
