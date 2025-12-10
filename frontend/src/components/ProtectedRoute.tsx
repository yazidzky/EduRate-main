import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("mahasiswa" | "dosen" | "admin")[];
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
}: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const token = typeof window !== "undefined" ? localStorage.getItem("edurate_token") : null;

  if (!user) {
    if (isLoading || token) {
      return (
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">
          Memuat...
        </div>
      );
    }
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
