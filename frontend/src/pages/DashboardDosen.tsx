import React from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.error("DashboardDosen render error:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12 text-red-500">Terjadi kesalahan saat memuat Dashboard Dosen</div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const DashboardDosenInner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avgAll, setAvgAll] = useState<{
    communication: number;
    collaboration: number;
    ethics: number;
    responsibility: number;
    problemSolving: number;
    overall: number;
    count: number;
  }>({
    communication: 0,
    collaboration: 0,
    ethics: 0,
    responsibility: 0,
    problemSolving: 0,
    overall: 0,
    count: 0,
  });
  const [avgMahasiswa, setAvgMahasiswa] = useState<{
    communication: number;
    collaboration: number;
    ethics: number;
    responsibility: number;
    problemSolving: number;
    overall: number;
    count: number;
  }>({
    communication: 0,
    collaboration: 0,
    ethics: 0,
    responsibility: 0,
    problemSolving: 0,
    overall: 0,
    count: 0,
  });
  const [avgDosen, setAvgDosen] = useState<{
    communication: number;
    collaboration: number;
    ethics: number;
    responsibility: number;
    problemSolving: number;
    overall: number;
    count: number;
  }>({
    communication: 0,
    collaboration: 0,
    ethics: 0,
    responsibility: 0,
    problemSolving: 0,
    overall: 0,
    count: 0,
  });
  const [spiderMode, setSpiderMode] = useState<
    "dosen" | "mahasiswa" | "gabungan"
  >("dosen");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [meetingTrend, setMeetingTrend] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let teacherId: string | undefined;
        try {
          const teacherMap = await fetchJson(
            `/api/teachers/by-user/${user?.id}`
          );
          teacherId = teacherMap?.success
            ? teacherMap.data?._id || teacherMap.data?.id || teacherMap.data
            : undefined;
        } catch {
          teacherId = undefined;
        }
        const [
          coursesData,
          reviewsData,
          summaryAllRes,
          summaryMhsRes,
          summaryDosenRes,
        ] = await Promise.all([
          teacherId
            ? fetchJson(`/api/courses?teacher=${teacherId}`)
            : fetchJson(`/api/courses`),
          teacherId
            ? fetchJson(`/api/reviews?teacher=${teacherId}`)
            : fetchJson(`/api/reviews`),
          teacherId
            ? fetchJson(`/api/reviews/summary?teacher=${teacherId}`)
            : Promise.resolve(null),
          teacherId
            ? fetchJson(
                `/api/reviews/summary?teacher=${teacherId}&raterRole=mahasiswa`
              )
            : Promise.resolve(null),
          teacherId
            ? fetchJson(
                `/api/reviews/summary?teacher=${teacherId}&raterRole=dosen`
              )
            : Promise.resolve(null),
        ]);

        let allCourses = coursesData?.success
          ? Array.isArray(coursesData.data)
            ? coursesData.data
            : []
          : [];
        if (Array.isArray(allCourses) && allCourses.length === 0) {
          const fallbackCourses = await fetchJson(`/api/courses`);
          const fallbackList = Array.isArray(fallbackCourses?.data)
            ? fallbackCourses.data
            : [];
          allCourses = fallbackList.filter((c: any) => {
            const tu = c?.teacher?.user;
            const tuId = tu?._id || tu;
            return (
              tuId === user?.id ||
              String(c?.teacher?.name || "") === String(user?.name || "")
            );
          });
        }
        setKelasList(allCourses);

        let allReviews = reviewsData?.success
          ? Array.isArray(reviewsData.data)
            ? reviewsData.data
            : []
          : [];
        if (Array.isArray(allReviews) && allReviews.length === 0) {
          const fallbackReviews = await fetchJson(`/api/reviews`);
          const fallbackList = Array.isArray(fallbackReviews?.data)
            ? fallbackReviews.data
            : [];
          allReviews = fallbackList.filter((r: any) => {
            const t = r?.teacher;
            const tu = t?.user;
            const tuId = tu?._id || tu;
            return (
              tuId === user?.id ||
              String(t?.name || "") === String(user?.name || "")
            );
          });
        }
        setRatings(allReviews);

        if (teacherId) {
          const courseParam = selectedCourse && selectedCourse !== "ALL" ? selectedCourse : "";
          const analysisUrl = courseParam
            ? `/api/reviews/analysis/${teacherId}?course=${courseParam}`
            : `/api/reviews/analysis/${teacherId}`;
          try {
            const analysisRes = await fetchJson(analysisUrl);
            const arr = Array.isArray(analysisRes?.data) ? analysisRes.data : analysisRes?.data?.data || [];
            const trend = (arr || []).map((d: any) => ({
              meeting: d.meetingNumber ?? d._id ?? 0,
              overall: Math.round((((d.communication || 0) + (d.collaboration || 0) + (d.ethics || 0) + (d.responsibility || 0) + (d.problemSolving || 0)) / 5) * 100) / 100,
              count: d.count || 0,
            }));
            setMeetingTrend(trend);
          } catch {
            setMeetingTrend([]);
          }
        }

        const sAll = summaryAllRes?.success
          ? summaryAllRes.data
          : {
              communication: 0,
              collaboration: 0,
              ethics: 0,
              responsibility: 0,
              problemSolving: 0,
              count: 0,
            };
        const sMhs = summaryMhsRes?.success
          ? summaryMhsRes.data
          : {
              communication: 0,
              collaboration: 0,
              ethics: 0,
              responsibility: 0,
              problemSolving: 0,
              count: 0,
            };
        const sDos = summaryDosenRes?.success
          ? summaryDosenRes.data
          : {
              communication: 0,
              collaboration: 0,
              ethics: 0,
              responsibility: 0,
              problemSolving: 0,
              count: 0,
            };

        function calcSummary(list: any[]) {
          const n = list.length;
          if (!n)
            return {
              communication: 0,
              collaboration: 0,
              ethics: 0,
              responsibility: 0,
              problemSolving: 0,
              count: 0,
            };
          const sum = list.reduce(
            (acc, r) => {
              const rt = r?.ratings || {};
              return {
                communication: acc.communication + (rt.communication || 0),
                collaboration: acc.collaboration + (rt.collaboration || 0),
                ethics: acc.ethics + (rt.ethics || 0),
                responsibility: acc.responsibility + (rt.responsibility || 0),
                problemSolving: acc.problemSolving + (rt.problemSolving || 0),
              };
            },
            { communication: 0, collaboration: 0, ethics: 0, responsibility: 0, problemSolving: 0 }
          );
          return {
            communication: Math.round((sum.communication / n) * 100) / 100,
            collaboration: Math.round((sum.collaboration / n) * 100) / 100,
            ethics: Math.round((sum.ethics / n) * 100) / 100,
            responsibility: Math.round((sum.responsibility / n) * 100) / 100,
            problemSolving: Math.round((sum.problemSolving / n) * 100) / 100,
            count: n,
          };
        }

        function byRole(list: any[], role: string) {
          return calcSummary(
            list.filter((r) => (r?.user?.role || "") === role)
          );
        }

        const sAllFinal = sAll?.count ? sAll : calcSummary(allReviews);
        const sMhsFinal = sMhs?.count ? sMhs : byRole(allReviews, "mahasiswa");
        const sDosFinal = sDos?.count ? sDos : byRole(allReviews, "dosen");
        const overallAll = sAllFinal.count
          ? Math.round(
              ((sAllFinal.communication +
                sAllFinal.collaboration +
                sAllFinal.ethics +
                sAllFinal.responsibility +
                sAllFinal.problemSolving) /
                5) *
                10
            ) / 10
          : 0;
        const overallMhs = sMhsFinal.count
          ? Math.round(
              ((sMhsFinal.communication +
                sMhsFinal.collaboration +
                sMhsFinal.ethics +
                sMhsFinal.responsibility +
                sMhsFinal.problemSolving) /
                5) *
                10
            ) / 10
          : 0;
        const overallDos = sDosFinal.count
          ? Math.round(
              ((sDosFinal.communication +
                sDosFinal.collaboration +
                sDosFinal.ethics +
                sDosFinal.responsibility +
                sDosFinal.problemSolving) /
                5) *
                10
            ) / 10
          : 0;
        setAvgAll({
          communication: sAllFinal.communication || 0,
          collaboration: sAllFinal.collaboration || 0,
          ethics: sAllFinal.ethics || 0,
          responsibility: sAllFinal.responsibility || 0,
          problemSolving: sAllFinal.problemSolving || 0,
          overall: overallAll,
          count: sAllFinal.count || 0,
        });
        setAvgMahasiswa({
          communication: sMhsFinal.communication || 0,
          collaboration: sMhsFinal.collaboration || 0,
          ethics: sMhsFinal.ethics || 0,
          responsibility: sMhsFinal.responsibility || 0,
          problemSolving: sMhsFinal.problemSolving || 0,
          overall: overallMhs,
          count: sMhsFinal.count || 0,
        });
        setAvgDosen({
          communication: sDosFinal.communication || 0,
          collaboration: sDosFinal.collaboration || 0,
          ethics: sDosFinal.ethics || 0,
          responsibility: sDosFinal.responsibility || 0,
          problemSolving: sDosFinal.problemSolving || 0,
          overall: overallDos,
          count: sDosFinal.count || 0,
        });
      } catch {
        setError("Failed to load dashboard data");
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id, user?.name, selectedCourse]);

  const combinedAvg = {
    communication:
      Math.round(((avgMahasiswa.communication + avgDosen.communication) / 2) * 100) / 100,
    collaboration:
      Math.round(((avgMahasiswa.collaboration + avgDosen.collaboration) / 2) * 100) / 100,
    ethics:
      Math.round(((avgMahasiswa.ethics + avgDosen.ethics) / 2) * 100) / 100,
    responsibility:
      Math.round(((avgMahasiswa.responsibility + avgDosen.responsibility) / 2) * 100) / 100,
    problemSolving:
      Math.round(((avgMahasiswa.problemSolving + avgDosen.problemSolving) / 2) * 100) / 100,
    overall:
      Math.round(
        (((avgMahasiswa.communication +
          avgMahasiswa.collaboration +
          avgMahasiswa.ethics +
          avgMahasiswa.responsibility +
          avgMahasiswa.problemSolving) /
          5 +
          (avgDosen.communication +
            avgDosen.collaboration +
            avgDosen.ethics +
            avgDosen.responsibility +
            avgDosen.problemSolving) /
            5) /
          2) *
          10
      ) / 10,
    count: (avgMahasiswa.count || 0) + (avgDosen.count || 0),
  };

  const emptyAvg = {
    communication: 0,
    collaboration: 0,
    ethics: 0,
    responsibility: 0,
    problemSolving: 0,
    overall: 0,
    count: 0,
  };

  const activeAvg =
    spiderMode === "dosen"
      ? avgDosen.count
        ? avgDosen
        : emptyAvg
      : spiderMode === "mahasiswa"
      ? avgMahasiswa.count
        ? avgMahasiswa
        : emptyAvg
      : avgMahasiswa.count || avgDosen.count
      ? combinedAvg
      : avgAll;
  const safeNumber = (v: any) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const spiderData = {
    labels: ["Communication", "Collaboration", "Ethics", "Responsibility", "Problem Solving"],
    values: [
      safeNumber(activeAvg.communication),
      safeNumber(activeAvg.collaboration),
      safeNumber(activeAvg.ethics),
      safeNumber(activeAvg.responsibility),
      safeNumber(activeAvg.problemSolving),
    ],
  };

  const percentList = spiderData.labels.map((label, idx) => {
    const val = spiderData.values[idx] || 0;
    const pct = Math.round((val / 5) * 100);
    return { label, pct };
  });

  function generateRecommendations() {
    const vals = spiderData.values || [];
    const recs: string[] = [];
    const base = activeAvg;
    if ((base.count || 0) === 0) return recs;
    if ((base.communication || 0) < 3)
      recs.push("Perkuat kejelasan komunikasi dan umpan balik");
    if ((base.collaboration || 0) < 3)
      recs.push("Tingkatkan kontribusi dan kerja tim");
    if ((base.ethics || 0) < 3)
      recs.push("Perkuat kepatuhan aturan dan integritas");
    if ((base.responsibility || 0) < 3)
      recs.push("Perbaiki ketepatan waktu dan komitmen tugas");
    if ((base.problemSolving || 0) < 3)
      recs.push("Perkuat analisis dan solusi atas masalah");
    if (Array.isArray(vals) && vals.length > 0) {
      const topIdx = vals.indexOf(Math.max(...vals));
      recs.push(`Pertahankan kekuatan pada ${spiderData.labels[topIdx]}`);
    }
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
          <p className="text-muted-foreground text-lg mb-8">Dashboard Dosen</p>
        </motion.div>

        {/* Stats */}
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
              trend="+2 semester ini"
              delay={0.1}
            />
            <StatCard
              title="Total Mahasiswa"
              value={kelasList.reduce(
                (acc: number, k: any) =>
                  acc + (k.enrolledStudents?.length || 0),
                0
              )}
              icon={Users}
              trend="+12 dari sebelumnya"
              delay={0.2}
            />
            <StatCard
              title="Rating Rata-rata"
              value={avgAll.overall ? avgAll.overall.toFixed(1) : "0.0"}
              icon={Star}
              trend=""
              delay={0.3}
            />
            <StatCard
              title="Total Rating"
              value={avgAll.count}
              icon={TrendingUp}
              trend=""
              delay={0.4}
            />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Spider Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-card rounded-xl p-6 shadow-soft border border-border"
          >
            <h3 className="text-xl font-bold text-foreground mb-4">
              Performance Overview
            </h3>
            <div className="mb-4 flex gap-2">
              <Button
                variant={spiderMode === "dosen" ? "default" : "outline"}
                size="sm"
                onClick={() => setSpiderMode("dosen")}
              >
                Dosen
              </Button>
              <Button
                variant={spiderMode === "mahasiswa" ? "default" : "outline"}
                size="sm"
                onClick={() => setSpiderMode("mahasiswa")}
              >
                Mahasiswa
              </Button>
              <Button
                variant={spiderMode === "gabungan" ? "default" : "outline"}
                size="sm"
                onClick={() => setSpiderMode("gabungan")}
              >
                Gabungan
              </Button>
            </div>
            {Array.isArray(spiderData.values) &&
            spiderData.values.length === spiderData.labels.length &&
            spiderData.values.every((n) => Number.isFinite(n)) ? (
              <SpiderChart data={spiderData} percentage />
            ) : (
              <div className="text-sm text-muted-foreground">Data tidak tersedia</div>
            )}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {percentList.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between border border-border rounded-md px-3 py-2"
                >
                  <span className="text-sm text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {item.pct}%
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-foreground mb-2">
                Rekomendasi
              </h4>
              <div className="space-y-2">
                {generateRecommendations().map((r, i) => (
                  <div key={i} className="text-sm text-muted-foreground">
                    {r}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Per-Meeting Trend */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="bg-card rounded-xl p-6 shadow-soft border border-border"
          >
            <h3 className="text-xl font-bold text-foreground mb-4">Progress Rating per Pertemuan</h3>
            <div className="mb-3">
              <Select onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Kelas</SelectItem>
                  {kelasList
                    .filter((k: any) => k?._id)
                    .map((k: any) => (
                      <SelectItem key={String(k._id)} value={String(k._id)}>
                        {k.name || "Tanpa Nama"}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div style={{ height: 280 }}>
              {Array.isArray(meetingTrend) && meetingTrend.length > 0 ? (
                <ResponsiveContainer>
                  <LineChart data={meetingTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="meeting" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="overall" stroke="#10b981" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Belum ada data pertemuan</div>
              )}
            </div>
          </motion.div>

          {/* Recent Comments */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-card rounded-xl p-6 shadow-soft border border-border"
          >
            <h3 className="text-xl font-bold text-foreground mb-4">
              Komentar Terbaru
            </h3>
            <div className="space-y-4">
              {ratings.slice(0, 3).map((rating: any, index: number) => (
                <motion.div
                  key={rating?._id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="p-4 bg-muted/50 rounded-lg"
                >
                  <p className="text-sm text-foreground mb-1">
                    {rating.comment}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {rating?.user?.name || "Pengguna"}
                    {rating?.course?.name ? ` - ${rating.course.name}` : ""}
                  </p>
                </motion.div>
              ))}
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
          <div className="grid md:grid-cols-2 gap-4">
            {kelasList.map((kelas: any, index: number) => (
              <motion.div
                key={kelas?._id || index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="p-4 border border-border rounded-lg hover:shadow-soft transition-all cursor-pointer"
                onClick={() => navigate("/kelasku")}
              >
                <h4 className="font-semibold text-foreground">{kelas.name}</h4>
                <p className="text-sm text-muted-foreground">{kelas.code}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {kelas?.enrolledStudents?.length || 0} Mahasiswa
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const DashboardDosen = () => (
  <ErrorBoundary>
    <DashboardDosenInner />
  </ErrorBoundary>
);

export default DashboardDosen;
