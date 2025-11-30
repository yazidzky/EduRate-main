import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import fetchJson from "@/lib/fetchJson";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SpiderChart } from "@/components/ui/spider-chart";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
import { User, Mail, Phone, Building, Save } from "lucide-react";
import { toast } from "sonner";

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await fetchJson(`/api/auth/me`);
        if (data?.success) {
          setFormData({
            name: data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            department: data.user.department || "",
          });
        }
      } catch {
        toast.error("Failed to load profile");
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await fetchJson(`/api/users/${user?.id}`, {
        method: "PUT",
        body: formData,
      });

      if (data?.success) {
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data?.message || "Update failed");
      }
    } catch {
      toast.error("Failed to update profile");
    }
  };

  

  const [spiderData, setSpiderData] = useState<{
    labels: string[];
    values: number[];
  }>({
    labels: [
      "Communication",
      "Collaboration",
      "Ethics",
      "Responsibility",
      "Problem Solving",
    ],
    values: [0, 0, 0, 0, 0],
  });
  const [avg, setAvg] = useState<{
    communication: number;
    collaboration: number;
    ethics: number;
    responsibility: number;
    problemSolving: number;
  }>({
    communication: 0,
    collaboration: 0,
    ethics: 0,
    responsibility: 0,
    problemSolving: 0,
  });
  const [studentAvg, setStudentAvg] = useState<{
    communication: number;
    collaboration: number;
    ethics: number;
    responsibility: number;
    problemSolving: number;
  }>({
    communication: 0,
    collaboration: 0,
    ethics: 0,
    responsibility: 0,
    problemSolving: 0,
  });
  const [analyticsMode, setAnalyticsMode] = useState<
    "dosen" | "teman" | "gabungan"
  >("dosen");
  const [adminFeedbacks, setAdminFeedbacks] = useState<any[]>([]);
  const [avgTeacherByMahasiswa, setAvgTeacherByMahasiswa] = useState<{
    communication: number;
    collaboration: number;
    ethics: number;
    responsibility: number;
    problemSolving: number;
  }>({
    communication: 0,
    collaboration: 0,
    ethics: 0,
    responsibility: 0,
    problemSolving: 0,
  });
  const [avgTeacherByDosen, setAvgTeacherByDosen] = useState<{
    communication: number;
    collaboration: number;
    ethics: number;
    responsibility: number;
    problemSolving: number;
  }>({
    communication: 0,
    collaboration: 0,
    ethics: 0,
    responsibility: 0,
    problemSolving: 0,
  });

  const teacherCombinedAvg = {
    communication:
      Math.round(
        ((avgTeacherByMahasiswa.communication +
          avgTeacherByDosen.communication) /
          2) *
          100
      ) / 100,
    collaboration:
      Math.round(
        ((avgTeacherByMahasiswa.collaboration +
          avgTeacherByDosen.collaboration) /
          2) *
          100
      ) / 100,
    ethics:
      Math.round(
        ((avgTeacherByMahasiswa.ethics + avgTeacherByDosen.ethics) / 2) * 100
      ) / 100,
    responsibility:
      Math.round(
        ((avgTeacherByMahasiswa.responsibility +
          avgTeacherByDosen.responsibility) /
          2) *
          100
      ) / 100,
    problemSolving:
      Math.round(
        ((avgTeacherByMahasiswa.problemSolving +
          avgTeacherByDosen.problemSolving) /
          2) *
          100
      ) / 100,
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.id) return;
      try {
        if (user?.role === "admin") {
          const res = await fetchJson(
            `/api/admin-reviews/summary?to=${user.id}`
          );
          const d = res?.success ? res.data : null;
          const values = [
            parseFloat(Number(d?.communication ?? 0).toFixed(2)),
            parseFloat(Number(d?.collaboration ?? 0).toFixed(2)),
            parseFloat(Number(d?.ethics ?? 0).toFixed(2)),
            parseFloat(Number(d?.responsibility ?? 0).toFixed(2)),
            parseFloat(Number(d?.problemSolving ?? 0).toFixed(2)),
          ];
          setSpiderData({
            labels: [
              "Communication",
              "Collaboration",
              "Ethics",
              "Responsibility",
              "Problem Solving",
            ],
            values,
          });
        } else if (user?.role === "mahasiswa") {
          const sDosenRes = await fetchJson(
            `/api/student-reviews/summary?to=${user.id}&fromRole=dosen&metrics=teacher`
          );
          const sDosen = sDosenRes?.success
            ? sDosenRes.data
            : {
                communication: 0,
                collaboration: 0,
                ethics: 0,
                responsibility: 0,
                problemSolving: 0,
              };
          setAvg({
            communication: sDosen.communication || 0,
            collaboration: sDosen.collaboration || 0,
            ethics: sDosen.ethics || 0,
            responsibility: sDosen.responsibility || 0,
            problemSolving: sDosen.problemSolving || 0,
          });

          const srTemanRes = await fetchJson(
            `/api/student-reviews/summary?to=${user.id}&fromRole=mahasiswa`
          );
          const srTeman = srTemanRes?.success
            ? srTemanRes.data
            : {
                communication: 0,
                collaboration: 0,
                ethics: 0,
                responsibility: 0,
                problemSolving: 0,
              };
          setStudentAvg({
            communication: srTeman.communication || 0,
            collaboration: srTeman.collaboration || 0,
            ethics: srTeman.ethics || 0,
            responsibility: srTeman.responsibility || 0,
            problemSolving: srTeman.problemSolving || 0,
          });

          if (!sDosen?.count || !srTeman?.count) {
            const listRes = await fetchJson(
              `/api/student-reviews?to=${user.id}&limit=200`
            );
            const list =
              listRes?.success && Array.isArray(listRes.data)
                ? listRes.data
                : [];
            const byRole = (role: string) =>
              list.filter((r: any) => (r?.from?.role || "") === role);
            const dosArr = byRole("dosen");
            const mhsArr = byRole("mahasiswa");
            const calcTeacher = (arr: any[]) => {
              const n = arr.length;
              if (!n)
                return {
                  communication: 0,
                  collaboration: 0,
                  ethics: 0,
                  responsibility: 0,
                  problemSolving: 0,
                };
              const sum = arr.reduce(
                (acc: any, r: any) => {
                  const rt = r?.teacherRatings || {};
                  return {
                    communication: acc.communication + (rt.communication || 0),
                    collaboration: acc.collaboration + (rt.collaboration || 0),
                    ethics: acc.ethics + (rt.ethics || 0),
                    responsibility:
                      acc.responsibility + (rt.responsibility || 0),
                    problemSolving:
                      acc.problemSolving + (rt.problemSolving || 0),
                  };
                },
                {
                  communication: 0,
                  collaboration: 0,
                  ethics: 0,
                  responsibility: 0,
                  problemSolving: 0,
                }
              );
              return {
                communication: Math.round((sum.communication / n) * 100) / 100,
                collaboration: Math.round((sum.collaboration / n) * 100) / 100,
                ethics: Math.round((sum.ethics / n) * 100) / 100,
                responsibility:
                  Math.round((sum.responsibility / n) * 100) / 100,
                problemSolving:
                  Math.round((sum.problemSolving / n) * 100) / 100,
              };
            };
            const calcStudent = (arr: any[]) => {
              const n = arr.length;
              if (!n)
                return {
                  communication: 0,
                  collaboration: 0,
                  ethics: 0,
                  responsibility: 0,
                  problemSolving: 0,
                };
              const sum = arr.reduce(
                (acc: any, r: any) => {
                  const rt = r?.ratings || {};
                  return {
                    communication: acc.communication + (rt.communication || 0),
                    collaboration: acc.collaboration + (rt.collaboration || 0),
                    ethics: acc.ethics + (rt.ethics || 0),
                    responsibility:
                      acc.responsibility + (rt.responsibility || 0),
                    problemSolving:
                      acc.problemSolving + (rt.problemSolving || 0),
                  };
                },
                {
                  communication: 0,
                  collaboration: 0,
                  ethics: 0,
                  responsibility: 0,
                  problemSolving: 0,
                }
              );
              return {
                communication: Math.round((sum.communication / n) * 100) / 100,
                collaboration: Math.round((sum.collaboration / n) * 100) / 100,
                ethics: Math.round((sum.ethics / n) * 100) / 100,
                responsibility:
                  Math.round((sum.responsibility / n) * 100) / 100,
                problemSolving:
                  Math.round((sum.problemSolving / n) * 100) / 100,
              };
            };
            const tVals = sDosen?.count ? sDosen : calcTeacher(dosArr);
            const sVals = srTeman?.count ? srTeman : calcStudent(mhsArr);
            setAvg({
              communication: tVals.communication || 0,
              collaboration: tVals.collaboration || 0,
              ethics: tVals.ethics || 0,
              responsibility: tVals.responsibility || 0,
              problemSolving: tVals.problemSolving || 0,
            });
            setStudentAvg({
              communication: sVals.communication || 0,
              collaboration: sVals.collaboration || 0,
              ethics: sVals.ethics || 0,
              responsibility: sVals.responsibility || 0,
              problemSolving: sVals.problemSolving || 0,
            });
          }
        } else if (user?.role === "dosen") {
          let teacherId: string | undefined;
          try {
            const mapRes = await fetchJson(`/api/teachers/by-user/${user.id}`);
            teacherId = mapRes?.success
              ? mapRes.data?._id || mapRes.data?.id || mapRes.data
              : undefined;
          } catch {
            teacherId = undefined;
          }

          if (teacherId) {
            const [summaryAllRes, summaryMhsRes, summaryDosRes] =
              await Promise.all([
                fetchJson(`/api/reviews/summary?teacher=${teacherId}`),
                fetchJson(
                  `/api/reviews/summary?teacher=${teacherId}&raterRole=mahasiswa`
                ),
                fetchJson(
                  `/api/reviews/summary?teacher=${teacherId}&raterRole=dosen`
                ),
              ]);
            const sAll = summaryAllRes?.success
              ? summaryAllRes.data
              : {
                  communication: 0,
                  collaboration: 0,
                  ethics: 0,
                  responsibility: 0,
                  problemSolving: 0,
                };
            const sMhs = summaryMhsRes?.success
              ? summaryMhsRes.data
              : {
                  communication: 0,
                  collaboration: 0,
                  ethics: 0,
                  responsibility: 0,
                  problemSolving: 0,
                };
            const sDos = summaryDosRes?.success
              ? summaryDosRes.data
              : {
                  communication: 0,
                  collaboration: 0,
                  ethics: 0,
                  responsibility: 0,
                  problemSolving: 0,
                };

            let finalAll = sAll;
            let finalMhs = sMhs;
            let finalDos = sDos;
            if (!sAll?.count || !sMhs?.count || !sDos?.count) {
              const reviewsRes = await fetchJson(
                `/api/reviews?teacher=${teacherId}`
              );
              const list =
                reviewsRes?.success && Array.isArray(reviewsRes.data)
                  ? reviewsRes.data
                  : [];
              const calcSummary = (arr: any[]) => {
                const n = arr.length;
                if (!n)
                  return {
                    communication: 0,
                    collaboration: 0,
                    ethics: 0,
                    responsibility: 0,
                    problemSolving: 0,
                  };
                const sum = arr.reduce(
                  (acc: any, r: any) => {
                    const rt = r?.ratings || {};
                    return {
                      communication:
                        acc.communication + (rt.communication || 0),
                      collaboration:
                        acc.collaboration + (rt.collaboration || 0),
                      ethics: acc.ethics + (rt.ethics || 0),
                      responsibility:
                        acc.responsibility + (rt.responsibility || 0),
                      problemSolving:
                        acc.problemSolving + (rt.problemSolving || 0),
                    };
                  },
                  {
                    communication: 0,
                    collaboration: 0,
                    ethics: 0,
                    responsibility: 0,
                    problemSolving: 0,
                  }
                );
                return {
                  communication:
                    Math.round((sum.communication / n) * 100) / 100,
                  collaboration:
                    Math.round((sum.collaboration / n) * 100) / 100,
                  ethics: Math.round((sum.ethics / n) * 100) / 100,
                  responsibility:
                    Math.round((sum.responsibility / n) * 100) / 100,
                  problemSolving:
                    Math.round((sum.problemSolving / n) * 100) / 100,
                };
              };
              const byRole = (arr: any[], role: string) =>
                arr.filter((r: any) => (r?.user?.role || "") === role);
              finalAll = sAll?.count ? sAll : calcSummary(list);
              finalMhs = sMhs?.count
                ? sMhs
                : calcSummary(byRole(list, "mahasiswa"));
              finalDos = sDos?.count
                ? sDos
                : calcSummary(byRole(list, "dosen"));
            }
            setAvg({
              communication: finalAll.communication || 0,
              collaboration: finalAll.collaboration || 0,
              ethics: finalAll.ethics || 0,
              responsibility: finalAll.responsibility || 0,
              problemSolving: finalAll.problemSolving || 0,
            });
            setAvgTeacherByMahasiswa({
              communication: finalMhs.communication || 0,
              collaboration: finalMhs.collaboration || 0,
              ethics: finalMhs.ethics || 0,
              responsibility: finalMhs.responsibility || 0,
              problemSolving: finalMhs.problemSolving || 0,
            });
            setAvgTeacherByDosen({
              communication: finalDos.communication || 0,
              collaboration: finalDos.collaboration || 0,
              ethics: finalDos.ethics || 0,
              responsibility: finalDos.responsibility || 0,
              problemSolving: finalDos.problemSolving || 0,
            });
          } else {
            const summaryRes = await fetchJson(
              `/api/reviews/summary?teacher=${user.id}`
            );
            const summary = summaryRes?.success
              ? summaryRes.data
              : {
                  communication: 0,
                  collaboration: 0,
                  ethics: 0,
                  responsibility: 0,
                  problemSolving: 0,
                };
            setAvg({
              communication: summary.communication || 0,
              collaboration: summary.collaboration || 0,
              ethics: summary.ethics || 0,
              responsibility: summary.responsibility || 0,
              problemSolving: summary.problemSolving || 0,
            });
            setAvgTeacherByMahasiswa({
              communication: 0,
              collaboration: 0,
              ethics: 0,
              responsibility: 0,
              problemSolving: 0,
            });
            setAvgTeacherByDosen({
              communication: 0,
              collaboration: 0,
              ethics: 0,
              responsibility: 0,
              problemSolving: 0,
            });
          }
        }
      } catch {
        // keep defaults
      }
    };
    fetchAnalytics();
  }, [user?.id, user?.role]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (user?.role !== "admin" || !user?.id) return;
      try {
        const res = await fetchJson(`/api/admin-reviews?to=${user.id}`);
        const list = res?.success ? res.data : [];
        setAdminFeedbacks(Array.isArray(list) ? list : []);
      } catch {
        setAdminFeedbacks([]);
      }
    };
    fetchFeedbacks();
  }, [user?.id, user?.role]);

  useEffect(() => {
    const values = spiderData.values || [];
    const hasData = values.some((v) => v && v > 0);
    if (hasData) return;
    if (user?.role !== "admin") return;
    if (!Array.isArray(adminFeedbacks) || adminFeedbacks.length === 0) return;
    const n = adminFeedbacks.length;
    const sum = adminFeedbacks.reduce(
      (acc: any, rv: any) => {
        const rt = rv?.ratings || {};
        acc.communication += Number(rt?.communication || 0);
        acc.collaboration += Number(rt?.collaboration || 0);
        acc.ethics += Number(rt?.ethics || 0);
        acc.responsibility += Number(rt?.responsibility || 0);
        acc.problemSolving += Number(rt?.problemSolving || 0);
        return acc;
      },
      {
        communication: 0,
        collaboration: 0,
        ethics: 0,
        responsibility: 0,
        problemSolving: 0,
      }
    );
    const avgVals = [
      sum.communication / n,
      sum.collaboration / n,
      sum.ethics / n,
      sum.responsibility / n,
      sum.problemSolving / n,
    ].map((x) => parseFloat(Number(x).toFixed(2)));
    setSpiderData({
      labels: [
        "Communication",
        "Collaboration",
        "Ethics",
        "Responsibility",
        "Problem Solving",
      ],
      values: avgVals,
    });
  }, [adminFeedbacks, user?.role, spiderData.values]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-8">Profile</h1>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card rounded-xl p-6 shadow-soft border border-border"
          >
            <div className="text-center mb-6">
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-full bg-gradient-primary flex items-center justify-center text-white text-4xl font-bold mx-auto overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.name.charAt(0)
                  )}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-1">
                {user?.name}
              </h2>
              <p className="text-muted-foreground mb-2">{user?.nim_nip}</p>
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {user?.role.toUpperCase()}
              </span>
            </div>
          </motion.div>

          {/* Edit Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-2 bg-card rounded-xl p-6 shadow-soft border border-border"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-foreground">
                Personal Information
              </h3>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  Edit Profile
                </Button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="name"
                    className="flex items-center gap-2 mb-2"
                  >
                    <User className="w-4 h-4 text-primary" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 mb-2"
                  >
                    <Mail className="w-4 h-4 text-primary" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="phone"
                    className="flex items-center gap-2 mb-2"
                  >
                    <Phone className="w-4 h-4 text-primary" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="department"
                    className="flex items-center gap-2 mb-2"
                  >
                    <Building className="w-4 h-4 text-primary" />
                    Department
                  </Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-4">
                  <Button type="submit" className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user?.name || "",
                        email: user?.email || "",
                        phone: user?.phone || "",
                        department: user?.department || "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </form>
          </motion.div>
        </div>

        {/* Performa Analitik: Mahasiswa (Bar) */}
        {user?.role === "mahasiswa" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 bg-card rounded-xl p-6 shadow-soft border border-border"
          >
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Performa Analitik
            </h3>
            <div className="mb-4 flex gap-2">
              <Button
                variant={analyticsMode === "dosen" ? "default" : "outline"}
                size="sm"
                onClick={() => setAnalyticsMode("dosen")}
              >
                Dosen
              </Button>
              <Button
                variant={analyticsMode === "teman" ? "default" : "outline"}
                size="sm"
                onClick={() => setAnalyticsMode("teman")}
              >
                Mahasiswa
              </Button>
              <Button
                variant={analyticsMode === "gabungan" ? "default" : "outline"}
                size="sm"
                onClick={() => setAnalyticsMode("gabungan")}
              >
                Gabungan
              </Button>
            </div>
            <Bar
              data={
                analyticsMode === "dosen"
                  ? {
                      labels: [
                        "Communication",
                        "Collaboration",
                        "Ethics",
                        "Responsibility",
                        "Problem Solving",
                      ],
                      datasets: [
                        {
                          label: "Dosen",
                          data: [
                            avg.communication,
                            avg.collaboration,
                            avg.ethics,
                            avg.responsibility,
                            avg.problemSolving,
                          ],
                          backgroundColor: "rgba(59,130,246,0.5)",
                          borderColor: "rgba(59,130,246,1)",
                          borderWidth: 1,
                        },
                      ],
                    }
                  : analyticsMode === "teman"
                  ? {
                      labels: [
                        "Communication",
                        "Collaboration",
                        "Ethics",
                        "Responsibility",
                        "Problem Solving",
                      ],
                      datasets: [
                        {
                          label: "Mahasiswa",
                          data: [
                            studentAvg.communication,
                            studentAvg.collaboration,
                            studentAvg.ethics,
                            studentAvg.responsibility,
                            studentAvg.problemSolving,
                          ],
                          backgroundColor: "rgba(16,185,129,0.5)",
                          borderColor: "rgba(16,185,129,1)",
                          borderWidth: 1,
                        },
                      ],
                    }
                  : {
                      labels: [
                        "Communication",
                        "Collaboration",
                        "Ethics",
                        "Responsibility",
                        "Problem Solving",
                      ],
                      datasets: [
                        {
                          label: "Dosen",
                          data: [
                            avg.communication,
                            avg.collaboration,
                            avg.ethics,
                            avg.responsibility,
                            avg.problemSolving,
                          ],
                          backgroundColor: "rgba(59,130,246,0.5)",
                          borderColor: "rgba(59,130,246,1)",
                          borderWidth: 1,
                        },
                        {
                          label: "Mahasiswa",
                          data: [
                            studentAvg.communication,
                            studentAvg.collaboration,
                            studentAvg.ethics,
                            studentAvg.responsibility,
                            studentAvg.problemSolving,
                          ],
                          backgroundColor: "rgba(16,185,129,0.5)",
                          borderColor: "rgba(16,185,129,1)",
                          borderWidth: 1,
                        },
                      ],
                    }
              }
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: { display: false, text: "" },
                },
                scales: { y: { beginAtZero: true, max: 5 } },
              }}
            />
          </motion.div>
        )}

        {/* Performance Analytics: Admin (Spider) */}
        {user?.role === "admin" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 bg-card rounded-xl p-6 shadow-soft border border-border"
          >
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Performance Analytics
            </h3>
            <div className="max-w-md mx-auto mb-6">
              <SpiderChart data={spiderData} />
            </div>
            <div className="mt-2">
              <h4 className="text-lg font-semibold text-foreground mb-2">
                Analisis Spider Chart
              </h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {(() => {
                  const labels = spiderData.labels;
                  const vals = spiderData.values;
                  const maxIdx = vals.indexOf(Math.max(...vals));
                  const minIdx = vals.indexOf(Math.min(...vals));
                  const lowAreas = labels
                    .map((l, i) => ({ l, v: vals[i] }))
                    .filter((x) => (x.v || 0) < 3)
                    .map((x) => x.l);
                  const items: string[] = [];
                  if (labels.length === 5) {
                    items.push(`Kekuatan utama: ${labels[maxIdx]}`);
                    items.push(`Area terendah: ${labels[minIdx]}`);
                    if (lowAreas.length) {
                      items.push(`Perlu ditingkatkan: ${lowAreas.join(", ")}`);
                    }
                  }
                  return items.map((it, idx) => <li key={idx}>{it}</li>);
                })()}
              </ul>
            </div>
          </motion.div>
        )}

        {user?.role === "dosen" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 bg-card rounded-xl p-6 shadow-soft border border-border"
          >
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Performa Analitik
            </h3>
            <div className="mb-4 flex gap-2">
              <Button
                variant={analyticsMode === "dosen" ? "default" : "outline"}
                size="sm"
                onClick={() => setAnalyticsMode("dosen")}
              >
                Dosen
              </Button>
              <Button
                variant={analyticsMode === "teman" ? "default" : "outline"}
                size="sm"
                onClick={() => setAnalyticsMode("teman")}
              >
                Mahasiswa
              </Button>
              <Button
                variant={analyticsMode === "gabungan" ? "default" : "outline"}
                size="sm"
                onClick={() => setAnalyticsMode("gabungan")}
              >
                Gabungan
              </Button>
            </div>
            <Bar
              data={
                analyticsMode === "dosen"
                  ? {
                      labels: [
                        "Communication",
                        "Collaboration",
                        "Ethics",
                        "Responsibility",
                        "Problem Solving",
                      ],
                      datasets: [
                        {
                          label: "Dosen",
                          data: [
                            avgTeacherByDosen.communication,
                            avgTeacherByDosen.collaboration,
                            avgTeacherByDosen.ethics,
                            avgTeacherByDosen.responsibility,
                            avgTeacherByDosen.problemSolving,
                          ],
                          backgroundColor: "rgba(59,130,246,0.5)",
                          borderColor: "rgba(59,130,246,1)",
                          borderWidth: 1,
                        },
                      ],
                    }
                  : analyticsMode === "teman"
                  ? {
                      labels: [
                        "Communication",
                        "Collaboration",
                        "Ethics",
                        "Responsibility",
                        "Problem Solving",
                      ],
                      datasets: [
                        {
                          label: "Mahasiswa",
                          data: [
                            avgTeacherByMahasiswa.communication,
                            avgTeacherByMahasiswa.collaboration,
                            avgTeacherByMahasiswa.ethics,
                            avgTeacherByMahasiswa.responsibility,
                            avgTeacherByMahasiswa.problemSolving,
                          ],
                          backgroundColor: "rgba(16,185,129,0.5)",
                          borderColor: "rgba(16,185,129,1)",
                          borderWidth: 1,
                        },
                      ],
                    }
                  : {
                      labels: [
                        "Communication",
                        "Collaboration",
                        "Ethics",
                        "Responsibility",
                        "Problem Solving",
                      ],
                      datasets: [
                        {
                          label: "Dosen",
                          data: [
                            teacherCombinedAvg.communication,
                            teacherCombinedAvg.collaboration,
                            teacherCombinedAvg.ethics,
                            teacherCombinedAvg.responsibility,
                            teacherCombinedAvg.problemSolving,
                          ],
                          backgroundColor: "rgba(59,130,246,0.5)",
                          borderColor: "rgba(59,130,246,1)",
                          borderWidth: 1,
                        },
                      ],
                    }
              }
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: { display: false, text: "" },
                },
                scales: { y: { beginAtZero: true, max: 5 } },
              }}
            />
          </motion.div>
        )}

        {/* Admin Feedbacks */}
        {user?.role === "admin" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-6 bg-card rounded-xl p-6 shadow-soft border border-border"
          >
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Feedback dari Admin Lain
            </h3>
            {adminFeedbacks.length === 0 ? (
              <p className="text-muted-foreground">Belum ada feedback</p>
            ) : (
              <div className="space-y-4">
                {adminFeedbacks.map((rv: any) => (
                  <div key={rv._id} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <p className="text-sm text-foreground font-medium">
                        {rv?.from?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(rv?.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {rv?.comment || "(Tanpa komentar)"}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Communication: {rv?.ratings?.communication || 0},
                      Collaboration: {rv?.ratings?.collaboration || 0}, Ethics:{" "}
                      {rv?.ratings?.ethics || 0}, Responsibility:{" "}
                      {rv?.ratings?.responsibility || 0}, Problem Solving:{" "}
                      {rv?.ratings?.problemSolving || 0}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
