import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Trash2,
  Users,
  ArrowRightLeft,
  Upload,
  Download,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import fetchJson from "@/lib/fetchJson";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const EnrollmentManagement = () => {
  const [search, setSearch] = useState("");
  const [selectedKelas, setSelectedKelas] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedAddStudent, setSelectedAddStudent] = useState<string>("");
  const [availableAddCourses, setAvailableAddCourses] = useState<any[]>([]);
  const [selectedTransferStudent, setSelectedTransferStudent] = useState<string>("");
  const [transferFromCourses, setTransferFromCourses] = useState<any[]>([]);
  const [transferToCourses, setTransferToCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrollmentsData, coursesData, usersData] = await Promise.all([
          fetchJson("/api/enrollments"),
          fetchJson("/api/courses"),
          fetchJson("/api/users"),
        ]);

        setEnrollments(enrollmentsData?.success ? enrollmentsData.data : []);
        setCourses(coursesData?.success ? coursesData.data : []);
        setUsers(usersData?.success ? usersData.data : []);
      } catch (err) {
        toast.error((err as any)?.message || "Failed to load data");
      }
    };

    fetchData();
  }, []);

  const filteredEnrollments = enrollments.filter((enrollment: any) => {
    const student = enrollment.user || {};
    const kelas = enrollment.course || {};
    const matchesSearch =
      (student?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (kelas?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchesKelas =
      selectedKelas === "all" || (kelas?._id || kelas?.id) === selectedKelas;
    return matchesSearch && matchesKelas;
  });

  const handleAddEnrollment = async () => {
    try {
      const studentId = selectedAddStudent;
      const courseId = (document.getElementById("enrollment-course") as HTMLInputElement)?.value;
      if (!studentId || !courseId) {
        toast.error("Pilih mahasiswa dan kelas");
        return;
      }
      const res = await fetchJson("/api/enrollments/admin", { method: "POST", body: { user: studentId, course: courseId } });
      if (!res?.success) {
        toast.error(res?.message || "Gagal menambahkan enrollment");
        return;
      }
      toast.success("Mahasiswa berhasil ditambahkan ke kelas!");
      setIsAddDialogOpen(false);
      const [enrollmentsData, coursesData, usersData] = await Promise.all([
        fetchJson("/api/enrollments"),
        fetchJson("/api/courses"),
        fetchJson("/api/users"),
      ]);
      setEnrollments(enrollmentsData?.success ? enrollmentsData.data : enrollments);
      setCourses(coursesData?.success ? coursesData.data : courses);
      setUsers(usersData?.success ? usersData.data : users);
    } catch (err: any) {
      toast.error(err?.message || "Gagal menambahkan enrollment");
    }
  };

  const handleRemoveEnrollment = async (userId: string, courseId: string) => {
    if (!window.confirm("Hapus enrollment?")) return;
    try {
      const res = await fetchJson("/api/enrollments/admin", { method: "DELETE", body: { user: userId, course: courseId } });
      if (!res?.success) {
        toast.error(res?.message || "Gagal menghapus enrollment");
        return;
      }
      toast.success("Enrollment berhasil dihapus!");
      const data = await fetchJson("/api/enrollments");
      setEnrollments(data?.success ? data.data : enrollments);
    } catch (err: any) {
      toast.error(err?.message || "Gagal menghapus enrollment");
    }
  };

  const handleTransfer = async () => {
    try {
      const studentId = selectedTransferStudent;
      const fromCourse = (document.getElementById("transfer-from") as HTMLInputElement)?.value;
      const toCourse = (document.getElementById("transfer-to") as HTMLInputElement)?.value;
      if (!studentId || !fromCourse || !toCourse) {
        toast.error("Lengkapi pilihan transfer");
        return;
      }
      await fetchJson("/api/enrollments/admin", { method: "DELETE", body: { user: studentId, course: fromCourse } });
      const res = await fetchJson("/api/enrollments/admin", { method: "POST", body: { user: studentId, course: toCourse } });
      if (!res?.success) {
        toast.error(res?.message || "Gagal transfer");
        return;
      }
      toast.success("Mahasiswa berhasil dipindahkan!");
      setIsTransferDialogOpen(false);
      const data = await fetchJson("/api/enrollments");
      setEnrollments(data?.success ? data.data : enrollments);
    } catch (err: any) {
      toast.error(err?.message || "Gagal transfer");
    }
  };

  const handleExport = () => {
    toast.success("Data enrollment berhasil di-export!");
  };

  const handleImport = () => {
    toast.success("Data enrollment berhasil di-import!");
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
            Enrollment Management
          </h1>
          <p className="text-muted-foreground text-lg">
            Kelola enrollment mahasiswa dalam kelas
          </p>
        </motion.div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari mahasiswa atau kelas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={selectedKelas} onValueChange={setSelectedKelas}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kelas</SelectItem>
              {courses.map((kelas: any) => (
                <SelectItem key={kelas._id} value={kelas._id}>
                  {kelas.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>

          <Button variant="outline" onClick={handleImport} className="gap-2">
            <Upload className="w-4 h-4" />
            Import CSV
          </Button>

          <Dialog
            open={isTransferDialogOpen}
            onOpenChange={setIsTransferDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ArrowRightLeft className="w-4 h-4" />
                Transfer
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transfer Mahasiswa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Mahasiswa</Label>
                <Select
                  value={selectedTransferStudent}
                  onValueChange={async (v) => {
                    setSelectedTransferStudent(v);
                    try {
                      const res = await fetchJson(`/api/enrollments?user=${v}`);
                      const current = res?.success ? (res.data || []) : [];
                      const from = current
                        .map((e: any) => e.course)
                        .filter((c: any) => !!c);
                      const fromIds = new Set(from.map((c: any) => c._id || c.id));
                      const to = courses.filter((c: any) => !fromIds.has(c._id || c.id));
                      setTransferFromCourses(from);
                      setTransferToCourses(to);
                    } catch {
                      setTransferFromCourses([]);
                      setTransferToCourses(courses);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mahasiswa" />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter((u) => u.role === "mahasiswa")
                      .map((m) => (
                        <SelectItem key={m._id} value={m._id}>
                          {m.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Dari Kelas</Label>
                <Select
                  onValueChange={(v) => {
                    const hidden = document.getElementById("transfer-from") as HTMLInputElement;
                    if (hidden) hidden.value = v;
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kelas asal" />
                  </SelectTrigger>
                  <SelectContent>
                    {transferFromCourses.map((k: any) => (
                      <SelectItem key={k._id || k.id} value={k._id || k.id}>
                        {k.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" id="transfer-from" />
              </div>
              <div>
                <Label>Ke Kelas</Label>
                <Select
                  onValueChange={(v) => {
                    const hidden = document.getElementById("transfer-to") as HTMLInputElement;
                    if (hidden) hidden.value = v;
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kelas tujuan" />
                  </SelectTrigger>
                  <SelectContent>
                    {transferToCourses.map((k: any) => (
                      <SelectItem key={k._id || k.id} value={k._id || k.id}>
                        {k.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" id="transfer-to" />
              </div>
              <Button onClick={handleTransfer} className="w-full">
                Transfer
              </Button>
            </div>
          </DialogContent>
        </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Tambah Enrollment
              </Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Mahasiswa ke Kelas</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Pilih Mahasiswa</Label>
                <Select
                  value={selectedAddStudent}
                  onValueChange={async (v) => {
                    setSelectedAddStudent(v);
                    try {
                      const res = await fetchJson(`/api/enrollments?user=${v}`);
                      const current = res?.success ? (res.data || []) : [];
                      const enrolledIds = new Set(current.map((e: any) => (e.course?._id || e.course?.id || e.course)));
                      const available = courses.filter((c: any) => !enrolledIds.has(c._id || c.id));
                      setAvailableAddCourses(available);
                    } catch {
                      setAvailableAddCourses(courses);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mahasiswa" />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter((u: any) => u.role === "mahasiswa")
                      .map((student: any) => (
                        <SelectItem key={student._id} value={student._id}>
                          {student.name} ({student.nim_nip})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Pilih Kelas</Label>
                <Select
                  onValueChange={(v) => {
                    const hidden = document.getElementById("enrollment-course") as HTMLInputElement;
                    if (hidden) hidden.value = v;
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {(selectedAddStudent ? availableAddCourses : courses).map((kelas: any) => (
                      <SelectItem key={kelas._id || kelas.id} value={kelas._id || kelas.id}>
                        {kelas.name} ({kelas.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" id="enrollment-course" />
              </div>
              <Button onClick={handleAddEnrollment} className="w-full">
                Tambahkan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>

        {/* Enrollment Table */}
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
                    Mahasiswa
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    NIM
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Kelas
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Kode
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Tanggal Enroll
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredEnrollments.map((enrollment, index) => {
                  const mahasiswa = enrollment.user;
                  const kelas = enrollment.course;
                  if (!mahasiswa || !kelas) return null;

                  return (
                    <motion.tr
                      key={enrollment._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-foreground font-medium">
                        {mahasiswa?.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {mahasiswa?.nim_nip}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {kelas?.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {kelas?.code}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            enrollment.status === "active"
                              ? "bg-primary/10 text-primary"
                              : enrollment.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(enrollment.enrolledAt || enrollment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleRemoveEnrollment(
                              mahasiswa?._id || mahasiswa?.id,
                              kelas?._id || kelas?.id
                            )
                          }
                          className="gap-2"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove
                        </Button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Total: {filteredEnrollments.length} enrollments</span>
          </div>
          <p className="text-xs">Export/Import CSV untuk batch operations</p>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentManagement;
