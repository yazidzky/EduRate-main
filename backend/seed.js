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
      new User({ name: "Admin Keempat", email: "admin4@edurate.com", password: "password", role: "admin", nim_nip: "ADMIN004", institution: institutions[0]._id }),
    ];
    for (const a of admins) await a.save();

    const lecturersUsers = [
      new User({ name: "Dosen Demo", email: "dosen@edurate.com", password: "password", role: "dosen", nim_nip: "NIP001", institution: institutions[0]._id, department: "Informatika" }),
      new User({ name: "Bu Ratna", email: "ratna@edurate.com", password: "password", role: "dosen", nim_nip: "NIP002", institution: institutions[0]._id, department: "Sistem Informasi" }),
      new User({ name: "Pak Budi", email: "budi@edurate.com", password: "password", role: "dosen", nim_nip: "NIP003", institution: institutions[1]._id, department: "Teknik Elektro" }),
      new User({ name: "Pak Andi", email: "andi@edurate.com", password: "password", role: "dosen", nim_nip: "NIP004", institution: institutions[2]._id, department: "Teknik Mesin" }),
      new User({ name: "Bu Sari", email: "sari@edurate.com", password: "password", role: "dosen", nim_nip: "NIP005", institution: institutions[2]._id, department: "Teknik Kimia" }),
      new User({ name: "Bu Lina", email: "lina@edurate.com", password: "password", role: "dosen", nim_nip: "NIP006", institution: institutions[0]._id, department: "Matematika" }),
      new User({ name: "Pak Yusuf", email: "yusuf@edurate.com", password: "password", role: "dosen", nim_nip: "NIP007", institution: institutions[1]._id, department: "Fisika" }),
      new User({ name: "Bu Maya", email: "maya@edurate.com", password: "password", role: "dosen", nim_nip: "NIP008", institution: institutions[1]._id, department: "Statistika" }),
      new User({ name: "Pak Rudi", email: "rudi@edurate.com", password: "password", role: "dosen", nim_nip: "NIP009", institution: institutions[2]._id, department: "Teknik Sipil" }),
      new User({ name: "Bu Nisa", email: "nisa@edurate.com", password: "password", role: "dosen", nim_nip: "NIP010", institution: institutions[0]._id, department: "Biologi" }),
    ];
    for (const u of lecturersUsers) await u.save();

    const students = [
      new User({ name: "Mahasiswa Satu", email: "mahasiswa1@edurate.com", password: "password", role: "mahasiswa", nim_nip: "NIM001", institution: institutions[0]._id }),
      new User({ name: "Mahasiswa Dua", email: "mahasiswa2@edurate.com", password: "password", role: "mahasiswa", nim_nip: "NIM002", institution: institutions[0]._id }),
      new User({ name: "Mahasiswa Tiga", email: "mahasiswa3@edurate.com", password: "password", role: "mahasiswa", nim_nip: "NIM003", institution: institutions[1]._id }),
      new User({ name: "Mahasiswa Empat", email: "mahasiswa4@edurate.com", password: "password", role: "mahasiswa", nim_nip: "NIM004", institution: institutions[1]._id }),
      new User({ name: "Mahasiswa Lima", email: "mahasiswa5@edurate.com", password: "password", role: "mahasiswa", nim_nip: "NIM005", institution: institutions[2]._id }),
      new User({ name: "Mahasiswa Enam", email: "mahasiswa6@edurate.com", password: "password", role: "mahasiswa", nim_nip: "NIM006", institution: institutions[2]._id }),
      new User({ name: "Mahasiswa Tujuh", email: "mahasiswa7@edurate.com", password: "password", role: "mahasiswa", nim_nip: "NIM007", institution: institutions[0]._id }),
      new User({ name: "Mahasiswa Delapan", email: "mahasiswa8@edurate.com", password: "password", role: "mahasiswa", nim_nip: "NIM008", institution: institutions[1]._id }),
      new User({ name: "Mahasiswa Sembilan", email: "mahasiswa9@edurate.com", password: "password", role: "mahasiswa", nim_nip: "NIM009", institution: institutions[2]._id }),
      new User({ name: "Mahasiswa Sepuluh", email: "mahasiswa10@edurate.com", password: "password", role: "mahasiswa", nim_nip: "NIM010", institution: institutions[0]._id }),
      new User({ name: "Mahasiswa Sebelas", email: "mahasiswa11@edurate.com", password: "password", role: "mahasiswa", nim_nip: "NIM011", institution: institutions[0]._id }),
      new User({ name: "Mahasiswa Dua Belas", email: "mahasiswa12@edurate.com", password: "password", role: "mahasiswa", nim_nip: "NIM012", institution: institutions[1]._id }),
      new User({ name: "Mahasiswa Tiga Belas", email: "mahasiswa13@edurate.com", password: "password", role: "mahasiswa", nim_nip: "NIM013", institution: institutions[1]._id }),
      new User({ name: "Mahasiswa Empat Belas", email: "mahasiswa14@edurate.com", password: "password", role: "mahasiswa", nim_nip: "NIM014", institution: institutions[2]._id }),
      new User({ name: "Mahasiswa Lima Belas", email: "mahasiswa15@edurate.com", password: "password", role: "mahasiswa", nim_nip: "NIM015", institution: institutions[2]._id }),
      new User({ name: "Mahasiswa Enam Belas", email: "mahasiswa16@edurate.com", password: "password", role: "mahasiswa", nim_nip: "NIM016", institution: institutions[0]._id }),
      new User({ name: "Mahasiswa Tujuh Belas", email: "mahasiswa17@edurate.com", password: "password", role: "mahasiswa", nim_nip: "NIM017", institution: institutions[1]._id }),
      new User({ name: "Mahasiswa Delapan Belas", email: "mahasiswa18@edurate.com", password: "password", role: "mahasiswa", nim_nip: "NIM018", institution: institutions[2]._id }),
      new User({ name: "Mahasiswa Sembilan Belas", email: "mahasiswa19@edurate.com", password: "password", role: "mahasiswa", nim_nip: "NIM019", institution: institutions[0]._id }),
      new User({ name: "Mahasiswa Dua Puluh", email: "mahasiswa20@edurate.com", password: "password", role: "mahasiswa", nim_nip: "NIM020", institution: institutions[1]._id }),
    ];
    for (const s of students) await s.save();

    const teachers = [
      new Teacher({ name: lecturersUsers[0].name, user: lecturersUsers[0]._id, institution: institutions[0]._id, department: "Informatika" }),
      new Teacher({ name: lecturersUsers[1].name, user: lecturersUsers[1]._id, institution: institutions[0]._id, department: "Sistem Informasi" }),
      new Teacher({ name: lecturersUsers[2].name, user: lecturersUsers[2]._id, institution: institutions[1]._id, department: "Teknik Elektro" }),
      new Teacher({ name: lecturersUsers[3].name, user: lecturersUsers[3]._id, institution: institutions[2]._id, department: "Teknik Mesin" }),
      new Teacher({ name: lecturersUsers[4].name, user: lecturersUsers[4]._id, institution: institutions[2]._id, department: "Teknik Kimia" }),
    ];
    for (const t of teachers) await t.save();

    const courses = [
      new Course({ name: "Algoritma dan Pemrograman", code: "IF101", semester: 2, institution: institutions[0]._id, teacher: teachers[0]._id, schedule: "Senin, 08:00 - 10:00", room: "Lab 301", totalMeetings: 16, enrolledStudents: [students[0]._id, students[1]._id, students[6]._id, students[9]._id] }),
      new Course({ name: "Basis Data", code: "IF201", semester: 3, institution: institutions[0]._id, teacher: teachers[1]._id, schedule: "Rabu, 13:00 - 15:00", room: "Kelas B2", totalMeetings: 16, enrolledStudents: [students[11]._id, students[12]._id] }),
      new Course({ name: "Jaringan Komputer", code: "IF301", semester: 4, institution: institutions[1]._id, teacher: teachers[2]._id, schedule: "Kamis, 09:00 - 11:00", room: "Kelas C1", totalMeetings: 16, enrolledStudents: [students[2]._id, students[3]._id, students[7]._id] }),
      new Course({ name: "Termodinamika", code: "ME101", semester: 2, institution: institutions[2]._id, teacher: teachers[3]._id, schedule: "Selasa, 10:00 - 12:00", room: "Kelas M1", totalMeetings: 16, enrolledStudents: [students[4]._id, students[8]._id, students[13]._id] }),
      new Course({ name: "Reaksi Kimia", code: "CH201", semester: 3, institution: institutions[2]._id, teacher: teachers[4]._id, schedule: "Jumat, 08:00 - 10:00", room: "Lab Kimia", totalMeetings: 16, enrolledStudents: [students[14]._id, students[15]._id] }),
    ];
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
        const tIdx = teachers.findIndex((t) => String(t._id) === String(c.teacher));
        const base = 3 + (meeting % 2);
        for (const sid of c.enrolledStudents) {
          reviewDocs.push({ user: sid, teacher: c.teacher, course: c._id, meetingNumber: meeting, ratings: makeRatings(base), comment: teacherComments[Math.floor(Math.random() * teacherComments.length)] });
        }
        const lecturerRater = lecturersUsers[(tIdx + 1) % lecturersUsers.length];
        reviewDocs.push({ user: lecturerRater._id, teacher: c.teacher, course: c._id, meetingNumber: meeting, ratings: makeRatings(3), comment: teacherComments[Math.floor(Math.random() * teacherComments.length)] });
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
    courses.forEach((c, cIdx) => {
      for (let meeting = 1; meeting <= 16; meeting++) {
        const uniqueMeeting = ((meeting + cIdx - 1) % 16) + 1;
        const enrolled = c.enrolledStudents.map((s) => String(s));
        for (let i = 0; i < enrolled.length; i++) {
          const from = enrolled[i];
          const to = enrolled[(i + 1) % enrolled.length];
          if (from !== to) {
            studentReviewDocs.push({ from, to, course: c._id, meetingNumber: uniqueMeeting, ratings: makeRatings(3), comment: peerComments[Math.floor(Math.random() * peerComments.length)] });
          }
        }
        const teacherUserId = lecturersUsers.find((u) => String(u._id) === String(teachers.find((t) => String(t._id) === String(c.teacher))?.user))?._id;
        if (teacherUserId) {
          for (const sid of c.enrolledStudents) {
            studentReviewDocs.push({ from: teacherUserId, to: sid, course: c._id, meetingNumber: uniqueMeeting, teacherRatings: makeRatings(4), comment: peerComments[Math.floor(Math.random() * peerComments.length)] });
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
