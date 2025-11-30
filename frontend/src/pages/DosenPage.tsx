import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star, GraduationCap, Mail, Building2, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import fetchJson from "@/lib/fetchJson";

const DosenPage = () => {
  const [search, setSearch] = useState("");
  const [allPeople, setAllPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingRateTarget, setPendingRateTarget] = useState<any | null>(null);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        setLoading(true);
        if (user?.role === "admin") {
          let data: any = null;
          try {
            data = await fetchJson("/api/admins?limit=100");
          } catch (err: any) {
            if (err?.status === 404) {
              data = await fetchJson("/api/users?role=admin&limit=100");
            } else {
              throw err;
            }
          }
          if (data?.success) {
            const raw = data.data || [];
            const filtered = Array.isArray(raw) ? raw.filter((u: any) => u.role === "admin" && u._id !== user.id) : [];
            setAllPeople(filtered);
          }
        } else {
          const data = await fetchJson("/api/teachers");
          if (data?.success) {
            const raw = Array.isArray(data.data) ? data.data : [];
            let filtered = raw;
            if (user?.role === "dosen") {
              let currentTeacherId: string | undefined;
              try {
                const mapRes = await fetchJson(`/api/teachers/by-user/${user.id}`);
                currentTeacherId = mapRes?.success ? (mapRes.data?._id || mapRes.data?.id || mapRes.data) : undefined;
              } catch {}
              filtered = raw.filter((t: any) => {
                const tid = t?._id || t?.id;
                const tu = t?.user;
                const tuId = tu?._id || tu;
                const tname = String(t?.name || "");
                const uname = String(user?.name || "");
                const notSelfByTeacherId = currentTeacherId ? tid !== currentTeacherId : true;
                const notSelfByUserId = tuId ? tuId !== user?.id : true;
                const notSelfByName = tname && uname ? tname !== uname : true;
                return notSelfByTeacherId && notSelfByUserId && notSelfByName;
              });
            }
            setAllPeople(filtered);
          }
        }
      } catch (err) {
        toast.error((err as any)?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchPeople();
  }, [user]);

  const filteredDosen = allPeople.filter((dosen) => {
    const q = search.toLowerCase();
    const name = (dosen.name ?? "").toLowerCase();
    const nim = (dosen.nim_nip ?? "").toLowerCase();
    const deptRaw =
      (typeof dosen?.user?.department === "string" && dosen.user.department.trim().length > 0)
        ? dosen.user.department
        : (typeof dosen?.department === "string" && dosen.department.trim().length > 0)
          ? dosen.department
          : "";
    const dept = deptRaw.toLowerCase();
    const phone = String(dosen.phone ?? dosen?.user?.phone ?? "").toLowerCase();
    const matchesSearch = name.includes(q) || nim.includes(q) || dept.includes(q) || phone.includes(q);
    const matchesRole = user?.role === "admin" ? dosen.role === "admin" : true;
    return matchesSearch && matchesRole;
  });

  const handleRate = (dosen: any) => {
    setPendingRateTarget(dosen);
    setConfirmOpen(true);
  };

  const proceedRate = () => {
    const dosen = pendingRateTarget;
    const type = user?.role === "admin" ? "admin" : "dosen";
    const targetId = dosen?._id || dosen?.id;
    const url = type === "admin" && targetId ? `/rating?type=admin&adminId=${targetId}` : `/rating?type=dosen&teacherId=${targetId}`;
    setConfirmOpen(false);
    navigate(url);
    toast.success(`Mulai rating untuk ${dosen?.name}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {user?.role === "admin" ? "Daftar Admin" : "Daftar Dosen"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {user?.role === "admin"
              ? "Rating sesama admin untuk evaluasi kinerja"
              : "Berikan rating untuk semua dosen yang terdaftar"}
          </p>
        </motion.div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama, NIP, atau department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        )}

        {/* Dosen Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDosen.map((dosen, index) => (
            <motion.div
              key={dosen._id || dosen.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-xl shadow-soft border border-border overflow-hidden hover:shadow-medium transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">
                        {dosen.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {dosen.nim_nip ?? ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>{
                      (typeof dosen?.user?.department === "string" && dosen.user.department.trim().length > 0)
                        ? dosen.user.department
                        : (typeof dosen?.department === "string" && dosen.department.trim().length > 0)
                          ? dosen.department
                          : ""
                    }</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{dosen.email ?? dosen?.user?.email ?? ""}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{dosen.phone ?? dosen?.user?.phone ?? ""}</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleRate(dosen)}
                  className="w-full gap-2"
                >
                  <Star className="w-4 h-4" />
                  Berikan Rating
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredDosen.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              Tidak ada {user?.role === "admin" ? "admin" : "dosen"} yang
              ditemukan
            </p>
          </motion.div>
        )}

        {!loading && (
          <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              <span>
                Total: {filteredDosen.length}{" "}
                {user?.role === "admin" ? "admin" : "dosen"}
              </span>
            </div>
          </div>
        )}
      </div>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Perjanjian Rating</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Silakan isi rating dengan jujur dan objektif. Tekan Oke untuk lanjut atau Keluar jika tidak jadi merating.</p>
          <div className="mt-4 flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Keluar</Button>
            <Button onClick={proceedRate}>Oke</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DosenPage;
