import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import fetchJson from "@/lib/fetchJson";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, Star, Calendar, MapPin, ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const KelaskuPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [searchParams] = useSearchParams();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingTarget, setPendingTarget] = useState<{
    teacherId?: string;
    courseId?: string;
    toId?: string;
    type: string;
  } | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [classSearch, setClassSearch] = useState<Record<string, string>>({});
  const [meetingsByCourse, setMeetingsByCourse] = useState<Record<string, { totalMeetings: number; meetings: any[] }>>({});
  const [meetingEdit, setMeetingEdit] = useState<Record<string, { number?: number; date?: string; start?: string; end?: string; ratingEnabled?: boolean }>>({});
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("Pertemuan belum dibuat");
  const [alertDesc, setAlertDesc] = useState("Dosen belum mengatur pertemuan aktif untuk rating. Silakan coba lagi setelah pertemuan diaktifkan.");
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKelas = async () => {
      try {
        // setLoading(true);
        if (user?.role === "dosen" && user?.id) {
          let teacherId: string | undefined;
          try {
            const tRes = await fetchJson(`/api/teachers/by-user/${user.id}`);
            teacherId = tRes?.success
              ? tRes.data?._id || tRes.data?.id || tRes.data
              : undefined;
          } catch {
            teacherId = undefined;
          }
          const cRes = await fetchJson(
            teacherId ? `/api/courses?teacher=${teacherId}` : `/api/courses`
          );
          if (cRes?.success) {
            const list = Array.isArray(cRes.data) ? cRes.data : [];
            if (teacherId && list.length === 0) {
              const allRes = await fetchJson(`/api/courses`);
              const allList = Array.isArray(allRes?.data) ? allRes.data : [];
              const mine = allList.filter((c: any) => {
                const tu = c?.teacher?.user;
                const tuId = tu?._id || tu;
                return (
                  tuId === user.id ||
                  String(c?.teacher?.name || "") === String(user?.name || "")
                );
              });
              setKelasList(mine);
            } else {
              setKelasList(list);
            }
          }
          return;
        }
        const data = await fetchJson(`/api/courses`);
        if (data.success) {
          // Filter courses based on user role
          if (user?.role === "dosen") {
            const list = Array.isArray(data.data) ? data.data : [];
            setKelasList(list);
          } else if (user?.role === "mahasiswa") {
            const myCourses = data.data.filter(
              (course: any) =>
                Array.isArray(course.enrolledStudents) &&
                course.enrolledStudents.some(
                  (s: any) => (s?._id || s) === user.id
                )
            );
            setKelasList(myCourses);
          }
        }
      } catch (error) {
        // setError("Failed to load courses");
        toast.error((error as any)?.message || "Failed to load courses");
      } finally {
        // setLoading(false);
      }
    };

    if (user) {
      fetchKelas();
    }
  }, [user]);

  useEffect(() => {
    const courseId = searchParams.get("courseId");
    if (!courseId || kelasList.length === 0) return;
    const el = document.getElementById(`course-${courseId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add("ring-2", "ring-primary");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-primary");
      }, 1200);
    }
  }, [kelasList, searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">Kelasku</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Daftar kelas yang {user?.role === "dosen" ? "diampu" : "diikuti"}
          </p>
        </motion.div>

        <div className="space-y-6">
          {kelasList.map((kelas: any, index: number) => (
            <motion.div
              key={kelas._id || kelas.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              id={`course-${kelas._id || kelas.id}`}
              className="bg-card rounded-xl p-6 shadow-soft border border-border hover:shadow-medium transition-all"
            >
              <div
                className="flex items-start justify-between mb-4 cursor-pointer"
                onClick={() => {
                  const id = kelas._id || kelas.id;
                  const isOpen = expandedIds.includes(id);
                  setExpandedIds(
                    isOpen
                      ? expandedIds.filter((x) => x !== id)
                      : [...expandedIds, id]
                  );
                  if (!isOpen && user?.role === "dosen") {
                    const courseId = id;
                    (async () => {
                      try {
                        const res = await fetchJson(`/api/courses/${courseId}/meetings`);
                        const totalMeetings = res?.data?.totalMeetings || res?.data?.data?.totalMeetings || 0;
                        const meetings = res?.data?.meetings || res?.data?.data?.meetings || [];
                        setMeetingsByCourse((prev) => ({ ...prev, [courseId]: { totalMeetings, meetings } }));
                        const enabled = Array.isArray(meetings) ? meetings.filter((m: any) => !!m?.ratingEnabled).map((m: any) => Number(m?.number)).sort((a: number, b: number) => a - b) : [];
                        const allNumbers = Array.isArray(meetings) ? meetings.map((m: any) => Number(m?.number)).sort((a: number, b: number) => a - b) : [];
                        const selectedNumber = enabled[0] ?? allNumbers[0] ?? 1;
                        const selectedMeeting = Array.isArray(meetings) ? meetings.find((m: any) => Number(m?.number) === Number(selectedNumber)) : undefined;
                        setMeetingEdit((prev) => ({
                          ...prev,
                          [courseId]: {
                            number: selectedNumber,
                            date: selectedMeeting?.date ? String(selectedMeeting.date).slice(0, 10) : prev[courseId]?.date,
                            start: selectedMeeting?.startAt ? new Date(selectedMeeting.startAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }) : prev[courseId]?.start,
                            end: selectedMeeting?.endAt ? new Date(selectedMeeting.endAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }) : prev[courseId]?.end,
                            ratingEnabled: !!selectedMeeting?.ratingEnabled,
                          },
                        }));
                      } catch {}
                    })();
                  }
                }}
              >
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-1">
                    {kelas.name}
                  </h3>
                  <p className="text-muted-foreground">{kelas.code}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    Semester {kelas.semester}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform ${
                      expandedIds.includes(kelas._id || kelas.id)
                        ? "rotate-180"
                        : "rotate-0"
                    }`}
                  />
                </div>
              </div>

              <AnimatePresence initial={false}>
                {expandedIds.includes(kelas._id || kelas.id) && (
                  <motion.div
                    key={`search-${kelas._id || kelas.id}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mb-4 overflow-hidden"
                  >
                    <Input
                      placeholder="Cari dosen/mahasiswa dalam kelas ini"
                      value={classSearch[kelas._id || kelas.id] || ""}
                      onChange={(e) =>
                        setClassSearch({
                          ...classSearch,
                          [kelas._id || kelas.id]: e.target.value,
                        })
                      }
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{kelas.schedule}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{kelas.room}</span>
                </div>
              </div>

              {user?.role === "dosen" ? (
                <AnimatePresence initial={false}>
                  {expandedIds.includes(kelas._id || kelas.id) && (
                    <motion.div
                      key={`students-${kelas._id || kelas.id}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-border pt-6 overflow-hidden"
                    >
                      <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        Mahasiswa ({kelas.enrolledStudents?.length || 0})
                      </h4>
                      <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-medium">Kelola Pertemuan</p>
                          <span className="text-xs text-muted-foreground">Total: {meetingsByCourse[(kelas._id || kelas.id) as string]?.totalMeetings || kelas.totalMeetings || 0}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end">
                          <div>
                            <label className="text-sm text-muted-foreground">Pertemuan</label>
                            <select
                              className="mt-1 w-full border rounded-md p-2 bg-background"
                              value={String(meetingEdit[(kelas._id || kelas.id) as string]?.number || 1)}
                              onChange={(e) => {
                                const num = parseInt(e.target.value);
                                const courseId = (kelas._id || kelas.id) as string;
                                const m = meetingsByCourse[courseId]?.meetings || [];
                                const existing = m.find((x: any) => Number(x?.number) === num);
                                setMeetingEdit((prev) => ({
                                  ...prev,
                                  [courseId]: {
                                    number: num,
                                    date: existing?.date ? String(existing.date).slice(0, 10) : prev[courseId]?.date,
                                    start: existing?.startAt ? new Date(existing.startAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }) : prev[courseId]?.start,
                                    end: existing?.endAt ? new Date(existing.endAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }) : prev[courseId]?.end,
                                    ratingEnabled: !!existing?.ratingEnabled,
                                  },
                                }));
                              }}
                            >
                              {Array.from({ length: meetingsByCourse[(kelas._id || kelas.id) as string]?.totalMeetings || kelas.totalMeetings || 0 }).map((_, i) => (
                                <option key={i + 1} value={String(i + 1)}>Pertemuan ke-{i + 1}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">Mulai</label>
                            <input
                              type="time"
                              className="mt-1 w-full border rounded-md p-2 bg-background"
                              value={meetingEdit[(kelas._id || kelas.id) as string]?.start || ""}
                              onChange={(e) => {
                                const courseId = (kelas._id || kelas.id) as string;
                                setMeetingEdit((prev) => ({
                                  ...prev,
                                  [courseId]: { ...prev[courseId], start: e.target.value },
                                }));
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">Selesai</label>
                            <input
                              type="time"
                              className="mt-1 w-full border rounded-md p-2 bg-background"
                              value={meetingEdit[(kelas._id || kelas.id) as string]?.end || ""}
                              onChange={(e) => {
                                const courseId = (kelas._id || kelas.id) as string;
                                setMeetingEdit((prev) => ({
                                  ...prev,
                                  [courseId]: { ...prev[courseId], end: e.target.value },
                                }));
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">Tanggal</label>
                            <input
                              type="date"
                              className="mt-1 w-full border rounded-md p-2 bg-background"
                              value={meetingEdit[(kelas._id || kelas.id) as string]?.date || ""}
                              onChange={(e) => {
                                const courseId = (kelas._id || kelas.id) as string;
                                setMeetingEdit((prev) => ({
                                  ...prev,
                                  [courseId]: { ...prev[courseId], date: e.target.value },
                                }));
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <div>
                              <label className="text-sm text-muted-foreground">Aktifkan Rating</label>
                              <div className="mt-1">
                                <Switch
                                  checked={!!meetingEdit[(kelas._id || kelas.id) as string]?.ratingEnabled}
                                  onCheckedChange={(checked) => {
                                    const courseId = (kelas._id || kelas.id) as string;
                                    setMeetingEdit((prev) => ({
                                      ...prev,
                                      [courseId]: { ...prev[courseId], ratingEnabled: !!checked },
                                    }));
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button
                              onClick={async (e) => {
                                e.stopPropagation();
                                const courseId = (kelas._id || kelas.id) as string;
                                const edit = meetingEdit[courseId] || {};
                                const payload: any = { number: edit.number || 1 };
                                if (!edit.date || !edit.start || !edit.end) {
                                  toast.error("Tanggal, jam mulai, dan jam selesai wajib diisi");
                                  return;
                                }
                                payload.date = new Date(edit.date).toISOString();
                                if (typeof edit.ratingEnabled === "boolean") payload.ratingEnabled = edit.ratingEnabled;
                                {
                                  const startAt = new Date(`${edit.date}T${edit.start}:00`);
                                  const endAt = new Date(`${edit.date}T${edit.end}:00`);
                                  if (endAt.getTime() <= startAt.getTime()) {
                                    toast.error("Jam selesai harus setelah jam mulai");
                                    return;
                                  }
                                  payload.startAt = startAt.toISOString();
                                  payload.endAt = endAt.toISOString();
                                }
                                try {
                                  const res = await fetchJson(`/api/courses/${courseId}/meetings`, { method: "PUT", body: payload });
                                  if (!res?.success) {
                                    toast.error(res?.message || "Gagal menyimpan pertemuan");
                                    return;
                                  }
                                  const totalMeetings = res?.data?.totalMeetings || res?.data?.data?.totalMeetings || (meetingsByCourse[courseId]?.totalMeetings || kelas.totalMeetings || 0);
                                  const meetings = res?.data?.meetings || res?.data?.data?.meetings || [];
                                  setMeetingsByCourse((prev) => ({ ...prev, [courseId]: { totalMeetings, meetings } }));
                                  const saved = Array.isArray(meetings) ? meetings.find((m: any) => Number(m?.number) === Number(payload.number)) : undefined;
                                  if (saved) {
                                    setMeetingEdit((prev) => ({
                                      ...prev,
                                      [courseId]: {
                                        number: Number(saved.number) || payload.number,
                                        date: saved?.date ? String(saved.date).slice(0, 10) : edit.date,
                                        start: saved?.startAt ? new Date(saved.startAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }) : edit.start,
                                        end: saved?.endAt ? new Date(saved.endAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }) : edit.end,
                                        ratingEnabled: !!saved?.ratingEnabled,
                                      },
                                    }));
                                  }
                                  toast.success("Pertemuan disimpan");
                                } catch (err: any) {
                                  toast.error(err?.message || "Gagal menyimpan pertemuan");
                                }
                              }}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-muted-foreground">
                          Aktifkan rating untuk pertemuan agar mahasiswa bisa saling merating.
                          {(() => {
                            const courseId = (kelas._id || kelas.id) as string;
                            const e = meetingEdit[courseId] || {};
                            if (e.date && e.start && e.end) {
                              return (
                                <div className="mt-1">Tersimpan: {e.date} {e.start} - {e.end}</div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        {kelas.enrolledStudents?.map((student: any) => (
                          <div
                            key={student?._id || student}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-foreground">
                                {student?.name || "Unknown Student"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {student?.nim_nip || "N/A"}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                const toId =
                                  student?._id ||
                                  (typeof student === "string"
                                    ? student
                                    : undefined);
                                const courseId = kelas?._id || kelas?.id;
                                setPendingTarget({ type: "mahasiswa", toId, courseId });
                                setConfirmOpen(true);
                              }}
                              className="gap-2"
                            >
                              <Star className="w-4 h-4" />
                              Rate
                            </Button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              ) : (
                <AnimatePresence initial={false}>
                  {expandedIds.includes(kelas._id || kelas.id) && (
                    <motion.div
                      key={`content-${kelas._id || kelas.id}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-border pt-6 overflow-hidden"
                    >
                      <div className="mb-6">
                        <h4 className="font-semibold text-foreground mb-3">
                          Dosen Pengampu
                        </h4>
                        {(() => {
                          const q = (
                            classSearch[kelas._id || kelas.id] || ""
                          ).toLowerCase();
                          const showTeacher =
                            !q ||
                            String(kelas.teacher?.name || "")
                              .toLowerCase()
                              .includes(q) ||
                            String(kelas.teacher?.department || "")
                              .toLowerCase()
                              .includes(q);
                          if (!showTeacher) return null;
                          return (
                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                              <div>
                                <p className="font-medium text-foreground">
                                  {kelas.teacher?.name ||
                                    "Dosen Tidak Diketahui"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {kelas.teacher?.department || "N/A"}
                                </p>
                              </div>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const teacherId =
                                    kelas.teacher?._id || kelas.teacher?.id;
                                  const courseId = kelas?._id || kelas?.id;
                                  setPendingTarget({
                                    type: "dosen",
                                    teacherId,
                                    courseId,
                                  });
                                  setConfirmOpen(true);
                                }}
                                className="gap-2"
                              >
                                <Star className="w-4 h-4" />
                                Rate Dosen
                              </Button>
                            </div>
                          );
                        })()}
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          Teman Sekelas
                        </h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          {(() => {
                            const q = (
                              classSearch[kelas._id || kelas.id] || ""
                            ).toLowerCase();
                            return (kelas.enrolledStudents || [])
                              .filter(
                                (student: any) =>
                                  (student?._id || student) !== user?.id
                              )
                              .filter((student: any) => {
                                if (!q) return true;
                                const name = String(
                                  student?.name || ""
                                ).toLowerCase();
                                const nim = String(
                                  student?.nim_nip || ""
                                ).toLowerCase();
                                return name.includes(q) || nim.includes(q);
                              })
                              .map((student: any) => (
                                <div
                                  key={student?._id || student}
                                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                                >
                                  <div>
                                    <p className="font-medium text-foreground">
                                      {student?.name ||
                                        "Mahasiswa Tidak Diketahui"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {student?.nim_nip || "N/A"}
                                    </p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const toId =
                                      student?._id ||
                                      (typeof student === "string"
                                        ? student
                                        : undefined);
                                    const courseId = kelas?._id || kelas?.id;
                                    setPendingTarget({
                                      type: "mahasiswa",
                                      toId,
                                      courseId,
                                    });
                                    setConfirmOpen(true);
                                  }}
                                  className="gap-2"
                                >
                                    <Star className="w-4 h-4" />
                                    Rate
                                  </Button>
                                </div>
                              ));
                          })()}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          ))}
        </div>
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Perjanjian Rating</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Silakan isi rating dengan jujur dan objektif. Tekan Oke untuk
              lanjut atau Keluar jika tidak jadi merating.
            </p>
            <div className="mt-4 flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
                Keluar
              </Button>
              <Button
                onClick={() => {
                  setConfirmOpen(false);
                  const t = pendingTarget;
                  if (!t) return;
                  if (t.type === "dosen") {
                    const url = t.teacherId
                      ? `/rating?type=dosen&teacherId=${t.teacherId}${
                          t.courseId ? `&courseId=${t.courseId}` : ""
                        }`
                      : "/dosen";
                    navigate(url);
                  } else {
                    const courseId = t.courseId;
                    if (user?.role === "mahasiswa" && courseId) {
                      (async () => {
                        try {
                          const res = await fetchJson(`/api/courses/${courseId}/meetings`);
                          const list = res?.data?.meetings || res?.data?.data?.meetings || [];
                          const now = Date.now();
                          const active = Array.isArray(list)
                            ? list
                                .filter((m: any) => !!m?.ratingEnabled)
                                .filter((m: any) => {
                                  const s = m?.startAt ? new Date(m.startAt).getTime() : undefined;
                                  const e = m?.endAt ? new Date(m.endAt).getTime() : undefined;
                                  return !!s && !!e && now >= s && now <= e;
                                })
                                .map((m: any) => Number(m?.number))
                                .sort((a: number, b: number) => a - b)
                            : [];
                          if (active.length === 0) {
                            const enabled = Array.isArray(list) ? list.filter((m: any) => !!m?.ratingEnabled) : [];
                            if (enabled.length === 0) {
                              setAlertMessage("Pertemuan belum diaktifkan");
                              setAlertDesc("Dosen belum mengaktifkan rating untuk pertemuan manapun.");
                              setAlertOpen(true);
                              return;
                            }
                            const upcoming = enabled.filter((m: any) => {
                              const s = m?.startAt ? new Date(m.startAt).getTime() : undefined;
                              return !!s && now < s;
                            });
                            const ended = enabled.filter((m: any) => {
                              const e = m?.endAt ? new Date(m.endAt).getTime() : undefined;
                              return !!e && now > e;
                            });
                            if (upcoming.length > 0) {
                              const next = upcoming
                                .map((m: any) => ({ m, s: new Date(m.startAt).getTime() }))
                                .sort((a: any, b: any) => a.s - b.s)[0];
                              const startStr = next?.m?.startAt
                                ? new Date(next.m.startAt).toLocaleString("id-ID", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  })
                                : "";
                              setAlertMessage("Belum waktunya");
                              setAlertDesc(`Rating bisa dimulai pada ${startStr}.`);
                              setAlertOpen(true);
                              return;
                            }
                            if (ended.length === enabled.length) {
                              const last = ended
                                .map((m: any) => ({ m, e: new Date(m.endAt).getTime() }))
                                .sort((a: any, b: any) => b.e - a.e)[0];
                              const endStr = last?.m?.endAt
                                ? new Date(last.m.endAt).toLocaleString("id-ID", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  })
                                : "";
                              setAlertMessage("Waktu rating sudah berakhir");
                              setAlertDesc(`Jendela rating berakhir pada ${endStr}.`);
                              setAlertOpen(true);
                              return;
                            }
                            const incomplete = enabled.filter((m: any) => !m?.startAt || !m?.endAt);
                            if (incomplete.length > 0) {
                              setAlertMessage("Waktu rating belum ditetapkan");
                              setAlertDesc("Dosen belum menetapkan jam mulai/selesai untuk pertemuan.");
                            } else {
                              setAlertMessage("Pertemuan belum dibuat");
                              setAlertDesc("Dosen belum mengatur jadwal rating.");
                            }
                            setAlertOpen(true);
                            return;
                          }
                          const first = active[0];
                          const url = t.toId
                            ? `/rating?type=teman&to=${t.toId}&courseId=${courseId}&meetingNumber=${first}`
                            : `/rating?type=teman&courseId=${courseId}&meetingNumber=${first}`;
                          navigate(url);
                        } catch {
                          const url = t.toId
                            ? `/rating?type=teman&to=${t.toId}${courseId ? `&courseId=${courseId}` : ""}`
                            : "/rating?type=teman";
                          navigate(url);
                        }
                      })();
                    } else {
                      const url = t.toId
                        ? `/rating?type=teman&to=${t.toId}${courseId ? `&courseId=${courseId}` : ""}`
                        : "/rating?type=teman";
                      navigate(url);
                    }
                  }
                }}
              >
                Oke
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{alertMessage}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{alertDesc}</p>
            <div className="mt-4 flex gap-2 justify-end">
              <Button onClick={() => setAlertOpen(false)}>Tutup</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default KelaskuPage;
