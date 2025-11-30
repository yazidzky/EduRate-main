import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { StatCard } from "@/components/ui/stat-card";
import { SpiderChart } from "@/components/ui/spider-chart";
import { BookOpen, Users, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import fetchJson from "@/lib/fetchJson";
import { Input } from "@/components/ui/input";
 

const DashboardMahasiswa = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentAvg, setStudentAvg] = useState<{ communication: number; collaboration: number; ethics: number; responsibility: number; problemSolving: number; overall: number; count: number }>({ communication: 0, collaboration: 0, ethics: 0, responsibility: 0, problemSolving: 0, overall: 0, count: 0 });
  const [teacherAvgDosen, setTeacherAvgDosen] = useState<{ communication: number; collaboration: number; ethics: number; responsibility: number; problemSolving: number; overall: number; count: number }>({ communication: 0, collaboration: 0, ethics: 0, responsibility: 0, problemSolving: 0, overall: 0, count: 0 });
  const [studentAvgTeman, setStudentAvgTeman] = useState<{ communication: number; collaboration: number; ethics: number; responsibility: number; problemSolving: number; overall: number; count: number }>({ communication: 0, collaboration: 0, ethics: 0, responsibility: 0, problemSolving: 0, overall: 0, count: 0 });
  const [myRatings, setMyRatings] = useState<any[]>([]);
  const [spiderMode, setSpiderMode] = useState<"dosen" | "teman" | "gabungan">("dosen");
  const [kelasSearch, setKelasSearch] = useState("");


  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        setError(null);
        const coursesRes = await fetchJson(`/api/courses`);
        const allCourses = coursesRes?.success ? coursesRes.data : [];
        const myCourses = allCourses.filter(
          (course: any) =>
            Array.isArray(course.enrolledStudents) &&
            course.enrolledStudents.some((s: any) => (s?._id || s) === user.id)
        );
        setKelasList(myCourses);

        const srAllRes = await fetchJson(`/api/student-reviews/summary?to=${user.id}`);
        const srDosenTeacherRes = await fetchJson(`/api/student-reviews/summary?to=${user.id}&fromRole=dosen&metrics=teacher`);
        const srTemanRes = await fetchJson(`/api/student-reviews/summary?to=${user.id}&fromRole=mahasiswa`);
        const srAll = srAllRes?.success ? srAllRes.data : { communication: 0, collaboration: 0, ethics: 0, responsibility: 0, problemSolving: 0, count: 0 };
        const srDosen = srDosenTeacherRes?.success ? srDosenTeacherRes.data : { communication: 0, collaboration: 0, ethics: 0, responsibility: 0, problemSolving: 0, count: 0 };
        const srTeman = srTemanRes?.success ? srTemanRes.data : { communication: 0, collaboration: 0, ethics: 0, responsibility: 0, problemSolving: 0, count: 0 };
        const overallAll = srAll.count ? Math.round(((srAll.communication + srAll.collaboration + srAll.ethics + srAll.responsibility + srAll.problemSolving) / 5) * 10) / 10 : 0;
        const overallDosen = srDosen.count ? Math.round(((srDosen.communication + srDosen.collaboration + srDosen.ethics + srDosen.responsibility + srDosen.problemSolving) / 5) * 10) / 10 : 0;
        const overallTeman = srTeman.count ? Math.round(((srTeman.communication + srTeman.collaboration + srTeman.ethics + srTeman.responsibility + srTeman.problemSolving) / 5) * 10) / 10 : 0;
        setStudentAvg({ communication: srAll.communication || 0, collaboration: srAll.collaboration || 0, ethics: srAll.ethics || 0, responsibility: srAll.responsibility || 0, problemSolving: srAll.problemSolving || 0, overall: overallAll, count: srAll.count || 0 });
        setTeacherAvgDosen({ communication: srDosen.communication || 0, collaboration: srDosen.collaboration || 0, ethics: srDosen.ethics || 0, responsibility: srDosen.responsibility || 0, problemSolving: srDosen.problemSolving || 0, overall: overallDosen, count: srDosen.count || 0 });
        setStudentAvgTeman({ communication: srTeman.communication || 0, collaboration: srTeman.collaboration || 0, ethics: srTeman.ethics || 0, responsibility: srTeman.responsibility || 0, problemSolving: srTeman.problemSolving || 0, overall: overallTeman, count: srTeman.count || 0 });

        const myStudentReceivedRes = await fetchJson(`/api/student-reviews?to=${user.id}&limit=10`);
        const myStudentReceived = myStudentReceivedRes?.success ? myStudentReceivedRes.data : [];

        const combined = [...(Array.isArray(myStudentReceived) ? myStudentReceived : [])]
          .sort((a: any, b: any) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime());
        setMyRatings(combined);
      } catch (err: any) {
        setError(err?.message || "Gagal memuat data dashboard");
        toast.error(err?.message || "Gagal memuat data dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const spiderData =
    spiderMode === "dosen"
      ? {
          labels: ["Communication", "Collaboration", "Ethics", "Responsibility", "Problem Solving"],
          values: [teacherAvgDosen.communication, teacherAvgDosen.collaboration, teacherAvgDosen.ethics, teacherAvgDosen.responsibility, teacherAvgDosen.problemSolving],
        }
      : spiderMode === "teman"
      ? {
          labels: ["Communication", "Collaboration", "Ethics", "Responsibility", "Problem Solving"],
          values: [studentAvgTeman.communication, studentAvgTeman.collaboration, studentAvgTeman.ethics, studentAvgTeman.responsibility, studentAvgTeman.problemSolving],
        }
      : {
          labels: [
            "Communication",
            "Collaboration",
            "Ethics",
            "Responsibility",
            "Problem Solving",
            "Communication",
            "Collaboration",
            "Ethics",
            "Responsibility",
            "Problem Solving",
          ],
          values: [
            teacherAvgDosen.communication,
            teacherAvgDosen.collaboration,
            teacherAvgDosen.ethics,
            teacherAvgDosen.responsibility,
            teacherAvgDosen.problemSolving,
            studentAvg.communication,
            studentAvg.collaboration,
            studentAvg.ethics,
            studentAvg.responsibility,
            studentAvg.problemSolving,
          ],
        };

  const filteredKelas = (kelasList || []).filter((k: any) => {
    const q = kelasSearch.trim().toLowerCase();
    if (!q) return true;
    const name = String(k?.name || "").toLowerCase();
    const code = String(k?.code || "").toLowerCase();
    const teacher = String(k?.teacher?.name || "").toLowerCase();
    return name.includes(q) || code.includes(q) || teacher.includes(q);
  });

  const percentList = spiderData.labels.map((label, idx) => {
    const val = spiderData.values[idx] || 0;
    const pct = Math.round((val / 5) * 100);
    return { label, pct };
  });

  function generateRecommendations() {
    const vals = spiderData.values;
    const recs: string[] = [];
    if (spiderMode === "dosen") {
      if ((teacherAvgDosen.communication || 0) < 3) recs.push("Perkuat kejelasan komunikasi dan umpan balik");
      if ((teacherAvgDosen.collaboration || 0) < 3) recs.push("Tingkatkan kontribusi dan kerja tim");
      if ((teacherAvgDosen.ethics || 0) < 3) recs.push("Perkuat kepatuhan aturan dan integritas");
      if ((teacherAvgDosen.responsibility || 0) < 3) recs.push("Perbaiki ketepatan waktu dan komitmen tugas");
      if ((teacherAvgDosen.problemSolving || 0) < 3) recs.push("Perkuat analisis dan solusi atas masalah");
    } else if (spiderMode === "teman") {
      if ((studentAvgTeman.communication || 0) < 3) recs.push("Perjelas komunikasi dalam diskusi dan tugas");
      if ((studentAvgTeman.collaboration || 0) < 3) recs.push("Aktif berkontribusi dalam kerja tim");
      if ((studentAvgTeman.ethics || 0) < 3) recs.push("Jaga integritas dan etika akademik");
      if ((studentAvgTeman.responsibility || 0) < 3) recs.push("Perkuat komitmen dan ketepatan waktu");
      if ((studentAvgTeman.problemSolving || 0) < 3) recs.push("Latih pemecahan masalah dan berpikir kritis");
    } else {
      const lowTeacher = [
        { label: "Communication", val: teacherAvgDosen.communication || 0 },
        { label: "Collaboration", val: teacherAvgDosen.collaboration || 0 },
        { label: "Ethics", val: teacherAvgDosen.ethics || 0 },
        { label: "Responsibility", val: teacherAvgDosen.responsibility || 0 },
        { label: "Problem Solving", val: teacherAvgDosen.problemSolving || 0 },
      ].filter((x) => x.val < 3);
      const lowStudent = [
        { label: "Communication", val: studentAvg.communication || 0 },
        { label: "Collaboration", val: studentAvg.collaboration || 0 },
        { label: "Ethics", val: studentAvg.ethics || 0 },
        { label: "Responsibility", val: studentAvg.responsibility || 0 },
        { label: "Problem Solving", val: studentAvg.problemSolving || 0 },
      ].filter((x) => x.val < 3);
      if (lowTeacher.length) recs.push(`Perbaiki area dosen: ${lowTeacher.map((x) => x.label).join(", ")}`);
      if (lowStudent.length) recs.push(`Perkuat area mahasiswa: ${lowStudent.map((x) => x.label).join(", ")}`);
    }
    const topIdx = vals.indexOf(Math.max(...vals));
    recs.push(`Pertahankan kekuatan pada ${spiderData.labels[topIdx]}`);
    return recs.slice(0, 3);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Selamat Datang, {user?.name}
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Dashboard Mahasiswa
          </p>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-card rounded-xl p-6 shadow-soft border border-border animate-pulse"
              >
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Kelas Aktif"
              value={kelasList.length}
              icon={BookOpen}
              trend=""
              delay={0.1}
            />
            <StatCard
              title="Dosen"
              value={new Set(
                kelasList.map((k) => (k?.teacher?._id || k?.teacher || ""))
              ).size}
              icon={Users}
              delay={0.2}
            />
            <StatCard
              title="Rating Rata-rata"
              value={studentAvg.overall ? studentAvg.overall.toFixed(1) : "0.0"}
              icon={Star}
              trend=""
              delay={0.3}
            />
            <StatCard
              title="Total Rating"
              value={studentAvg.count}
              icon={TrendingUp}
              trend=""
              delay={0.4}
            />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-card rounded-xl p-6 shadow-soft border border-border"
        >
          <h3 className="text-xl font-bold text-foreground mb-4">Performance Overview</h3>
          <div className="mb-4 flex gap-2">
            <Button variant={spiderMode === "dosen" ? "default" : "outline"} size="sm" onClick={() => setSpiderMode("dosen")}>Dosen</Button>
            <Button variant={spiderMode === "teman" ? "default" : "outline"} size="sm" onClick={() => setSpiderMode("teman")}>Teman</Button>
            <Button variant={spiderMode === "gabungan" ? "default" : "outline"} size="sm" onClick={() => setSpiderMode("gabungan")}>Gabungan</Button>
          </div>
          {loading ? (
            <div className="h-64 bg-muted rounded animate-pulse" />
          ) : (
            <>
              <SpiderChart data={spiderData} percentage />
              <div className="mt-4 grid grid-cols-2 gap-3">
                {percentList.map((item) => (
                  <div key={item.label} className="flex items-center justify-between border border-border rounded-md px-3 py-2">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-semibold text-foreground">{item.pct}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-foreground mb-2">Rekomendasi</h4>
                <div className="space-y-2">
                  {generateRecommendations().map((r, i) => (
                    <div key={i} className="text-sm text-muted-foreground">{r}</div>
                  ))}
                </div>
              </div>
            </>
          )}
        </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-card rounded-xl p-6 shadow-soft border border-border"
          >
            <h3 className="text-xl font-bold text-foreground mb-4">
              Feedback Terbaru
            </h3>
            <div className="space-y-4">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="p-4 bg-muted/50 rounded-lg animate-pulse">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))
              ) : myRatings.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada rating</p>
              ) : (
                myRatings.slice(0, 3).map((rating: any, index: number) => (
                  <motion.div
                    key={rating._id || rating.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="p-4 bg-muted/50 rounded-lg"
                  >
                    <p className="text-sm text-foreground mb-1">
                      {rating.comment}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {`Dari: ${rating?.from?.name || ""}`}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>

 

        {/* Kelasku */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-card rounded-xl p-6 shadow-soft border border-border mb-8"
        >
          <h3 className="text-xl font-bold text-foreground mb-4">Kelasku</h3>
          <div className="mb-4">
            <Input
              placeholder="Cari kelas, kode, atau dosen"
              value={kelasSearch}
              onChange={(e) => setKelasSearch(e.target.value)}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {loading ? (
              [1, 2].map((i) => (
                <div key={i} className="p-4 border border-border rounded-lg animate-pulse">
                  <div className="h-5 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-3 bg-muted rounded w-1/3 mt-2"></div>
                </div>
              ))
            ) : filteredKelas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada kelas aktif</p>
            ) : (
              filteredKelas.map((kelas: any, index: number) => (
                <motion.div
                  key={kelas?._id || kelas?.id || index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 border border-border rounded-lg hover:shadow-soft transition-all cursor-pointer"
                  onClick={() => {
                    const courseId = kelas?._id || kelas?.id;
                    if (courseId) navigate(`/kelasku?courseId=${courseId}`);
                    else navigate("/kelasku");
                  }}
                >
                  <h4 className="font-semibold text-foreground">{kelas.name}</h4>
                  <p className="text-sm text-muted-foreground">{kelas.code}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Dosen: {kelas?.teacher?.name || "-"}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        
      </div>
    </div>
  );
};

export default DashboardMahasiswa;
