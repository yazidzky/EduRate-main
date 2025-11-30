import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  LogOut,
  User,
  Home,
  BookOpen,
  Settings,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  const navItems =
    user.role === "admin"
      ? [
          { path: "/dashboard", label: "Dashboard", icon: Home },
          { path: "/dosen", label: "Admin", icon: GraduationCap },
          { path: "/user-management", label: "Users", icon: Users },
          { path: "/kelas-management", label: "Kelas", icon: Settings },
          { path: "/enrollment-management", label: "Enrollment", icon: Users },
          { path: "/profile", label: "Profile", icon: User },
        ]
      : [
          { path: "/dashboard", label: "Dashboard", icon: Home },
          { path: "/kelasku", label: "Kelasku", icon: BookOpen },
          { path: "/dosen", label: "Dosen", icon: GraduationCap },
          { path: "/profile", label: "Profile", icon: User },
        ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">EduRate</span>
          </Link>

          <div className="flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
