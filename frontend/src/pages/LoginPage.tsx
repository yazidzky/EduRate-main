import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Lock, User } from "lucide-react";
import { toast } from "sonner";

const LoginPage = () => {
  const [nim_nip, setNimNip] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await login(nim_nip, password);
    if (success) {
      toast.success("Login berhasil!");
      navigate("/dashboard");
    } else {
      toast.error("NIM/NIP atau password salah!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl shadow-strong p-8 border border-border">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="inline-block p-4 bg-gradient-primary rounded-2xl mb-4">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">EduRate</h1>
            <p className="text-muted-foreground mt-2">Login ke akun Anda</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Label htmlFor="nim_nip" className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-primary" />
                NIM / NIP
              </Label>
              <Input
                id="nim_nip"
                type="text"
                placeholder="Masukkan NIM atau NIP"
                value={nim_nip}
                onChange={(e) => setNimNip(e.target.value)}
                required
                className="h-12"
              />
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Label
                htmlFor="password"
                className="flex items-center gap-2 mb-2"
              >
                <Lock className="w-4 h-4 text-primary" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
              />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button type="submit" className="w-full h-12 text-lg" size="lg">
                Login
              </Button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 p-4 bg-muted/50 rounded-lg"
          >
            <p className="text-sm text-muted-foreground text-center mb-2">
              Demo Login:
            </p>
            <div className="text-xs space-y-1 text-muted-foreground">
              <p>👨‍🏫 Dosen: NIP001 / password</p>
              <p>👨‍🎓 Mahasiswa: NIM001 / password</p>
              <p>👨‍💼 Admin: ADMIN001 / password</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
