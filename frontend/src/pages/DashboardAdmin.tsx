import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { StatCard } from "@/components/ui/stat-card";
import { Users, BookOpen, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import fetchJson from "@/lib/fetchJson";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [, setLoading] = useState(true);
  const [meetingTrend, setMeetingTrend] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await fetchJson(`/api/stats/dashboard`);
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchAdminTrend = async () => {
      try {
        const me = await fetchJson(`/api/users/me`);
        const uid = me?.data?._id || me?.data?.id || me?.data?.user?.id;
        if (!uid) return;
        const res = await fetchJson(`/api/admin-reviews/analysis/${uid}`);
        const arr = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
        const trend = (arr || []).map((d: any) => ({ label: `Pert ${d.meetingNumber ?? d._id ?? 0}`, val: Math.round((((d.communication || 0) + (d.collaboration || 0) + (d.ethics || 0) + (d.responsibility || 0) + (d.problemSolving || 0)) / 5) * 100) / 100 }));
        setMeetingTrend(trend);
      } catch {}
    };
    fetchAdminTrend();
  }, []);

  const lineChartData = {
    labels: ["M-5", "M-4", "M-3", "M-2", "M-1", "M"],
    datasets: [
      {
        label: "User Growth",
        data: stats?.userGrowth || [0, 0, 0, 0, 0, stats?.totalUsers || 0],
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const pieChartData = {
    labels: ["5 Star", "4 Star", "3 Star", "2 Star", "1 Star"],
    datasets: [
      {
        data: stats?.ratingDistribution || [0, 0, 0, 0, 0],
        backgroundColor: [
          "rgba(16, 185, 129, 0.8)",
          "rgba(52, 211, 153, 0.8)",
          "rgba(110, 231, 183, 0.8)",
          "rgba(167, 243, 208, 0.8)",
          "rgba(209, 250, 229, 0.8)",
        ],
      },
    ],
  };

  const barChartData = {
    labels: ["D1", "D2", "D3", "D4", "D5", "D6", "D7"],
    datasets: [
      {
        label: "Rating Activity",
        data: stats?.ratingActivityWeek || [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: "rgba(16, 185, 129, 0.8)",
      },
    ],
  };

  const avgOverall = (() => {
    const a = stats?.averageRatings || {};
    const vals = [
      a?.avgCommunication,
      a?.avgCollaboration,
      a?.avgEthics,
      a?.avgResponsibility,
      a?.avgProblemSolving,
    ]
      .map((v: any) => Number(v) || 0);
    const sum = vals.reduce((p: number, c: number) => p + c, 0);
    return vals.some((v) => v > 0) ? sum / vals.length : 0;
  })();

  const meetingTrendData = {
    labels: meetingTrend.map((d) => d.label),
    datasets: [
      {
        label: "Avg per Pertemuan",
        data: meetingTrend.map((d) => d.val),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
      },
    ],
  };

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
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Kelola sistem rating akademik
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={Users}
            trend={`+${stats?.newUsersToday || 0} user baru`}
            delay={0.1}
          />
          <StatCard
            title="Total Teachers"
            value={stats?.totalTeachers || 0}
            icon={BookOpen}
            trend="Aktif"
            delay={0.2}
          />
          <StatCard
            title="Total Rating"
            value={stats?.totalReviews || 0}
            icon={Star}
            trend={`+${stats?.ratingsToday || 0} rating hari ini`}
            delay={0.3}
          />
          <StatCard
            title="Avg Rating"
            value={
              (Number.isFinite(Number(stats?.averageRatings?.avgTeachingRating))
                ? Number(stats?.averageRatings?.avgTeachingRating).toFixed(1)
                : avgOverall.toFixed(1)) || "0.0"
            }
            icon={TrendingUp}
            trend={`${Number(stats?.avgDeltaMonth || 0) > 0 ? "+" : ""}${Number(stats?.avgDeltaMonth || 0).toFixed(1)} dari bulan lalu`}
            delay={0.4}
          />
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-card rounded-xl p-6 shadow-soft border border-border"
          >
            <h3 className="text-lg font-bold text-foreground mb-4">
              Pertumbuhan User
            </h3>
            <Line
              data={lineChartData}
              options={{ responsive: true, maintainAspectRatio: true }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-card rounded-xl p-6 shadow-soft border border-border"
          >
            <h3 className="text-lg font-bold text-foreground mb-4">
              Progress Rating per Pertemuan
            </h3>
            <Line
              data={meetingTrendData}
              options={{ responsive: true, maintainAspectRatio: true }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-card rounded-xl p-6 shadow-soft border border-border"
          >
            <h3 className="text-lg font-bold text-foreground mb-4">
              Distribusi Rating
            </h3>
            <Pie
              data={pieChartData}
              options={{ responsive: true, maintainAspectRatio: true }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-card rounded-xl p-6 shadow-soft border border-border"
          >
            <h3 className="text-lg font-bold text-foreground mb-4">
              Aktivitas Rating
            </h3>
            <Bar
              data={barChartData}
              options={{ responsive: true, maintainAspectRatio: true }}
            />
          </motion.div>
        </div>

        {/* Management Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="bg-card rounded-xl p-6 shadow-soft border border-border"
          >
            <h3 className="text-xl font-bold text-foreground mb-4">
              User Management
            </h3>
            <p className="text-muted-foreground mb-4">
              Kelola data dosen dan mahasiswa
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => navigate("/user-management")}
                className="flex-1"
              >
                Kelola Users
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="bg-card rounded-xl p-6 shadow-soft border border-border"
          >
            <h3 className="text-xl font-bold text-foreground mb-4">
              Kelas Management
            </h3>
            <p className="text-muted-foreground mb-4">
              Kelola kelas dan enrollment mahasiswa
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => navigate("/kelas-management")}
                className="flex-1"
              >
                Kelola Kelas
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
