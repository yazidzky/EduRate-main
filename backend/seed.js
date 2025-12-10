import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Institution from "./models/Institution.js";
import Teacher from "./models/Teacher.js";
import Course from "./models/Course.js";
import Enrollment from "./models/Enrollment.js";
import Review from "./models/Review.js";
import StudentReview from "./models/StudentReview.js";
import AdminReview from "./models/AdminReview.js";
import connectDB from "./config/database.js";

dotenv.config();

const resetAndSeed = async () => {
  try {
    await connectDB();

    await Promise.all([
      Review.deleteMany({}),
      StudentReview.deleteMany({}),
      AdminReview.deleteMany({}),
      Course.deleteMany({}),
      Enrollment.deleteMany({}),
      Teacher.deleteMany({}),
      User.deleteMany({}),
      Institution.deleteMany({}),
    ]);

    const institutions = [
      new Institution({ name: "Universitas Contoh", type: "university", location: "Bandung" }),
      new Institution({ name: "Institut Teknologi Maju", type: "university", location: "Jakarta" }),
      new Institution({ name: "Politeknik Nusantara", type: "institute", location: "Surabaya" }),
    ];
    for (const i of institutions) await i.save();

    const admins = [
      new User({ name: "Administrator", email: "admin@edurate.com", password: "password", role: "admin", nim_nip: "ADMIN001", institution: institutions[0]._id }),
      new User({ name: "Admin Kedua", email: "admin2@edurate.com", password: "password", role: "admin", nim_nip: "ADMIN002", institution: institutions[1]._id }),
      new User({ name: "Admin Ketiga", email: "admin3@edurate.com", password: "password", role: "admin", nim_nip: "ADMIN003", institution: institutions[2]._id }),
    ];
    for (const a of admins) await a.save();

    const makePhone = (idx) => `0812${String(100000 + idx).slice(-6)}`;
    const LECTURER_COUNT = 24; // satu dosen per kelas
    const lecturerDept = [
      "Informatika",
      "Sistem Informasi",
      "Teknik Elektro",
      "Teknik Mesin",
      "Teknik Kimia",
      "Matematika",
      "Fisika",
      "Statistika",
      "Teknik Sipil",
      "Biologi",
      "Kimia",
      "Ekonomi",
      "Manajemen",
      "Akuntansi",
      "Bahasa Inggris",
      "Desain Produk",
      "Arsitektur",
      "Ilmu Komputer",
      "Data Science",
      "Keamanan Informasi",
      "Jaringan",
      "Pemrograman",
      "AI",
      "Sistem Cerdas",
    ];
    const lecturersUsers = [];
    for (let i = 0; i < LECTURER_COUNT; i++) {
      const inst = institutions[i % institutions.length]._id;
      const name = `Dosen ${i + 1}`;
      const email = `dosen${i + 1}@edurate.com`;
      const nip = `NIP${String(i + 1).padStart(3, "0")}`;
      lecturersUsers.push(new User({ name, email, password: "password", role: "dosen", nim_nip: nip, institution: inst, department: lecturerDept[i % lecturerDept.length], phone: makePhone(i + 1) }));
    }
    for (const u of lecturersUsers) await u.save();

    const GROUPS = 3;
    const STUDENTS_PER_CLASS = 24;
    const CLASSES_PER_STUDENT = 8;
    const students = [];
    for (let g = 0; g < GROUPS; g++) {
      for (let i = 0; i < STUDENTS_PER_CLASS; i++) {
        const idx = g * STUDENTS_PER_CLASS + i + 1;
        const name = `Mahasiswa ${idx}`;
        const email = `mahasiswa${idx}@edurate.com`;
        const nim = `NIM${String(idx).padStart(3, "0")}`;
        const inst = institutions[g % institutions.length]._id;
        students.push(new User({ name, email, password: "password", role: "mahasiswa", nim_nip: nim, institution: inst }));
      }
    }
    for (const s of students) await s.save();

    const teachers = [];
    for (let i = 0; i < lecturersUsers.length; i++) {
      const u = lecturersUsers[i];
      const inst = u.institution;
      teachers.push(new Teacher({ name: u.name, user: u._id, institution: inst, department: u.department }));
    }
    for (const t of teachers) await t.save();

    const courses = [];
    let teacherIdx = 0;
    for (let g = 0; g < GROUPS; g++) {
      const groupStudents = students.slice(g * STUDENTS_PER_CLASS, (g + 1) * STUDENTS_PER_CLASS);
      for (let k = 0; k < CLASSES_PER_STUDENT; k++) {
        const code = `G${g + 1}C${k + 1}`;
        const name = `Kelas G${g + 1} - ${k + 1}`;
        const inst = institutions[g % institutions.length]._id;
        const teacher = teachers[teacherIdx % teachers.length]._id;
        teacherIdx++;
        courses.push(new Course({ name, code, semester: 3, institution: inst, teacher, schedule: "Senin, 08:00 - 10:00", room: `R-${g + 1}${k + 1}`, totalMeetings: 16, enrolledStudents: groupStudents.map((s) => s._id) }));
      }
    }
    for (const c of courses) await c.save();

    const enrollDocs = [];
    for (const c of courses) {
      for (const sid of c.enrolledStudents) {
        enrollDocs.push({ user: sid, course: c._id });
      }
    }
    await Enrollment.create(enrollDocs);

    const makeRatings = (base) => ({
      communication: Math.min(5, Math.max(1, base + Math.round(Math.random() * 1) - 0)),
      collaboration: Math.min(5, Math.max(1, base + Math.round(Math.random() * 1) - 0)),
      ethics: Math.min(5, Math.max(1, base + Math.round(Math.random() * 1) - 0)),
      responsibility: Math.min(5, Math.max(1, base + Math.round(Math.random() * 1) - 0)),
      problemSolving: Math.min(5, Math.max(1, base + Math.round(Math.random() * 1) - 0)),
    });

    const teacherComments = [
      "Materi jelas dan terstruktur. Saran: tambah contoh praktis.",
      "Komunikasi efektif dengan mahasiswa. Pertahankan konsistensi.",
      "Kolaborasi baik dalam proyek kelas. Tingkatkan koordinasi.",
      "Etika profesional sangat baik. Teruskan pendekatan positif.",
      "Tanggung jawab tinggi terhadap jadwal. Bisa tambah reminder.",
      "Pemecahan masalah cepat dan tepat. Bagikan best practice."
    ];
    const reviewDocs = [];
    for (let meeting = 1; meeting <= 16; meeting++) {
      for (const c of courses) {
        const base = 3 + (meeting % 2);
        for (const sid of c.enrolledStudents) {
          reviewDocs.push({ user: sid, teacher: c.teacher, course: c._id, meetingNumber: meeting, ratings: makeRatings(base), comment: teacherComments[Math.floor(Math.random() * teacherComments.length)] });
        }
      }
    }
    await Review.create(reviewDocs);

    for (const t of teachers) {
      const reviews = await Review.find({ teacher: t._id, deleted: false });
      const avg = reviews.length
        ? Math.round((reviews.reduce((sum, r) => {
            const rating = (r.ratings.communication + r.ratings.collaboration + r.ratings.ethics + r.ratings.responsibility + r.ratings.problemSolving) / 5;
            return sum + rating;
          }, 0) / reviews.length) * 10) / 10
        : 0;
      const count = await Review.countDocuments({ teacher: t._id, deleted: false });
      await Teacher.findByIdAndUpdate(t._id, { avgRating: avg, totalReviews: count });
    }

    const peerComments = [
      "Kerja tim solid, tetap aktif berkontribusi.",
      "Komunikasi jelas saat diskusi.",
      "Saling menghargai dalam kelompok.",
      "Tanggung jawab baik, tepat waktu.",
      "Solusi yang ditawarkan realistis dan efektif."
    ];
    const studentReviewDocs = [];
    const uniqPairs = new Set();
    courses.forEach((c, cIdx) => {
      for (let meeting = 1; meeting <= 16; meeting++) {
        const uniqueMeeting = ((meeting + cIdx - 1) % 16) + 1;
        const enrolled = c.enrolledStudents.map((s) => String(s));
        for (let i = 0; i < enrolled.length; i++) {
          const from = enrolled[i];
          const to = enrolled[(i + 1) % enrolled.length];
          if (from !== to) {
            const key = `${from}:${to}:${uniqueMeeting}`;
            if (!uniqPairs.has(key)) {
              uniqPairs.add(key);
              studentReviewDocs.push({ from, to, course: c._id, meetingNumber: uniqueMeeting, ratings: makeRatings(3), comment: peerComments[Math.floor(Math.random() * peerComments.length)] });
            }
          }
        }
        const teacherUserId = lecturersUsers.find((u) => String(u._id) === String(teachers.find((t) => String(t._id) === String(c.teacher))?.user))?._id;
        if (teacherUserId) {
          for (const sid of c.enrolledStudents) {
            const key = `${String(teacherUserId)}:${String(sid)}:${uniqueMeeting}`;
            if (!uniqPairs.has(key)) {
              uniqPairs.add(key);
              studentReviewDocs.push({ from: teacherUserId, to: sid, course: c._id, meetingNumber: uniqueMeeting, teacherRatings: makeRatings(4), comment: peerComments[Math.floor(Math.random() * peerComments.length)] });
            }
          }
        }
      }
    });
    await StudentReview.create(studentReviewDocs);

    const adminComments = [
      "Koordinasi antar admin sangat baik.",
      "Proses berjalan efisien, pertahankan.",
      "Komunikasi jelas dan profesional.",
      "Tanggung jawab tinggi terhadap tugas.",
      "Cepat menyelesaikan kendala operasional."
    ];
    const adminReviewDocs = [];
    for (let meeting = 1; meeting <= 16; meeting++) {
      for (let i = 0; i < admins.length; i++) {
        const from = admins[i]._id;
        const to = admins[(i + 1) % admins.length]._id;
        adminReviewDocs.push({ from, to, meetingNumber: meeting, ratings: makeRatings(4), comment: adminComments[Math.floor(Math.random() * adminComments.length)] });
      }
    }
    await AdminReview.create(adminReviewDocs);

    console.log("Seed completed", {
      institutions: institutions.map((i) => i._id),
      admins: admins.map((a) => a._id),
      lecturers: teachers.map((t) => t._id),
      students: students.map((s) => s._id),
      courses: courses.map((c) => c._id),
    });
    process.exit(0);
  } catch (error) {
    console.error("Error resetting and seeding:", error);
    process.exit(1);
  }
};

resetAndSeed();
