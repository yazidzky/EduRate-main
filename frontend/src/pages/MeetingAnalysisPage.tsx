import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import fetchJson from "@/lib/fetchJson";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const MeetingAnalysisPage = () => {
  const { user } = useAuth();
  const role = user?.role || "mahasiswa";
  const [targetId, setTargetId] = useState<string>("");
  const [data, setData] = useState<any[]>([]);
  const [data2, setData2] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const categories = [
    { key: "communication", label: "Communication" },
    { key: "collaboration", label: "Collaboration" },
    { key: "ethics", label: "Ethics" },
    { key: "responsibility", label: "Responsibility" },
    { key: "problemSolving", label: "Problem Solving" },
  ];

  useEffect(() => {
    const autoTarget = async () => {
      if (!user) return;
      if (role === "dosen") {
        try {
          const map = await fetchJson(`/api/teachers/by-user/${user.id}`);
          const tid = map?.data?._id || map?.data?.id || map?.data;
          if (tid) setTargetId(String(tid));
        } catch {}
      } else {
        setTargetId(user.id);
      }
    };
    autoTarget();
  }, [user, user?.id, role]);

  const fetchAnalysis = async () => {
    if (!targetId) return;
    setLoading(true);
    try {
      if (role === "dosen") {
        const resA = await fetchJson(
          `/api/reviews/analysis/${targetId}?raterRole=mahasiswa`
        );
        const arrA = Array.isArray(resA?.data)
          ? resA.data
          : resA?.data?.data || [];
        setData(arrA || []);
        const resB = await fetchJson(
          `/api/reviews/analysis/${targetId}?raterRole=dosen`
        );
        const arrB = Array.isArray(resB?.data)
          ? resB.data
          : resB?.data?.data || [];
        setData2(arrB || []);
      } else if (role === "mahasiswa") {
        const resA = await fetchJson(
          `/api/student-reviews/analysis/${targetId}`
        );
        const arrA = Array.isArray(resA?.data)
          ? resA.data
          : resA?.data?.data || [];
        setData(arrA || []);
        const resB = await fetchJson(
          `/api/student-reviews/analysis/${targetId}?metrics=teacher`
        );
        const arrB = Array.isArray(resB?.data)
          ? resB.data
          : resB?.data?.data || [];
        setData2(arrB || []);
      }
    } catch {
      setData([]);
      setData2([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId]);

  const lineData = useMemo(() => {
    return (data || []).map((d: any) => ({
      meeting: d.meetingNumber ?? d._id ?? 0,
      Communication: Math.round((d.communication || 0) * 100) / 100,
      Collaboration: Math.round((d.collaboration || 0) * 100) / 100,
      Ethics: Math.round((d.ethics || 0) * 100) / 100,
      Responsibility: Math.round((d.responsibility || 0) * 100) / 100,
      ProblemSolving: Math.round((d.problemSolving || 0) * 100) / 100,
      count: d.count || 0,
      overall:
        Math.round(
          (((d.communication || 0) +
            (d.collaboration || 0) +
            (d.ethics || 0) +
            (d.responsibility || 0) +
            (d.problemSolving || 0)) /
            5) *
            100
        ) / 100,
    }));
  }, [data]);
  const lineData2 = useMemo(() => {
    return (data2 || []).map((d: any) => ({
      meeting: d.meetingNumber ?? d._id ?? 0,
      Communication: Math.round((d.communication || 0) * 100) / 100,
      Collaboration: Math.round((d.collaboration || 0) * 100) / 100,
      Ethics: Math.round((d.ethics || 0) * 100) / 100,
      Responsibility: Math.round((d.responsibility || 0) * 100) / 100,
      ProblemSolving: Math.round((d.problemSolving || 0) * 100) / 100,
      count: d.count || 0,
      overall:
        Math.round(
          (((d.communication || 0) +
            (d.collaboration || 0) +
            (d.ethics || 0) +
            (d.responsibility || 0) +
            (d.problemSolving || 0)) /
            5) *
            100
        ) / 100,
    }));
  }, [data2]);

  const combinedAgg = useMemo(() => {
    const map = new Map<number, { meeting: number; sums: Record<string, number>; count: number }>();
    const add = (arr: any[]) => {
      for (const d of arr || []) {
        const meeting = d.meetingNumber ?? d._id ?? 0;
        const count = Number(d.count || 0);
        if (!map.has(meeting)) {
          map.set(meeting, {
            meeting,
            sums: {
              communication: 0,
              collaboration: 0,
              ethics: 0,
              responsibility: 0,
              problemSolving: 0,
            },
            count: 0,
          });
        }
        const entry = map.get(meeting)!;
        entry.sums.communication += (Number(d.communication || 0) * count);
        entry.sums.collaboration += (Number(d.collaboration || 0) * count);
        entry.sums.ethics += (Number(d.ethics || 0) * count);
        entry.sums.responsibility += (Number(d.responsibility || 0) * count);
        entry.sums.problemSolving += (Number(d.problemSolving || 0) * count);
        entry.count += count;
      }
    };
    add(data);
    add(data2);
    const out = Array.from(map.values())
      .map((e) => {
        const c = e.count || 0;
        const communication = c ? e.sums.communication / c : 0;
        const collaboration = c ? e.sums.collaboration / c : 0;
        const ethics = c ? e.sums.ethics / c : 0;
        const responsibility = c ? e.sums.responsibility / c : 0;
        const problemSolving = c ? e.sums.problemSolving / c : 0;
        const overall = ((communication + collaboration + ethics + responsibility + problemSolving) / 5);
        return {
          meeting: e.meeting,
          Communication: Math.round(communication * 100) / 100,
          Collaboration: Math.round(collaboration * 100) / 100,
          Ethics: Math.round(ethics * 100) / 100,
          Responsibility: Math.round(responsibility * 100) / 100,
          "Problem Solving": Math.round(problemSolving * 100) / 100,
          overall: Math.round(overall * 100) / 100,
          count: e.count,
        };
      })
      .sort((a, b) => a.meeting - b.meeting);
    return out;
  }, [data, data2]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-3 py-4 max-w-7xl">
        <div className="mb-4">
          <Button onClick={fetchAnalysis} className="w-full sm:w-auto">
            Refresh
          </Button>
        </div>

        {/* First Row: Chart and Summary Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">
                Tren Rating per Pertemuan (
                {role === "dosen" ? "Mahasiswa→Dosen" : "Mahasiswa→Mahasiswa"})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <div className="h-[200px] sm:h-[280px] lg:h-[320px] w-full">
                {loading ? (
                  <div className="text-muted-foreground text-center pt-20">
                    Loading...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={lineData}
                      margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="meeting" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line
                        type="monotone"
                        dataKey="Communication"
                        stroke="#10b981"
                        dot={false}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="Collaboration"
                        stroke="#0ea5e9"
                        dot={false}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="Ethics"
                        stroke="#f59e0b"
                        dot={false}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="Responsibility"
                        stroke="#8b5cf6"
                        dot={false}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="ProblemSolving"
                        stroke="#ef4444"
                        dot={false}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">
                Ringkasan per Pertemuan
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <Table className="text-xs sm:text-sm">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-2 sm:px-4">
                          Pertemuan
                        </TableHead>
                        <TableHead className="px-2 sm:px-4">Overall</TableHead>
                        <TableHead className="px-2 sm:px-4">Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {combinedAgg.map((row) => (
                        <TableRow key={row.meeting}>
                          <TableCell className="px-2 sm:px-4">
                            {row.meeting}
                          </TableCell>
                          <TableCell className="px-2 sm:px-4">
                            {row.overall.toFixed(2)}
                          </TableCell>
                          <TableCell className="px-2 sm:px-4">
                            {row.count}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row: Second Chart */}
        <div className="grid grid-cols-1 gap-4 mb-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">
                {role === "dosen"
                  ? "Tren Rating (Dosen→Dosen)"
                  : "Tren Rating (Dosen→Mahasiswa)"}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <div className="h-[200px] sm:h-[280px] lg:h-[320px] w-full">
                {loading ? (
                  <div className="text-muted-foreground text-center pt-20">
                    Loading...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={lineData2}
                      margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="meeting" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line
                        type="monotone"
                        dataKey="Communication"
                        stroke="#14b8a6"
                        dot={false}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="Collaboration"
                        stroke="#60a5fa"
                        dot={false}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="Ethics"
                        stroke="#f97316"
                        dot={false}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="Responsibility"
                        stroke="#a78bfa"
                        dot={false}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="ProblemSolving"
                        stroke="#f43f5e"
                        dot={false}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Third Row: Heatmap */}
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">
                Heatmap Kategori per Pertemuan
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <Table className="text-xs sm:text-sm min-w-[640px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-2 sm:px-4 whitespace-nowrap">
                          Pertemuan
                        </TableHead>
                        {categories.map((c) => (
                          <TableHead
                            key={c.key}
                            className="px-2 sm:px-4 whitespace-nowrap"
                          >
                            {c.label}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {combinedAgg.map((d: any) => {
                        const meet = d.meeting;
                        const vals = categories.map((c) => {
                          const v = Number(d?.[c.label] || d?.[c.key] || 0);
                          const intensity = Math.max(0, Math.min(1, v / 5));
                          const bg = `rgba(16, 185, 129, ${
                            0.2 + intensity * 0.6
                          })`;
                          return { v: Math.round(v * 100) / 100, bg };
                        });
                        return (
                          <TableRow key={`hm-${meet}`}>
                            <TableCell className="px-2 sm:px-4">
                              {meet}
                            </TableCell>
                            {vals.map((cell, idx) => (
                              <TableCell key={idx} className="px-2 sm:px-4">
                                <div
                                  style={{
                                    background: cell.bg,
                                    borderRadius: 6,
                                    padding: "6px 8px",
                                    textAlign: "center",
                                    fontWeight: 500,
                                    color: "#1f2937",
                                    minWidth: "48px",
                                  }}
                                >
                                  {cell.v.toFixed(2)}
                                </div>
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MeetingAnalysisPage;
