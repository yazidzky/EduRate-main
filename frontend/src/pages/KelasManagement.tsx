import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Pencil, Trash2, Users, BookOpen } from "lucide-react";
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
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

const KelasManagement = () => {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [useNewInstitution, setUseNewInstitution] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [editSelectedStudentAdd, setEditSelectedStudentAdd] = useState<string[]>([]);
  const [editSelectedStudentRemove, setEditSelectedStudentRemove] = useState<string[]>([]);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [studentSearchAdd, setStudentSearchAdd] = useState("");
  const [studentSearchRemove, setStudentSearchRemove] = useState("");
  const [savingAdd, setSavingAdd] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [useNewTeacher, setUseNewTeacher] = useState(false);
  const [useNewStudentAdd, setUseNewStudentAdd] = useState(false);
  const [useNewStudentEdit, setUseNewStudentEdit] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesData, institutionsData, teachersData, usersData] = await Promise.all([
          fetchJson("/api/courses"),
          fetchJson("/api/institutions"),
          fetchJson("/api/teachers"),
          fetchJson("/api/users"),
        ]);

        setCourses(coursesData?.success ? coursesData.data : []);
        setInstitutions(institutionsData?.success ? institutionsData.data : []);
        setTeachers(teachersData?.success ? teachersData.data : []);
        setUsers(usersData?.success ? usersData.data : []);
      } catch {
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (isDialogOpen) {
      setUseNewTeacher(false);
      setUseNewStudentAdd(false);
    }
  }, [isDialogOpen]);

  const filteredKelas = courses.filter((kelas: any) => {
    return (
      kelas.name.toLowerCase().includes(search.toLowerCase()) ||
      kelas.code.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleAddKelas = async () => {
    try {
      setSavingAdd(true);
      // Get form data from dialog inputs
      const name = (document.getElementById("kelas-name") as HTMLInputElement)
        ?.value;
      const code = (document.getElementById("kelas-code") as HTMLInputElement)
        ?.value;
      const semester = (
        document.getElementById("kelas-semester") as HTMLInputElement
      )?.value;
      const schedule = (
        document.getElementById("kelas-schedule") as HTMLInputElement
      )?.value;
      const room = (document.getElementById("kelas-room") as HTMLInputElement)
        ?.value;
      const institutionSelected = (
        document.getElementById("kelas-institution") as HTMLInputElement
      )?.value;
      const teacherSelected = (
        document.getElementById("kelas-teacher") as HTMLInputElement
      )?.value;
      const newInstName = (
        document.getElementById("new-inst-name") as HTMLInputElement
      )?.value;
      const newInstTypeRaw = (
        document.getElementById("new-inst-type") as HTMLInputElement
      )?.value;
      const newInstType = newInstTypeRaw || "university";

      let teacherFinal = teacherSelected;
      const selectedToEnroll = [...selectedStudentIds];

      if (useNewTeacher) {
        const tName = (document.getElementById("new-teacher-name") as HTMLInputElement)?.value;
        const tDept = (document.getElementById("new-teacher-dept") as HTMLInputElement)?.value;
        if (!tName || !tDept || !(useNewInstitution ? true : !!institutionSelected)) {
          toast.error("Nama dosen, departemen, dan institusi wajib diisi");
          return;
        }
        const instForTeacher = useNewInstitution ? undefined : institutionSelected;
        let teacherInstitution = instForTeacher as any;
        if (useNewInstitution) {
          if (!newInstName || !newInstType) {
            toast.error("Nama dan tipe institusi baru wajib diisi");
            return;
          }
          const createInst = await fetchJson("/api/institutions", {
            method: "POST",
            body: { name: newInstName, type: newInstType },
          });
          if (!createInst?.success) {
            toast.error(createInst?.message || "Gagal membuat institusi");
            return;
          }
          teacherInstitution = createInst.data?._id || createInst.data?.id || createInst?.data;
        }
        const createTeacher = await fetchJson("/api/teachers", {
          method: "POST",
          body: { name: tName, institution: teacherInstitution, department: tDept },
        });
        if (!createTeacher?.success) {
          toast.error(createTeacher?.message || "Gagal membuat dosen");
          return;
        }
        teacherFinal = createTeacher.data?._id || createTeacher.data?.id || createTeacher?.data;
      }

      if (!name || !code || (!useNewInstitution && !institutionSelected)) {
        toast.error("Nama, kode, dan institusi wajib diisi!");
        return;
      }
      if (!teacherFinal) {
        toast.error("Pilih dosen untuk kelas");
        return;
      }

      let institution = institutionSelected;
      if (useNewInstitution) {
        if (!newInstName || !newInstType) {
          toast.error("Nama dan tipe institusi baru wajib diisi");
          return;
        }
        const createInst = await fetchJson("/api/institutions", {
          method: "POST",
          body: { name: newInstName, type: newInstType },
        });
        if (!createInst?.success) {
          toast.error(createInst?.message || "Gagal membuat institusi");
          return;
        }
        institution = createInst.data?._id || createInst.data?.id || createInst?.data;
      }

      const courseData = {
        name,
        code,
        institution,
        semester: parseInt(semester) || 1,
        schedule,
        room,
        teacher: teacherFinal || undefined,
        enrolledStudents: selectedToEnroll,
      };

      const response = await fetchJson("/api/courses", {
        method: "POST",
        body: courseData,
      });

      if (response.success) {
        const courseId = response.data?._id || response.data?.id;
        if (useNewStudentAdd) {
          const sName = (document.getElementById("new-student-name") as HTMLInputElement)?.value;
          const sEmail = (document.getElementById("new-student-email") as HTMLInputElement)?.value;
          const sPass = (document.getElementById("new-student-password") as HTMLInputElement)?.value;
          const sNim = (document.getElementById("new-student-nim") as HTMLInputElement)?.value;
          if (!sName || !sEmail || !sPass || !sNim || !institution) {
            toast.error("Data mahasiswa baru wajib lengkap");
            setSavingAdd(false);
            return;
          }
          const createStudent = await fetchJson("/api/users", {
            method: "POST",
            body: { name: sName, email: sEmail, password: sPass, role: "mahasiswa", nim_nip: sNim, institution },
          });
          if (createStudent?.success) {
            const newSid = createStudent.data?._id || createStudent.data?.id || createStudent?.data;
            if (newSid) {
            selectedToEnroll.push(newSid);
            }
            const usersDataRefresh2 = await fetchJson("/api/users");
            setUsers(usersDataRefresh2?.success ? usersDataRefresh2.data : users);
          } else {
            toast.error(createStudent?.message || "Gagal membuat mahasiswa baru");
          }
        }
        if (Array.isArray(selectedToEnroll) && selectedToEnroll.length > 0 && courseId) {
          const enrollCalls = selectedToEnroll.map((sid) =>
            fetchJson("/api/enrollments/admin", {
              method: "POST",
              body: { user: sid, course: courseId },
            })
          );
          const results = await Promise.allSettled(enrollCalls);
          const successes: string[] = [];
          const fails: string[] = [];
          results.forEach((r, idx) => {
            const sid = selectedToEnroll[idx];
            const user = users.find((u: any) => u._id === sid);
            const name = user ? `${user.name} (${user.nim_nip})` : sid;
            if (r.status === "fulfilled" && (r.value as any)?.success) successes.push(name);
            else fails.push(name);
          });
          if (successes.length > 0) {
            const list = successes.slice(0, 5).join(", ");
            const more = successes.length > 5 ? `, dan ${successes.length - 5} lainnya` : "";
            toast.success(`Enrollment berhasil (${successes.length}): ${list}${more}`);
          }
          if (fails.length > 0) {
            const list = fails.slice(0, 5).join(", ");
            const more = fails.length > 5 ? `, dan ${fails.length - 5} lainnya` : "";
            toast.error(`Enrollment gagal (${fails.length}): ${list}${more}`);
          }
        }
        toast.success("Kelas berhasil ditambahkan!");
        setIsDialogOpen(false);
        setUseNewInstitution(false);
        setSelectedStudentIds([]);
        // Refresh courses list
        const [data, usersDataRefresh] = await Promise.all([
          fetchJson("/api/courses"),
          fetchJson("/api/users"),
        ]);
        setCourses(data?.success ? data.data : []);
        setUsers(usersDataRefresh?.success ? usersDataRefresh.data : users);
        // Refresh institutions if created new
        if (useNewInstitution) {
          const instData = await fetchJson("/api/institutions");
          setInstitutions(instData?.success ? instData.data : institutions);
        }
      } else {
        toast.error(response.message || "Gagal menambahkan kelas");
      }
    } catch {
      toast.error("Gagal menambahkan kelas");
    } finally {
      setSavingAdd(false);
    }
  };

  const openEditDialog = (course: any) => {
    setEditingCourse(course);
    setIsEditDialogOpen(true);
    setUseNewInstitution(false);
    setUseNewTeacher(false);
    setUseNewStudentEdit(false);
    setEditSelectedStudentAdd([]);
    setEditSelectedStudentRemove([]);
    const instInput = document.getElementById("edit-kelas-institution") as HTMLInputElement;
    if (instInput) instInput.value = course?.institution?._id || course?.institution || "";
    const teacherInput = document.getElementById("edit-kelas-teacher") as HTMLInputElement;
    if (teacherInput) teacherInput.value = course?.teacher?._id || course?.teacher || "";
  };

  const handleUpdateKelas = async () => {
    if (!editingCourse) return;
    try {
      setSavingEdit(true);
      const name = (document.getElementById("edit-kelas-name") as HTMLInputElement)?.value;
      const code = (document.getElementById("edit-kelas-code") as HTMLInputElement)?.value;
      const semester = (document.getElementById("edit-kelas-semester") as HTMLInputElement)?.value;
      const schedule = (document.getElementById("edit-kelas-schedule") as HTMLInputElement)?.value;
      const room = (document.getElementById("edit-kelas-room") as HTMLInputElement)?.value;
      const institutionSelected = (document.getElementById("edit-kelas-institution") as HTMLInputElement)?.value;
      const teacherSelected = (document.getElementById("edit-kelas-teacher") as HTMLInputElement)?.value;
      const newInstName = (document.getElementById("edit-new-inst-name") as HTMLInputElement)?.value;
      const newInstTypeRaw = (document.getElementById("edit-new-inst-type") as HTMLInputElement)?.value;
      const newInstType = newInstTypeRaw || "university";

      let teacherFinal = teacherSelected;
      if (useNewTeacher) {
        const tName = (document.getElementById("edit-new-teacher-name") as HTMLInputElement)?.value;
        const tDept = (document.getElementById("edit-new-teacher-dept") as HTMLInputElement)?.value;
        const instForTeacher = useNewInstitution ? undefined : institutionSelected;
        let teacherInstitution = instForTeacher as any;
        if (!tName || !tDept) {
          toast.error("Nama dan departemen dosen wajib diisi");
          setSavingEdit(false);
          return;
        }
        if (useNewInstitution) {
          if (!newInstName || !newInstType) {
            toast.error("Nama dan tipe institusi baru wajib diisi");
            return;
          }
          const createInst = await fetchJson("/api/institutions", {
            method: "POST",
            body: { name: newInstName, type: newInstType },
          });
          if (!createInst?.success) {
            toast.error(createInst?.message || "Gagal membuat institusi");
            return;
          }
          teacherInstitution = createInst.data?._id || createInst.data?.id || createInst?.data;
        }
        const createTeacher = await fetchJson("/api/teachers", {
          method: "POST",
          body: { name: tName, institution: teacherInstitution, department: tDept },
        });
        if (!createTeacher?.success) {
          toast.error(createTeacher?.message || "Gagal membuat dosen");
          return;
        }
        teacherFinal = createTeacher.data?._id || createTeacher.data?.id || createTeacher?.data;
      }

      if (!name || !code) {
        toast.error("Nama dan kode wajib diisi");
        return;
      }

      let institution = institutionSelected;
      if (useNewInstitution) {
        if (!newInstName || !newInstType) {
          toast.error("Nama dan tipe institusi baru wajib diisi");
          return;
        }
        const createInst = await fetchJson("/api/institutions", {
          method: "POST",
          body: { name: newInstName, type: newInstType },
        });
        if (!createInst?.success) {
          toast.error(createInst?.message || "Gagal membuat institusi");
          return;
        }
        institution = createInst.data?._id || createInst.data?.id || createInst?.data;
      }

      const payload: any = {
        name,
        code,
        department: editingCourse?.department,
        teacher: teacherFinal || undefined,
        description: editingCourse?.description,
        schedule,
        room,
        semester: parseInt(semester) || editingCourse?.semester || 1,
      };
      if (institution) payload.institution = institution;

      const res = await fetchJson(`/api/courses/${editingCourse._id}`, {
        method: "PUT",
        body: payload,
      });

      if (!res?.success) {
        toast.error(res?.message || "Gagal mengupdate kelas");
        return;
      }

      const courseId = editingCourse._id;
      if (!courseId) {
        toast.error("Kelas tidak valid");
        setSavingEdit(false);
        return;
      }
      const toAdd = [...editSelectedStudentAdd];
      if (useNewStudentEdit) {
        const sName = (document.getElementById("edit-new-student-name") as HTMLInputElement)?.value;
        const sEmail = (document.getElementById("edit-new-student-email") as HTMLInputElement)?.value;
        const sPass = (document.getElementById("edit-new-student-password") as HTMLInputElement)?.value;
        const sNim = (document.getElementById("edit-new-student-nim") as HTMLInputElement)?.value;
        const instForStudent = (document.getElementById("edit-kelas-institution") as HTMLInputElement)?.value || editingCourse?.institution?._id;
        if (!sName || !sEmail || !sPass || !sNim || !instForStudent) {
          toast.error("Data mahasiswa baru wajib lengkap");
          setSavingEdit(false);
          return;
        }
        const createStudent = await fetchJson("/api/users", {
          method: "POST",
          body: { name: sName, email: sEmail, password: sPass, role: "mahasiswa", nim_nip: sNim, institution: instForStudent },
        });
        if (createStudent?.success) {
          const newSid = createStudent.data?._id || createStudent.data?.id || createStudent?.data;
          if (newSid) toAdd.push(newSid);
          const usersDataRefresh3 = await fetchJson("/api/users");
          setUsers(usersDataRefresh3?.success ? usersDataRefresh3.data : users);
        } else {
          toast.error(createStudent?.message || "Gagal membuat mahasiswa baru");
        }
      }
      const addCalls = toAdd.map((sid) =>
        fetchJson("/api/enrollments/admin", { method: "POST", body: { user: sid, course: courseId } })
      );
      const removeCalls = editSelectedStudentRemove.map((sid) =>
        fetchJson("/api/enrollments/admin", { method: "DELETE", body: { user: sid, course: courseId } })
      );
      const [addResults, removeResults] = await Promise.all([
        Promise.allSettled(addCalls),
        Promise.allSettled(removeCalls),
      ]);
      const addSuccess = addResults.filter((r) => r.status === "fulfilled" && (r.value as any)?.success).length;
      const addDuplicate = addResults.filter((r: any) => r.status === "rejected" && ((r.reason?.data?.message || r.reason?.message || "").includes("Already enrolled"))).length;
      const addFail = addResults.length - addSuccess - addDuplicate;
      const remSuccess = removeResults.filter((r) => r.status === "fulfilled" && (r.value as any)?.success).length;
      const remFail = removeResults.length - remSuccess;
      const addSuccessNames = addResults.map((r, idx) => ({ r, sid: toAdd[idx] }))
        .filter((x) => x.r.status === "fulfilled" && (x.r.value as any)?.success)
        .map((x) => {
          const u = users.find((uu: any) => uu._id === x.sid);
          return u ? `${u.name} (${u.nim_nip})` : x.sid;
        });
      const addFailNames = addResults.map((r: any, idx) => ({ r, sid: toAdd[idx] }))
        .filter((x) => !(x.r.status === "fulfilled" && (x.r.value as any)?.success) && !((x.r.reason?.data?.message || x.r.reason?.message || "").includes("Already enrolled")))
        .map((x) => {
          const u = users.find((uu: any) => uu._id === x.sid);
          return u ? `${u.name} (${u.nim_nip})` : x.sid;
        });
      const remSuccessNames = removeResults.map((r, idx) => ({ r, sid: editSelectedStudentRemove[idx] }))
        .filter((x) => x.r.status === "fulfilled" && (x.r.value as any)?.success)
        .map((x) => {
          const u = users.find((uu: any) => uu._id === x.sid);
          return u ? `${u.name} (${u.nim_nip})` : x.sid;
        });
      const remFailNames = removeResults.map((r, idx) => ({ r, sid: editSelectedStudentRemove[idx] }))
        .filter((x) => !(x.r.status === "fulfilled" && (x.r.value as any)?.success))
        .map((x) => {
          const u = users.find((uu: any) => uu._id === x.sid);
          return u ? `${u.name} (${u.nim_nip})` : x.sid;
        });
      if (addSuccess > 0 || remSuccess > 0) {
        const addList = addSuccessNames.slice(0, 5).join(", ");
        const addMore = addSuccessNames.length > 5 ? `, dan ${addSuccessNames.length - 5} lainnya` : "";
        const remList = remSuccessNames.slice(0, 5).join(", ");
        const remMore = remSuccessNames.length > 5 ? `, dan ${remSuccessNames.length - 5} lainnya` : "";
        toast.success(`Perubahan berhasil (Tambah: ${addSuccess}${addSuccess ? ": " + addList + addMore : ""}, Hapus: ${remSuccess}${remSuccess ? ": " + remList + remMore : ""})`);
      }
      if (addFail > 0 || remFail > 0) {
        const addList = addFailNames.slice(0, 5).join(", ");
        const addMore = addFailNames.length > 5 ? `, dan ${addFailNames.length - 5} lainnya` : "";
        const remList = remFailNames.slice(0, 5).join(", ");
        const remMore = remFailNames.length > 5 ? `, dan ${remFailNames.length - 5} lainnya` : "";
        toast.error(`Perubahan gagal (Tambah: ${addFail}${addFail ? ": " + addList + addMore : ""}, Hapus: ${remFail}${remFail ? ": " + remList + remMore : ""})`);
      }

      toast.success("Kelas berhasil diperbarui");
      setIsEditDialogOpen(false);
      setEditingCourse(null);

      const [coursesRefresh, usersRefresh] = await Promise.all([
        fetchJson("/api/courses"),
        fetchJson("/api/users"),
      ]);
      setCourses(coursesRefresh?.success ? coursesRefresh.data : courses);
      setUsers(usersRefresh?.success ? usersRefresh.data : users);
      if (useNewInstitution) {
        const instRefresh = await fetchJson("/api/institutions");
        setInstitutions(instRefresh?.success ? instRefresh.data : institutions);
      }
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengupdate kelas");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteKelas = async (id: string, name: string) => {
    if (window.confirm(`Hapus kelas ${name}?`)) {
      try {
        const response = await fetchJson(`/api/courses/${id}`, {
          method: "DELETE",
        });

        if (response.success) {
          toast.success("Kelas berhasil dihapus!");
          // Refresh courses list
          const data = await fetchJson("/api/courses");
          setCourses(data?.success ? data.data : []);
        } else {
          toast.error(response.message || "Gagal menghapus kelas");
        }
      } catch {
        toast.error("Gagal menghapus kelas");
      }
    }
  };

  return (
    <>
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
            Kelas Management
          </h1>
          <p className="text-muted-foreground text-lg">
            Kelola data kelas dan enrollment
          </p>
        </motion.div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama kelas atau kode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button
            onClick={() => navigate("/enrollment-management")}
            variant="outline"
            className="gap-2"
          >
            <Users className="w-4 h-4" />
            Kelola Enrollment
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Tambah Kelas
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Kelas Baru</DialogTitle>
              </DialogHeader>
            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1" aria-busy={savingAdd}>
                <div>
                  <Label htmlFor="kelas-name">Nama Kelas</Label>
                  <Input id="kelas-name" placeholder="Masukkan nama kelas" />
                </div>
                <div>
                  <Label htmlFor="kelas-code">Kode Kelas</Label>
                  <Input id="kelas-code" placeholder="Masukkan kode kelas" />
                </div>
                <div>
                  <Label htmlFor="kelas-semester">Semester</Label>
                  <Input
                    id="kelas-semester"
                    type="number"
                    placeholder="Masukkan semester"
                  />
                </div>
                <div>
                  <Label htmlFor="kelas-schedule">Jadwal</Label>
                  <Input
                    id="kelas-schedule"
                    placeholder="Contoh: Senin, 08:00 - 10:00"
                  />
                </div>
                <div>
                  <Label htmlFor="kelas-room">Ruangan</Label>
                  <Input id="kelas-room" placeholder="Contoh: Lab 301" />
                </div>
            
                <div>
                  <Label htmlFor="kelas-institution">Institusi</Label>
                  <Select
                    onValueChange={(value) => {
                      const hiddenInput = document.getElementById(
                        "kelas-institution"
                      ) as HTMLInputElement;
                      if (hiddenInput) hiddenInput.value = value;
                      setUseNewInstitution(false);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih institusi" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutions.map((inst: any) => (
                        <SelectItem key={inst._id} value={inst._id}>
                          {inst.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input type="hidden" id="kelas-institution" />
                  <div className="flex items-center gap-2 mt-2">
                    <Checkbox
                      id="use-new-inst"
                      checked={useNewInstitution}
                      onCheckedChange={(v: any) => setUseNewInstitution(!!v)}
                    />
                    <Label htmlFor="use-new-inst">Tambah institusi baru</Label>
                  </div>
                  {useNewInstitution && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Nama Institusi</Label>
                        <Input id="new-inst-name" placeholder="Nama institusi" />
                      </div>
                      <div>
                        <Label>Tipe</Label>
                        <Select
                          onValueChange={(v) => {
                            const hidden = document.getElementById("new-inst-type") as HTMLInputElement;
                            if (hidden) hidden.value = v;
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="university">University</SelectItem>
                            <SelectItem value="college">College</SelectItem>
                            <SelectItem value="school">School</SelectItem>
                            <SelectItem value="institute">Institute</SelectItem>
                          </SelectContent>
                        </Select>
                        <input type="hidden" id="new-inst-type" />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <Label>Pilih Dosen</Label>
                  <Input placeholder="Cari dosen" className="mt-2 mb-2" value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)} />
                  <Select
                    onValueChange={(value) => {
                      const hiddenInput = document.getElementById(
                        "kelas-teacher"
                      ) as HTMLInputElement;
                      if (hiddenInput) hiddenInput.value = value;
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih dosen" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.filter((t: any) => t.name.toLowerCase().includes(teacherSearch.toLowerCase())).map((t: any) => (
                        <SelectItem key={t._id} value={t._id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input type="hidden" id="kelas-teacher" />
                  <div className="flex items-center gap-2 mt-2">
                    <Checkbox id="use-new-teacher" checked={useNewTeacher} onCheckedChange={(v: any) => setUseNewTeacher(!!v)} />
                    <Label htmlFor="use-new-teacher">Tambah dosen baru</Label>
                  </div>
                  {useNewTeacher && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Nama Dosen</Label>
                        <Input id="new-teacher-name" placeholder="Nama dosen" />
                      </div>
                      <div>
                        <Label>Departemen</Label>
                        <Input id="new-teacher-dept" placeholder="Departemen" />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <Label>Pilih Mahasiswa</Label>
                  <Input placeholder="Cari mahasiswa" className="mt-2 mb-2" value={studentSearchAdd} onChange={(e) => setStudentSearchAdd(e.target.value)} />
                  <div className="max-h-40 overflow-auto border rounded-md p-2 space-y-2">
                    {users.filter((u: any) => u.role === "mahasiswa" && (u.name.toLowerCase().includes(studentSearchAdd.toLowerCase()) || u.nim_nip.toLowerCase().includes(studentSearchAdd.toLowerCase()))).map((m: any) => {
                      const checked = selectedStudentIds.includes(m._id);
                      return (
                        <div key={m._id} className="flex items-center gap-2">
                          <Checkbox
                            checked={checked}
                            disabled={savingAdd}
                            onCheckedChange={(v: any) => {
                              const isChecked = !!v;
                              setSelectedStudentIds((prev) => {
                                if (isChecked) return [...prev, m._id];
                                return prev.filter((id) => id !== m._id);
                              });
                            }}
                          />
                          <span className="text-sm text-foreground">{m.name} ({m.nim_nip})</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Dipilih: {selectedStudentIds.length} mahasiswa</p>
                  {savingAdd && <p className="text-xs text-muted-foreground mt-1">Sedang menyimpan...</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <Checkbox id="use-new-student-add" checked={useNewStudentAdd} onCheckedChange={(v: any) => setUseNewStudentAdd(!!v)} />
                    <Label htmlFor="use-new-student-add">Tambah mahasiswa baru</Label>
                  </div>
                  {useNewStudentAdd && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Nama</Label>
                        <Input id="new-student-name" placeholder="Nama mahasiswa" />
                      </div>
                      <div>
                        <Label>NIM</Label>
                        <Input id="new-student-nim" placeholder="NIM" />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input id="new-student-email" type="email" placeholder="Email" />
                      </div>
                      <div>
                        <Label>Password</Label>
                        <Input id="new-student-password" type="password" placeholder="Password" />
                      </div>
                    </div>
                  )}
                </div>
                <Button onClick={handleAddKelas} className="w-full" disabled={savingAdd}>
                  {savingAdd ? "Menyimpan..." : `Simpan (Mahasiswa: ${selectedStudentIds.length})`}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Kelas Grid */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-muted-foreground">Loading courses...</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredKelas.map((kelas: any, index: number) => (
              <motion.div
                key={kelas._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-xl p-6 shadow-soft border border-border hover:shadow-medium transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {kelas.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {kelas.code}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    Sem {kelas.semester || 1}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{kelas.enrolledStudents?.length || 0} Mahasiswa</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>{kelas.teacher?.name || "Belum ada dosen"}</span>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg mb-4 text-sm">
                  <p className="text-muted-foreground mb-1">
                    📅 {kelas.schedule || "Jadwal belum ditentukan"}
                  </p>
                  <p className="text-muted-foreground">
                    📍 {kelas.room || "Ruangan belum ditentukan"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-2" onClick={() => openEditDialog(kelas)}>
                    <Pencil className="w-3 h-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteKelas(kelas._id, kelas.name)}
                    className="flex-1 gap-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>Total: {filteredKelas.length} kelas</span>
          </div>
        </div>
      </div>
    </div>

    {/* Edit Dialog */}
    {isEditDialogOpen && editingCourse && (
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kelas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1" aria-busy={savingEdit}>
            <div>
              <Label htmlFor="edit-kelas-name">Nama Kelas</Label>
              <Input id="edit-kelas-name" defaultValue={editingCourse.name} />
            </div>
            <div>
              <Label htmlFor="edit-kelas-code">Kode Kelas</Label>
              <Input id="edit-kelas-code" defaultValue={editingCourse.code} />
            </div>
            <div>
              <Label htmlFor="edit-kelas-semester">Semester</Label>
              <Input id="edit-kelas-semester" type="number" defaultValue={editingCourse.semester || 1} />
            </div>
            <div>
              <Label htmlFor="edit-kelas-schedule">Jadwal</Label>
              <Input id="edit-kelas-schedule" defaultValue={editingCourse.schedule || ""} />
            </div>
            <div>
              <Label htmlFor="edit-kelas-room">Ruangan</Label>
              <Input id="edit-kelas-room" defaultValue={editingCourse.room || ""} />
            </div>
            
            <div>
              <Label>Institusi</Label>
              <Select
                onValueChange={(value) => {
                  const hiddenInput = document.getElementById("edit-kelas-institution") as HTMLInputElement;
                  if (hiddenInput) hiddenInput.value = value;
                  setUseNewInstitution(false);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={editingCourse?.institution?.name || "Pilih institusi"} />
                </SelectTrigger>
                <SelectContent>
                  {institutions.map((inst: any) => (
                    <SelectItem key={inst._id} value={inst._id}>
                      {inst.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" id="edit-kelas-institution" />
              <div className="flex items-center gap-2 mt-2">
                <Checkbox id="edit-use-new-inst" checked={useNewInstitution} onCheckedChange={(v: any) => setUseNewInstitution(!!v)} />
                <Label htmlFor="edit-use-new-inst">Tambah institusi baru</Label>
              </div>
              {useNewInstitution && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Nama Institusi</Label>
                    <Input id="edit-new-inst-name" placeholder="Nama institusi" />
                  </div>
                  <div>
                    <Label>Tipe</Label>
                    <Select
                      onValueChange={(v) => {
                        const hidden = document.getElementById("edit-new-inst-type") as HTMLInputElement;
                        if (hidden) hidden.value = v;
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="university">University</SelectItem>
                        <SelectItem value="college">College</SelectItem>
                        <SelectItem value="school">School</SelectItem>
                        <SelectItem value="institute">Institute</SelectItem>
                      </SelectContent>
                    </Select>
                    <input type="hidden" id="edit-new-inst-type" />
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label>Pilih Dosen</Label>
              <Select
                onValueChange={(value) => {
                  const hiddenInput = document.getElementById("edit-kelas-teacher") as HTMLInputElement;
                  if (hiddenInput) hiddenInput.value = value;
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={editingCourse?.teacher?.name || "Pilih dosen"} />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t: any) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" id="edit-kelas-teacher" />
              <div className="flex items-center gap-2 mt-2">
                <Checkbox id="edit-use-new-teacher" checked={useNewTeacher} onCheckedChange={(v: any) => setUseNewTeacher(!!v)} />
                <Label htmlFor="edit-use-new-teacher">Tambah dosen baru</Label>
              </div>
              {useNewTeacher && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Nama Dosen</Label>
                    <Input id="edit-new-teacher-name" placeholder="Nama dosen" />
                  </div>
                  <div>
                    <Label>Departemen</Label>
                    <Input id="edit-new-teacher-dept" placeholder="Departemen" />
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label>Mahasiswa Saat Ini</Label>
              <Input placeholder="Cari mahasiswa" className="mt-2 mb-2" value={studentSearchRemove} onChange={(e) => setStudentSearchRemove(e.target.value)} />
              <div className="max-h-40 overflow-auto border rounded-md p-2 space-y-2">
                {(editingCourse.enrolledStudents || []).filter((s: any) => {
                  const id = s?._id || s;
                  const u = users.find((x: any) => x._id === id);
                  const name = u?.name || "";
                  const nim = u?.nim_nip || "";
                  return name.toLowerCase().includes(studentSearchRemove.toLowerCase()) || nim.toLowerCase().includes(studentSearchRemove.toLowerCase());
                }).map((s: any) => {
                  const id = s?._id || s;
                  const name = (() => {
                    const u = users.find((x: any) => x._id === id);
                    return u ? `${u.name} (${u.nim_nip})` : id;
                  })();
                  const checked = editSelectedStudentRemove.includes(id);
                  return (
                    <div key={id} className="flex items-center gap-2">
                      <Checkbox
                        checked={checked}
                        disabled={savingEdit}
                        onCheckedChange={(v: any) => {
                          const isChecked = !!v;
                          setEditSelectedStudentRemove((prev) => {
                            if (isChecked) return [...prev, id];
                            return prev.filter((pid) => pid !== id);
                          });
                        }}
                      />
                      <span className="text-sm text-foreground">{name}</span>
                      <span className="text-xs text-muted-foreground">(centang untuk hapus)</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Ditandai hapus: {editSelectedStudentRemove.length} mahasiswa</p>
              {savingEdit && <p className="text-xs text-muted-foreground mt-1">Sedang menyimpan...</p>}
            </div>
            <div>
              <Label>Tambah Mahasiswa</Label>
              <Input placeholder="Cari mahasiswa" className="mt-2 mb-2" value={studentSearchAdd} onChange={(e) => setStudentSearchAdd(e.target.value)} />
              <div className="max-h-40 overflow-auto border rounded-md p-2 space-y-2">
                {users.filter((u: any) => u.role === "mahasiswa" && (u.name.toLowerCase().includes(studentSearchAdd.toLowerCase()) || u.nim_nip.toLowerCase().includes(studentSearchAdd.toLowerCase()))).map((m: any) => {
                  const id = m._id;
                  const isAlready = (editingCourse.enrolledStudents || []).some((s: any) => (s?._id || s) === id);
                  const checked = editSelectedStudentAdd.includes(id);
                  return (
                    <div key={id} className="flex items-center gap-2">
                       <Checkbox
                         checked={checked}
                         disabled={isAlready || savingEdit}
                         onCheckedChange={(v: any) => {
                           const isChecked = !!v;
                           setEditSelectedStudentAdd((prev) => {
                             if (isChecked) return [...prev, id];
                             return prev.filter((pid) => pid !== id);
                           });
                         }}
                       />
                      <span className="text-sm text-foreground">{m.name} ({m.nim_nip})</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Ditandai tambah: {editSelectedStudentAdd.length} mahasiswa</p>
              {savingEdit && <p className="text-xs text-muted-foreground mt-1">Sedang menyimpan...</p>}
              <div className="flex items-center gap-2 mt-2">
                <Checkbox id="edit-use-new-student" checked={useNewStudentEdit} onCheckedChange={(v: any) => setUseNewStudentEdit(!!v)} />
                <Label htmlFor="edit-use-new-student">Tambah mahasiswa baru</Label>
              </div>
              {useNewStudentEdit && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Nama</Label>
                    <Input id="edit-new-student-name" placeholder="Nama mahasiswa" />
                  </div>
                  <div>
                    <Label>NIM</Label>
                    <Input id="edit-new-student-nim" placeholder="NIM" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input id="edit-new-student-email" type="email" placeholder="Email" />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input id="edit-new-student-password" type="password" placeholder="Password" />
                  </div>
                </div>
              )}
            </div>
            <Button onClick={handleUpdateKelas} className="w-full" disabled={savingEdit}>{savingEdit ? "Menyimpan..." : `Simpan Perubahan (Tambah: ${editSelectedStudentAdd.length}, Hapus: ${editSelectedStudentRemove.length})`}</Button>
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  );
};

export default KelasManagement;
