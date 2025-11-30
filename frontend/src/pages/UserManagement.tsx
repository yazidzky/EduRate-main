import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Pencil, Trash2, Users } from "lucide-react";
import fetchJson from "@/lib/fetchJson";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const UserManagement = () => {
  const [search, setSearch] = useState("");
  const [userType, setUserType] = useState<
    "all" | "dosen" | "mahasiswa" | "admin"
  >("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newNimNip, setNewNimNip] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [newRole, setNewRole] = useState<"dosen" | "mahasiswa" | "admin" | "">("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editNimNip, setEditNimNip] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editRole, setEditRole] = useState<"dosen" | "mahasiswa" | "admin" | "">("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await fetchJson("/api/users");
        setAllUsers(data?.success ? data.data : []);
      } catch {
        setError("Failed to load users");
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.nim_nip.toLowerCase().includes(search.toLowerCase());
    const matchesType = userType === "all" || user.role === userType;
    return matchesSearch && matchesType;
  });

  const handleAddUser = async () => {
    if (!newName || !newNimNip || !newEmail || !newPassword || !newRole) {
      toast.error("Lengkapi data user");
      return;
    }

    try {
      const res = await fetchJson("/api/users", {
        method: "POST",
        body: {
          name: newName,
          nim_nip: newNimNip,
          email: newEmail,
          password: newPassword,
          role: newRole,
          department: newDepartment,
        },
      });

      if (res?.success) {
        toast.success("User berhasil ditambahkan!");
        setIsDialogOpen(false);
        setNewName("");
        setNewNimNip("");
        setNewEmail("");
        setNewPassword("");
        setNewDepartment("");
        setNewRole("");
        const data = await fetchJson("/api/users");
        setAllUsers(data?.success ? data.data : []);
      } else {
        toast.error(res?.message || "Gagal menambahkan user");
      }
    } catch (e: any) {
      const data = e?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        const msg = data.errors
          .map((er: any) => er?.msg || er?.message)
          .filter(Boolean)
          .join(", ");
        toast.error(msg || e?.message || "Gagal menambahkan user");
      } else {
        toast.error(e?.message || "Gagal menambahkan user");
      }
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (window.confirm(`Hapus user ${name}?`)) {
      try {
        await fetchJson(`/api/users/${id}`, { method: "DELETE" });

        toast.success("User berhasil dihapus!");
        // Refresh users list
        const data = await fetchJson("/api/users");
        setAllUsers(data?.success ? data.data : []);
      } catch {
        toast.error("Failed to delete user");
      }
    }
  };

  const openEditDialog = (user: any) => {
    setEditingUser(user);
    setEditName(user?.name || "");
    setEditNimNip(user?.nim_nip || "");
    setEditEmail(user?.email || "");
    setEditDepartment(user?.department || "");
    setEditRole(user?.role || "");
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser?._id) return;
    if (!editName || !editNimNip || !editEmail || !editRole) {
      toast.error("Lengkapi data user");
      return;
    }
    try {
      const res = await fetchJson(`/api/users/${editingUser._id}`, {
        method: "PUT",
        body: {
          name: editName,
          nim_nip: editNimNip,
          email: editEmail,
          department: editDepartment,
          role: editRole,
        },
      });
      if (!res?.success) {
        toast.error(res?.message || "Gagal mengupdate user");
        return;
      }
      toast.success("User berhasil diupdate!");
      setIsEditDialogOpen(false);
      setEditingUser(null);
      const data = await fetchJson("/api/users");
      setAllUsers(data?.success ? data.data : allUsers);
    } catch (e: any) {
      const data = e?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        const msg = data.errors
          .map((er: any) => er?.msg || er?.message)
          .filter(Boolean)
          .join(", ");
        toast.error(msg || e?.message || "Gagal mengupdate user");
      } else {
        toast.error(e?.message || "Gagal mengupdate user");
      }
    }
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
            User Management
          </h1>
          <p className="text-muted-foreground text-lg">
            Kelola data dosen dan mahasiswa
          </p>
        </motion.div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau NIM/NIP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={userType} onValueChange={(v: any) => setUserType(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua User</SelectItem>
              <SelectItem value="dosen">Dosen</SelectItem>
              <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Tambah User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah User Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nama Lengkap</Label>
                  <Input
                    id="user-name"
                    placeholder="Masukkan nama"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>NIM / NIP</Label>
                  <Input
                    id="user-nim-nip"
                    placeholder="Masukkan NIM/NIP"
                    value={newNimNip}
                    onChange={(e) => setNewNimNip(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    id="user-email"
                    type="email"
                    placeholder="Masukkan email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input
                    id="user-password"
                    type="password"
                    placeholder="Masukkan password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select value={newRole} onValueChange={(v: any) => setNewRole(v)}>
                    <SelectTrigger id="user-role">
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dosen">Dosen</SelectItem>
                      <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Department</Label>
                  <Input
                    id="user-department"
                    placeholder="Masukkan department"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddUser} className="w-full">
                  Simpan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card rounded-xl shadow-soft border border-border overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Nama
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    NIM/NIP
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Role
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      Loading users...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-destructive"
                    >
                      {error}
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      Tidak ada user ditemukan
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user: any, index: number) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-foreground font-medium">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {user.nim_nip}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {user.department}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === "dosen"
                              ? "bg-primary/10 text-primary"
                              : user.role === "admin"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-accent/10 text-accent"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="gap-2" onClick={() => openEditDialog(user)}>
                            <Pencil className="w-3 h-3" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleDeleteUser(user._id, user.name)
                            }
                            className="gap-2"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Total: {filteredUsers.length} users</span>
          </div>
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nama Lengkap</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div>
                <Label>NIM / NIP</Label>
                <Input value={editNimNip} onChange={(e) => setEditNimNip(e.target.value)} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={editRole} onValueChange={(v: any) => setEditRole(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dosen">Dosen</SelectItem>
                    <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Department</Label>
                <Input value={editDepartment} onChange={(e) => setEditDepartment(e.target.value)} />
              </div>
              <Button onClick={handleUpdateUser} className="w-full">Simpan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UserManagement;
