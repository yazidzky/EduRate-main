import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import fetchJson from "@/lib/fetchJson";

interface Question {
  id: string;
  text: string;
  category: string;
}

const RatingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ratingType = searchParams.get("type") || "dosen";
  const toParam = searchParams.get("to") || "";
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [toInput, setToInput] = useState("");

  const isMahasiswaRatingDosen = ratingType === "dosen" && user?.role === "mahasiswa";
  const isMahasiswaRatingMahasiswa = ratingType === "teman" && user?.role === "mahasiswa";
  const isDosenRatingMahasiswa = ratingType === "teman" && user?.role === "dosen";
  const isDosenRatingDosen = ratingType === "dosen" && user?.role === "dosen";
  const questions: Question[] =
    isMahasiswaRatingDosen
      ? [
          { id: "sd-c-1", text: "Dosen menjelaskan materi dengan jelas dan mudah dipahami.", category: "Communication" },
          { id: "sd-c-2", text: "Dosen terbuka menerima pertanyaan.", category: "Communication" },
          { id: "sd-c-3", text: "Dosen memberikan jawaban yang jelas atas pertanyaan.", category: "Communication" },
          { id: "sd-c-4", text: "Dosen berkomunikasi dengan sopan dan profesional.", category: "Communication" },
          { id: "sd-c-5", text: "Dosen memberikan instruksi yang jelas mengenai tugas.", category: "Communication" },
          { id: "sd-c-6", text: "Dosen responsif terhadap pesan.", category: "Communication" },
          { id: "sd-c-7", text: "Dosen menggunakan media komunikasi dengan efektif.", category: "Communication" },
          { id: "sd-c-8", text: "Dosen mampu menyampaikan kritik atau koreksi dengan baik.", category: "Communication" },
          { id: "sd-c-9", text: "Dosen memperhatikan umpan balik dari mahasiswa.", category: "Communication" },
          { id: "sd-c-10", text: "Dosen menyampaikan informasi akademik secara tepat waktu.", category: "Communication" },
          { id: "sd-co-1", text: "Dosen menciptakan lingkungan belajar yang kolaboratif.", category: "Collaboration" },
          { id: "sd-co-2", text: "Dosen mendorong interaksi aktif dalam kelas.", category: "Collaboration" },
          { id: "sd-co-3", text: "Dosen menghargai pendapat mahasiswa dalam diskusi.", category: "Collaboration" },
          { id: "sd-co-4", text: "Dosen membangun hubungan komunikasi yang positif.", category: "Collaboration" },
          { id: "sd-co-5", text: "Dosen memfasilitasi kerja kelompok secara efektif.", category: "Collaboration" },
          { id: "sd-co-6", text: "Dosen merespons masukan mahasiswa dengan baik.", category: "Collaboration" },
          { id: "sd-co-7", text: "Dosen menciptakan suasana kelas yang inklusif.", category: "Collaboration" },
          { id: "sd-co-8", text: "Dosen mendorong kegiatan akademik berbasis kolaborasi.", category: "Collaboration" },
          { id: "sd-co-9", text: "Dosen melibatkan mahasiswa dalam pengambilan keputusan kelas.", category: "Collaboration" },
          { id: "sd-co-10", text: "Dosen menjaga interaksi pembelajaran yang sehat.", category: "Collaboration" },
          { id: "sd-e-1", text: "Dosen bersikap adil dalam penilaian.", category: "Ethics" },
          { id: "sd-e-2", text: "Dosen menjaga etika profesional saat mengajar.", category: "Ethics" },
          { id: "sd-e-3", text: "Dosen tepat waktu dalam mengajar.", category: "Ethics" },
          { id: "sd-e-4", text: "Dosen konsisten dalam menerapkan aturan kelas.", category: "Ethics" },
          { id: "sd-e-5", text: "Dosen tidak menunjukkan diskriminasi dalam perlakuan.", category: "Ethics" },
          { id: "sd-e-6", text: "Dosen menjaga kerahasiaan nilai dan data pribadi mahasiswa.", category: "Ethics" },
          { id: "sd-e-7", text: "Dosen tidak memiliki konflik kepentingan dalam pembelajaran.", category: "Ethics" },
          { id: "sd-e-8", text: "Dosen memberi contoh sikap profesional.", category: "Ethics" },
          { id: "sd-e-9", text: "Dosen mengikuti pedoman etika akademik.", category: "Ethics" },
          { id: "sd-e-10", text: "Dosen memberikan sanksi secara adil dan proporsional.", category: "Ethics" },
          { id: "sd-r-1", text: "Dosen mengembalikan nilai tepat waktu.", category: "Responsibility" },
          { id: "sd-r-2", text: "Dosen memulai kelas tepat waktu.", category: "Responsibility" },
          { id: "sd-r-3", text: "Dosen menyampaikan jadwal dengan jelas.", category: "Responsibility" },
          { id: "sd-r-4", text: "Dosen konsisten mengikuti RPS (silabus).", category: "Responsibility" },
          { id: "sd-r-5", text: "Dosen bertanggung jawab atas materi yang diajarkan.", category: "Responsibility" },
          { id: "sd-r-6", text: "Dosen menyiapkan materi sebelum kelas berlangsung.", category: "Responsibility" },
          { id: "sd-r-7", text: "Dosen tidak menunda-nunda evaluasi tugas.", category: "Responsibility" },
          { id: "sd-r-8", text: "Dosen menyampaikan perubahan jadwal jauh-jauh hari.", category: "Responsibility" },
          { id: "sd-r-9", text: "Dosen menjaga komitmen terhadap waktu konsultasi.", category: "Responsibility" },
          { id: "sd-r-10", text: "Dosen bertindak profesional saat ada keterlambatan.", category: "Responsibility" },
          { id: "sd-p-1", text: "Dosen membantu mahasiswa memahami inti masalah akademik.", category: "Problem Solving" },
          { id: "sd-p-2", text: "Dosen memberikan solusi yang jelas dan dapat diterapkan.", category: "Problem Solving" },
          { id: "sd-p-3", text: "Dosen memberikan panduan langkah demi langkah dalam memecahkan masalah.", category: "Problem Solving" },
          { id: "sd-p-4", text: "Dosen mampu menjelaskan alternatif solusi.", category: "Problem Solving" },
          { id: "sd-p-5", text: "Dosen tenang dan profesional ketika terjadi masalah di kelas.", category: "Problem Solving" },
          { id: "sd-p-6", text: "Dosen membantu mahasiswa mengembangkan pola pikir kritis.", category: "Problem Solving" },
          { id: "sd-p-7", text: "Dosen mendorong mahasiswa mencari solusi sendiri terlebih dahulu.", category: "Problem Solving" },
          { id: "sd-p-8", text: "Dosen memberikan studi kasus untuk melatih problem solving.", category: "Problem Solving" },
          { id: "sd-p-9", text: "Dosen cepat merespons masalah yang muncul dalam pembelajaran.", category: "Problem Solving" },
          { id: "sd-p-10", text: "Dosen mampu memecahkan masalah teknis selama pembelajaran.", category: "Problem Solving" },
        ]
      : isDosenRatingMahasiswa
      ? [
          { id: "m1", text: "Mahasiswa dapat memahami penjelasan dengan baik.", category: "Communication" },
          { id: "m2", text: "Mahasiswa menyampaikan pertanyaan dengan jelas.", category: "Communication" },
          { id: "m3", text: "Mahasiswa bersikap sopan ketika berkomunikasi.", category: "Communication" },
          { id: "m4", text: "Mahasiswa aktif berinteraksi selama pembelajaran.", category: "Communication" },
          { id: "m5", text: "Mahasiswa memberikan respons yang relevan terhadap instruksi.", category: "Communication" },
          { id: "m6", text: "Mahasiswa mudah dihubungi saat dibutuhkan.", category: "Communication" },
          { id: "m7", text: "Mahasiswa mampu menyampaikan ide secara jelas.", category: "Communication" },
          { id: "m8", text: "Mahasiswa terbuka menerima penjelasan tambahan.", category: "Communication" },
          { id: "m9", text: "Mahasiswa mengikuti etika komunikasi akademik.", category: "Communication" },
          { id: "m10", text: "Mahasiswa memberi umpan balik terhadap penjelasan.", category: "Communication" },
          { id: "m11", text: "Mahasiswa mampu bekerja sama dalam tugas kelompok.", category: "Collaboration" },
          { id: "m12", text: "Mahasiswa menghargai pendapat anggota kelompoknya.", category: "Collaboration" },
          { id: "m13", text: "Mahasiswa berpartisipasi aktif dalam diskusi kelas.", category: "Collaboration" },
          { id: "m14", text: "Mahasiswa membantu rekan dalam memahami materi.", category: "Collaboration" },
          { id: "m15", text: "Mahasiswa menjalankan peran kelompok dengan baik.", category: "Collaboration" },
          { id: "m16", text: "Mahasiswa mampu menjaga hubungan kerja yang positif.", category: "Collaboration" },
          { id: "m17", text: "Mahasiswa terbuka terhadap saran dari anggota kelompok.", category: "Collaboration" },
          { id: "m18", text: "Mahasiswa tidak mendominasi atau menghambat kelompok.", category: "Collaboration" },
          { id: "m19", text: "Mahasiswa membantu menciptakan suasana belajar kondusif.", category: "Collaboration" },
          { id: "m20", text: "Mahasiswa menyelesaikan tugas kelompok secara adil.", category: "Collaboration" },
          { id: "m21", text: "Mahasiswa mengikuti aturan kelas.", category: "Ethics" },
          { id: "m22", text: "Mahasiswa menjaga kejujuran akademik (anti-plagiarisme).", category: "Ethics" },
          { id: "m23", text: "Mahasiswa bersikap sopan dan menghormati dosen.", category: "Ethics" },
          { id: "m24", text: "Mahasiswa hadir tepat waktu dalam perkuliahan.", category: "Ethics" },
          { id: "m25", text: "Mahasiswa tidak melakukan tindakan yang mengganggu kelas.", category: "Ethics" },
          { id: "m26", text: "Mahasiswa bertanggung jawab atas tugas yang diberikan.", category: "Ethics" },
          { id: "m27", text: "Mahasiswa menjaga etika komunikasi dengan dosen.", category: "Ethics" },
          { id: "m28", text: "Mahasiswa menaati aturan ujian.", category: "Ethics" },
          { id: "m29", text: "Mahasiswa menerima evaluasi dengan sikap profesional.", category: "Ethics" },
          { id: "m30", text: "Mahasiswa menjaga integritas dalam kerja kelompok.", category: "Ethics" },
          { id: "m31", text: "Mahasiswa mengumpulkan tugas tepat waktu.", category: "Responsibility" },
          { id: "m32", text: "Mahasiswa mengatur waktu dengan baik.", category: "Responsibility" },
          { id: "m33", text: "Mahasiswa hadir tepat waktu di kelas.", category: "Responsibility" },
          { id: "m34", text: "Mahasiswa mempersiapkan diri sebelum perkuliahan.", category: "Responsibility" },
          { id: "m35", text: "Mahasiswa bertanggung jawab atas pekerjaan kelompok.", category: "Responsibility" },
          { id: "m36", text: "Mahasiswa tidak menunda pekerjaan.", category: "Responsibility" },
          { id: "m37", text: "Mahasiswa dapat mengelola beban akademik.", category: "Responsibility" },
          { id: "m38", text: "Mahasiswa menyelesaikan tugas sesuai instruksi.", category: "Responsibility" },
          { id: "m39", text: "Mahasiswa mampu bekerja sesuai jadwal yang ditentukan.", category: "Responsibility" },
          { id: "m40", text: "Mahasiswa mematuhi deadline proyek.", category: "Responsibility" },
          { id: "m41", text: "Mahasiswa mampu mengenali sumber masalah dalam tugas atau materi.", category: "Problem Solving" },
          { id: "m42", text: "Mahasiswa dapat mencari solusi sendiri sebelum meminta bantuan.", category: "Problem Solving" },
          { id: "m43", text: "Mahasiswa mampu berpikir logis saat menghadapi tantangan belajar.", category: "Problem Solving" },
          { id: "m44", text: "Mahasiswa tidak mudah menyerah ketika menghadapi kesulitan.", category: "Problem Solving" },
          { id: "m45", text: "Mahasiswa mencari informasi tambahan untuk memecahkan masalah.", category: "Problem Solving" },
          { id: "m46", text: "Mahasiswa mampu menyelesaikan masalah kelompok secara efektif.", category: "Problem Solving" },
          { id: "m47", text: "Mahasiswa dapat memilih solusi terbaik dari beberapa alternatif.", category: "Problem Solving" },
          { id: "m48", text: "Mahasiswa menunjukkan kreativitas dalam mengerjakan tugas.", category: "Problem Solving" },
          { id: "m49", text: "Mahasiswa mempertimbangkan konsekuensi dari keputusan mereka.", category: "Problem Solving" },
          { id: "m50", text: "Mahasiswa mampu menyelesaikan masalah teknis yang sederhana.", category: "Problem Solving" },
        ]
      : isMahasiswaRatingMahasiswa
      ? [
          { id: "mm-c-1", text: "Teman berkomunikasi dengan jelas dalam diskusi.", category: "Communication" },
          { id: "mm-c-2", text: "Teman sopan dalam menyampaikan pendapat.", category: "Communication" },
          { id: "mm-c-3", text: "Teman memberi kesempatan orang lain berbicara.", category: "Communication" },
          { id: "mm-c-4", text: "Teman responsif terhadap pesan kelompok.", category: "Communication" },
          { id: "mm-c-5", text: "Teman mampu menyampaikan ide secara jelas.", category: "Communication" },
          { id: "mm-c-6", text: "Teman tidak mendominasi pembicaraan.", category: "Communication" },
          { id: "mm-c-7", text: "Teman berkomunikasi tanpa konflik.", category: "Communication" },
          { id: "mm-c-8", text: "Teman mampu menjelaskan tugas saat kerja kelompok.", category: "Communication" },
          { id: "mm-c-9", text: "Teman mendengarkan pendapat orang lain.", category: "Communication" },
          { id: "mm-c-10", text: "Teman memberikan informasi yang akurat dan lengkap.", category: "Communication" },
          { id: "mm-co-1", text: "Mahasiswa berkontribusi aktif dalam kerja kelompok.", category: "Collaboration" },
          { id: "mm-co-2", text: "Menghargai peran setiap anggota tim.", category: "Collaboration" },
          { id: "mm-co-3", text: "Menjaga interaksi positif selama kerja kelompok.", category: "Collaboration" },
          { id: "mm-co-4", text: "Kooperatif dalam menyelesaikan tugas.", category: "Collaboration" },
          { id: "mm-co-5", text: "Menyelesaikan konflik kelompok secara profesional.", category: "Collaboration" },
          { id: "mm-co-6", text: "Membantu rekan yang mengalami kesulitan.", category: "Collaboration" },
          { id: "mm-co-7", text: "Berperan aktif dalam diskusi akademik.", category: "Collaboration" },
          { id: "mm-co-8", text: "Terbuka terhadap ide-ide baru dalam kelompok.", category: "Collaboration" },
          { id: "mm-co-9", text: "Menjaga dinamika kerja yang seimbang.", category: "Collaboration" },
          { id: "mm-co-10", text: "Mendorong penyelesaian tugas secara kolektif.", category: "Collaboration" },
          { id: "mm-e-1", text: "Menghargai perbedaan pendapat.", category: "Ethics" },
          { id: "mm-e-2", text: "Bersikap jujur dalam tugas kelompok.", category: "Ethics" },
          { id: "mm-e-3", text: "Tidak melakukan plagiarisme.", category: "Ethics" },
          { id: "mm-e-4", text: "Memenuhi komitmen kelompok.", category: "Ethics" },
          { id: "mm-e-5", text: "Bersikap sopan selama interaksi.", category: "Ethics" },
          { id: "mm-e-6", text: "Tidak menyalahgunakan wewenang kelompok.", category: "Ethics" },
          { id: "mm-e-7", text: "Menghormati privasi anggota lain.", category: "Ethics" },
          { id: "mm-e-8", text: "Tidak menyebarkan informasi palsu.", category: "Ethics" },
          { id: "mm-e-9", text: "Bertanggung jawab terhadap tugasnya.", category: "Ethics" },
          { id: "mm-e-10", text: "Mengikuti etika akademik.", category: "Ethics" },
          { id: "mm-r-1", text: "Mengumpulkan tugas kelompok tepat waktu.", category: "Responsibility" },
          { id: "mm-r-2", text: "Tidak menunda pekerjaan kelompok.", category: "Responsibility" },
          { id: "mm-r-3", text: "Hadir tepat waktu saat diskusi.", category: "Responsibility" },
          { id: "mm-r-4", text: "Mengatur waktu dengan baik.", category: "Responsibility" },
          { id: "mm-r-5", text: "Bertanggung jawab atas bagiannya.", category: "Responsibility" },
          { id: "mm-r-6", text: "Memberi kabar bila terlambat.", category: "Responsibility" },
          { id: "mm-r-7", text: "Mematuhi timeline kelompok.", category: "Responsibility" },
          { id: "mm-r-8", text: "Mempersiapkan diri sebelum rapat.", category: "Responsibility" },
          { id: "mm-r-9", text: "Mengutamakan komitmen kelompok.", category: "Responsibility" },
          { id: "mm-r-10", text: "Konsisten menyelesaikan tugas pribadi.", category: "Responsibility" },
          { id: "mm-p-1", text: "Mengidentifikasi penyebab masalah dalam tugas kelompok.", category: "Problem Solving" },
          { id: "mm-p-2", text: "Memberikan ide solusi yang masuk akal.", category: "Problem Solving" },
          { id: "mm-p-3", text: "Berpikir kritis saat menghadapi masalah.", category: "Problem Solving" },
          { id: "mm-p-4", text: "Tetap tenang ketika terjadi konflik kelompok.", category: "Problem Solving" },
          { id: "mm-p-5", text: "Mempertimbangkan pendapat anggota lain dalam solusi.", category: "Problem Solving" },
          { id: "mm-p-6", text: "Mengambil keputusan kelompok secara adil.", category: "Problem Solving" },
          { id: "mm-p-7", text: "Berkontribusi aktif dalam mencari solusi.", category: "Problem Solving" },
          { id: "mm-p-8", text: "Membantu menyelesaikan masalah teknis kelompok.", category: "Problem Solving" },
          { id: "mm-p-9", text: "Tidak menyalahkan anggota lain ketika terjadi masalah.", category: "Problem Solving" },
          { id: "mm-p-10", text: "Mendorong penyelesaian masalah secara bersama-sama.", category: "Problem Solving" },
        ]
      : ratingType === "admin"
      ? [
          { id: "ad-c-1", text: "Rekan admin menyampaikan informasi teknis dengan jelas.", category: "Communication" },
          { id: "ad-c-2", text: "Rekan admin cepat merespons kebutuhan.", category: "Communication" },
          { id: "ad-c-3", text: "Rekan admin menyampaikan instruksi administrasi dengan baik.", category: "Communication" },
          { id: "ad-c-4", text: "Rekan admin mudah diajak berdiskusi.", category: "Communication" },
          { id: "ad-c-5", text: "Rekan admin menjaga etika komunikasi.", category: "Communication" },
          { id: "ad-c-6", text: "Rekan admin memberikan laporan secara jelas.", category: "Communication" },
          { id: "ad-c-7", text: "Rekan admin menyampaikan masalah tanpa emosi.", category: "Communication" },
          { id: "ad-c-8", text: "Rekan admin memberi umpan balik yang membangun.", category: "Communication" },
          { id: "ad-c-9", text: "Rekan admin mendengarkan pendapat.", category: "Communication" },
          { id: "ad-c-10", text: "Rekan admin mampu menjelaskan prosedur dengan jelas.", category: "Communication" },
          { id: "ad-co-1", text: "Rekan admin mampu bekerja dalam tim administrasi.", category: "Collaboration" },
          { id: "ad-co-2", text: "Rekan admin menghargai pembagian tugas harian.", category: "Collaboration" },
          { id: "ad-co-3", text: "Rekan admin membantu saat ada pekerjaan mendesak.", category: "Collaboration" },
          { id: "ad-co-4", text: "Rekan admin berkoordinasi dengan baik.", category: "Collaboration" },
          { id: "ad-co-5", text: "Rekan admin mengikuti SOP dalam kerja tim.", category: "Collaboration" },
          { id: "ad-co-6", text: "Rekan admin tidak menghambat alur kerja.", category: "Collaboration" },
          { id: "ad-co-7", text: "Rekan admin terbuka pada masukan tim.", category: "Collaboration" },
          { id: "ad-co-8", text: "Rekan admin menyelesaikan tugas bersama tepat waktu.", category: "Collaboration" },
          { id: "ad-co-9", text: "Rekan admin menjaga kerja tim tetap harmonis.", category: "Collaboration" },
          { id: "ad-co-10", text: "Rekan admin mampu menyelesaikan masalah tim.", category: "Collaboration" },
          { id: "ad-e-1", text: "Rekan admin mematuhi aturan layanan akademik.", category: "Ethics" },
          { id: "ad-e-2", text: "Rekan admin berperilaku sopan dan profesional.", category: "Ethics" },
          { id: "ad-e-3", text: "Rekan admin menjaga kerahasiaan dokumen penting.", category: "Ethics" },
          { id: "ad-e-4", text: "Rekan admin menghindari konflik kepentingan.", category: "Ethics" },
          { id: "ad-e-5", text: "Rekan admin menghormati rekan kerja.", category: "Ethics" },
          { id: "ad-e-6", text: "Rekan admin menjalankan tugas sesuai SOP.", category: "Ethics" },
          { id: "ad-e-7", text: "Rekan admin tidak melakukan penyalahgunaan wewenang.", category: "Ethics" },
          { id: "ad-e-8", text: "Rekan admin tepat waktu dalam pekerjaan.", category: "Ethics" },
          { id: "ad-e-9", text: "Rekan admin menjaga integritas dalam proses administrasi.", category: "Ethics" },
          { id: "ad-e-10", text: "Rekan admin menyelesaikan perbedaan pendapat secara profesional.", category: "Ethics" },
          { id: "ad-r-1", text: "Rekan admin menyelesaikan dokumen tepat waktu.", category: "Responsibility" },
          { id: "ad-r-2", text: "Rekan admin mematuhi jadwal pelayanan akademik.", category: "Responsibility" },
          { id: "ad-r-3", text: "Rekan admin dapat mengatur waktu kerja dengan baik.", category: "Responsibility" },
          { id: "ad-r-4", text: "Rekan admin mengelola beban kerja secara efektif.", category: "Responsibility" },
          { id: "ad-r-5", text: "Rekan admin bertanggung jawab atas tiap tugas.", category: "Responsibility" },
          { id: "ad-r-6", text: "Rekan admin tidak menunda pekerjaan administratif.", category: "Responsibility" },
          { id: "ad-r-7", text: "Rekan admin disiplin dalam jam kerja.", category: "Responsibility" },
          { id: "ad-r-8", text: "Rekan admin mengikuti timeline kegiatan.", category: "Responsibility" },
          { id: "ad-r-9", text: "Rekan admin siap saat ada tugas mendadak.", category: "Responsibility" },
          { id: "ad-r-10", text: "Rekan admin menjaga komitmen terhadap pelayanan.", category: "Responsibility" },
          { id: "ad-p-1", text: "Rekan admin mampu menganalisis penyebab masalah layanan akademik.", category: "Problem Solving" },
          { id: "ad-p-2", text: "Rekan admin menawarkan solusi yang efektif dan cepat.", category: "Problem Solving" },
          { id: "ad-p-3", text: "Rekan admin tetap tenang pada situasi mendesak.", category: "Problem Solving" },
          { id: "ad-p-4", text: "Rekan admin mampu memutuskan langkah yang tepat saat ada kendala.", category: "Problem Solving" },
          { id: "ad-p-5", text: "Rekan admin bekerja sama menemukan solusi terbaik.", category: "Problem Solving" },
          { id: "ad-p-6", text: "Rekan admin mempertimbangkan prosedur saat menyelesaikan masalah.", category: "Problem Solving" },
          { id: "ad-p-7", text: "Rekan admin mampu mengatasi masalah teknis rutin.", category: "Problem Solving" },
          { id: "ad-p-8", text: "Rekan admin menyelesaikan masalah tanpa membuat konflik.", category: "Problem Solving" },
          { id: "ad-p-9", text: "Rekan admin kreatif dalam memperbaiki proses kerja.", category: "Problem Solving" },
          { id: "ad-p-10", text: "Rekan admin belajar dari masalah sebelumnya untuk mencegah terulang.", category: "Problem Solving" },
        ]
      : isDosenRatingDosen
      ? [
          { id: "dd-c-1", text: "Rekan dosen menyampaikan informasi akademik dengan jelas.", category: "Communication" },
          { id: "dd-c-2", text: "Rekan dosen mudah dihubungi untuk koordinasi.", category: "Communication" },
          { id: "dd-c-3", text: "Rekan dosen memberi penjelasan yang mudah dipahami dalam diskusi.", category: "Communication" },
          { id: "dd-c-4", text: "Rekan dosen memberikan umpan balik dengan sopan dan konstruktif.", category: "Communication" },
          { id: "dd-c-5", text: "Rekan dosen menyampaikan pendapat tanpa menyinggung pihak lain.", category: "Communication" },
          { id: "dd-c-6", text: "Rekan dosen mampu menyampaikan arahan secara efektif.", category: "Communication" },
          { id: "dd-c-7", text: "Rekan dosen terbuka dalam menerima pendapat.", category: "Communication" },
          { id: "dd-c-8", text: "Rekan dosen dapat menjelaskan alasan dari setiap keputusan akademik.", category: "Communication" },
          { id: "dd-c-9", text: "Rekan dosen aktif berkomunikasi di forum internal.", category: "Communication" },
          { id: "dd-c-10", text: "Rekan dosen mendengarkan pendapat sebelum merespons.", category: "Communication" },
          { id: "dd-co-1", text: "Rekan dosen mampu bekerja sama dalam kegiatan akademik.", category: "Collaboration" },
          { id: "dd-co-2", text: "Rekan dosen aktif berkontribusi dalam tim pengajar.", category: "Collaboration" },
          { id: "dd-co-3", text: "Rekan dosen menghargai pendapat rekan sesame dosen.", category: "Collaboration" },
          { id: "dd-co-4", text: "Rekan dosen siap membantu ketika diperlukan.", category: "Collaboration" },
          { id: "dd-co-5", text: "Rekan dosen dapat menyelesaikan tugas tim secara kolektif.", category: "Collaboration" },
          { id: "dd-co-6", text: "Rekan dosen mampu menjaga hubungan kerja profesional.", category: "Collaboration" },
          { id: "dd-co-7", text: "Rekan dosen berpartisipasi dalam rapat akademik secara aktif.", category: "Collaboration" },
          { id: "dd-co-8", text: "Rekan dosen bersikap terbuka terhadap ide-ide kolaboratif.", category: "Collaboration" },
          { id: "dd-co-9", text: "Rekan dosen mendukung tercapainya tujuan akademik bersama.", category: "Collaboration" },
          { id: "dd-co-10", text: "Rekan dosen menghindari konflik dalam kerja tim.", category: "Collaboration" },
          { id: "dd-e-1", text: "Rekan dosen mematuhi aturan dan kebijakan kampus.", category: "Ethics" },
          { id: "dd-e-2", text: "Rekan dosen menjaga integritas dalam pekerjaan.", category: "Ethics" },
          { id: "dd-e-3", text: "Rekan dosen bersikap adil dalam setiap keputusan akademik.", category: "Ethics" },
          { id: "dd-e-4", text: "Rekan dosen menunjukkan sikap profesional dalam interaksi.", category: "Ethics" },
          { id: "dd-e-5", text: "Rekan dosen datang tepat waktu dalam rapat atau kegiatan kampus.", category: "Ethics" },
          { id: "dd-e-6", text: "Rekan dosen menjalankan tugas mengajar sesuai standar.", category: "Ethics" },
          { id: "dd-e-7", text: "Rekan dosen tidak menunda pekerjaan yang telah disepakati.", category: "Ethics" },
          { id: "dd-e-8", text: "Rekan dosen menghormati privasi dan kerahasiaan data akademik.", category: "Ethics" },
          { id: "dd-e-9", text: "Rekan dosen bersikap sopan dan menghargai kolega.", category: "Ethics" },
          { id: "dd-e-10", text: "Rekan dosen menyelesaikan konflik secara etis.", category: "Ethics" },
          { id: "dd-r-1", text: "Rekan dosen menyelesaikan pekerjaannya tepat waktu.", category: "Responsibility" },
          { id: "dd-r-2", text: "Rekan dosen datang tepat waktu ke rapat.", category: "Responsibility" },
          { id: "dd-r-3", text: "Rekan dosen dapat mengatur jadwal dengan baik.", category: "Responsibility" },
          { id: "dd-r-4", text: "Rekan dosen mengingat tenggat waktu akademik.", category: "Responsibility" },
          { id: "dd-r-5", text: "Rekan dosen bertanggung jawab atas tugasnya.", category: "Responsibility" },
          { id: "dd-r-6", text: "Rekan dosen dapat diandalkan dalam kegiatan kampus.", category: "Responsibility" },
          { id: "dd-r-7", text: "Rekan dosen tidak menunda pekerjaan.", category: "Responsibility" },
          { id: "dd-r-8", text: "Rekan dosen mempersiapkan materi sebelum mengajar.", category: "Responsibility" },
          { id: "dd-r-9", text: "Rekan dosen mematuhi timeline proyek akademik.", category: "Responsibility" },
          { id: "dd-r-10", text: "Rekan dosen responsif terhadap tanggung jawab tambahan.", category: "Responsibility" },
          { id: "dd-p-1", text: "Rekan dosen mampu mengidentifikasi masalah akademik dengan cepat.", category: "Problem Solving" },
          { id: "dd-p-2", text: "Rekan dosen menawarkan solusi yang realistis saat terjadi masalah.", category: "Problem Solving" },
          { id: "dd-p-3", text: "Rekan dosen mampu menganalisis situasi secara objektif.", category: "Problem Solving" },
          { id: "dd-p-4", text: "Rekan dosen tidak mudah panik ketika menghadapi kendala.", category: "Problem Solving" },
          { id: "dd-p-5", text: "Rekan dosen dapat mengambil keputusan yang tepat dalam waktu singkat.", category: "Problem Solving" },
          { id: "dd-p-6", text: "Rekan dosen mau berdiskusi untuk mencari solusi terbaik.", category: "Problem Solving" },
          { id: "dd-p-7", text: "Rekan dosen dapat menyesuaikan solusi sesuai kondisi lapangan.", category: "Problem Solving" },
          { id: "dd-p-8", text: "Rekan dosen menyelesaikan masalah tanpa menyalahkan pihak lain.", category: "Problem Solving" },
          { id: "dd-p-9", text: "Rekan dosen mampu memperbaiki masalah teknis dalam pembelajaran.", category: "Problem Solving" },
          { id: "dd-p-10", text: "Rekan dosen menunjukkan kreativitas dalam mencari solusi.", category: "Problem Solving" },
        ]
      : [];

  const steps =
    ratingType === "dosen" || isDosenRatingMahasiswa
      ? ["Communication", "Collaboration", "Ethics", "Responsibility", "Problem Solving", "Review"]
      : ratingType === "teman"
      ? ["Communication", "Collaboration", "Ethics", "Responsibility", "Problem Solving", "Review"]
      : ratingType === "admin"
      ? ["Communication", "Collaboration", "Ethics", "Responsibility", "Problem Solving", "Review"]
      : ["Communication", "Collaboration", "Ethics", "Responsibility", "Problem Solving", "Review"];
  const questionsPerStep = Math.ceil(questions.length / (steps.length - 1));

  const getCurrentQuestions = () => {
    if (currentStep === steps.length - 1) return [];
    const start = currentStep * questionsPerStep;
    const end = start + questionsPerStep;
    return questions.slice(start, end);
  };

  const handleRatingChange = (questionId: string, value: number) => {
    setRatings((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    const adminIdParam = searchParams.get("adminId");
    if (ratingType === "admin" && !adminIdParam) {
      toast.error("Admin tidak dipilih");
      return;
    }
    const currentQuestions = getCurrentQuestions();
    const allAnswered = currentQuestions.every((q) => ratings[q.id]);

    if (!allAnswered && currentStep < steps.length - 1) {
      toast.error("Mohon jawab semua pertanyaan!");
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const adminIdParam = searchParams.get("adminId");
    if (ratingType === "admin" && !adminIdParam) {
      toast.error("Admin tidak dipilih");
      return;
    }
    const send = async () => {
      if (ratingType === "admin") {
        const cats = ["Communication", "Collaboration", "Ethics", "Responsibility", "Problem Solving"] as const;
        const avgByCat: Record<string, number> = {};
        for (const cat of cats) {
          const qs = questions.filter((q) => q.category === cat);
          const avg = qs.length ? qs.reduce((sum, q) => sum + (ratings[q.id] || 0), 0) / qs.length : 0;
          avgByCat[cat] = Math.max(1, Math.min(5, Math.round(avg)));
        }
        try {
          const res = await fetchJson("/api/admin-reviews", {
            method: "POST",
            body: {
              to: adminIdParam,
              ratings: {
                communication: avgByCat["Communication"],
                collaboration: avgByCat["Collaboration"],
                ethics: avgByCat["Ethics"],
                responsibility: avgByCat["Responsibility"],
                problemSolving: avgByCat["Problem Solving"],
              },
              comment,
            },
          });
          if (!res?.success) {
            toast.error(res?.message || "Gagal mengirim rating admin");
            return;
          }
        } catch (err: any) {
          toast.error(err?.message || "Gagal mengirim rating admin");
          return;
        }
      } else if (ratingType === "dosen") {
        const categories = [
          "Communication",
          "Collaboration",
          "Ethics",
          "Responsibility",
          "Problem Solving",
        ] as const;
        const categoryAvg: Record<string, number> = {};
        for (const cat of categories) {
          const qs = questions.filter((q) => q.category === cat);
          const avg = qs.length
            ? qs.reduce((sum, q) => sum + (ratings[q.id] || 0), 0) / qs.length
            : 0;
          const rounded = Math.max(1, Math.min(5, Math.round(avg)));
          categoryAvg[cat] = rounded;
        }
        const teacherId = searchParams.get("teacherId");
        const courseId = searchParams.get("courseId") || undefined;
        if (!teacherId) {
          toast.error("Dosen tidak dipilih");
          return;
        }
        try {
          const res = await fetchJson("/api/reviews", {
            method: "POST",
            body: {
              teacher: teacherId,
              course: courseId,
              ratings: {
                communication: categoryAvg["Communication"],
                collaboration: categoryAvg["Collaboration"],
                ethics: categoryAvg["Ethics"],
                responsibility: categoryAvg["Responsibility"],
                problemSolving: categoryAvg["Problem Solving"],
              },
              comment,
            },
          });
          if (!res?.success) {
            toast.error(res?.message || "Gagal mengirim rating");
            return;
          }
        } catch (err: any) {
          toast.error(err?.message || "Gagal mengirim rating");
          return;
        }
      } else if (ratingType === "teman") {
        const categories = [
          "Communication",
          "Collaboration",
          "Ethics",
          "Responsibility",
          "Problem Solving",
        ] as const;
        const categoryAvg: Record<string, number> = {};
        const toUserId = toParam || toInput;
        if (!toUserId) {
          toast.error("Teman tidak dipilih");
          return;
        }
        if (isDosenRatingMahasiswa) {
          const teacherCats = [
            "Communication",
            "Collaboration",
            "Ethics",
            "Responsibility",
            "Problem Solving",
          ] as const;
          const tAvg: Record<string, number> = {};
          for (const cat of teacherCats) {
            const qs = questions.filter((q) => q.category === cat);
            const avg = qs.length
              ? qs.reduce((sum, q) => sum + (ratings[q.id] || 0), 0) / qs.length
              : 0;
            const rounded = Math.max(1, Math.min(5, Math.round(avg)));
            tAvg[cat] = rounded;
          }
          try {
            const res = await fetchJson("/api/student-reviews", {
              method: "POST",
              body: {
                to: toUserId,
                teacherRatings: {
                  communication: tAvg["Communication"],
                  collaboration: tAvg["Collaboration"],
                  ethics: tAvg["Ethics"],
                  responsibility: tAvg["Responsibility"],
                  problemSolving: tAvg["Problem Solving"],
                },
                comment,
              },
            });
            if (!res?.success) {
              toast.error(
                res?.message || "Gagal mengirim rating dosen→mahasiswa"
              );
              return;
            }
            toast.success("Rating berhasil dikirim!");
            setIsSubmitted(true);
            setTimeout(() => navigate("/dashboard"), 1200);
          } catch (err: any) {
            toast.error(
              err?.message || "Gagal mengirim rating dosen→mahasiswa"
            );
            return;
          }
          return;
        } else {
          for (const cat of categories) {
            const qs = questions.filter((q) => q.category === cat);
            const avg = qs.length
              ? qs.reduce((sum, q) => sum + (ratings[q.id] || 0), 0) / qs.length
              : 0;
            const rounded = Math.max(1, Math.min(5, Math.round(avg)));
            categoryAvg[cat] = rounded;
          }
        }
        try {
          const res = await fetchJson("/api/student-reviews", {
            method: "POST",
            body: {
              to: toUserId,
              ratings: {
                communication: categoryAvg["Communication"],
                collaboration: categoryAvg["Collaboration"],
                ethics: categoryAvg["Ethics"],
                responsibility: categoryAvg["Responsibility"],
                problemSolving: categoryAvg["Problem Solving"],
              },
              comment,
            },
          });
          if (!res?.success) {
            toast.error(res?.message || "Gagal mengirim rating teman");
            return;
          }
        } catch (err: any) {
          toast.error(err?.message || "Gagal mengirim rating teman");
          return;
        }
      }

      toast.success("Rating berhasil dikirim!");
      setIsSubmitted(true);
      setTimeout(() => navigate("/dashboard"), 1200);
    };

    send();
  };

  if (ratingType === "admin" && user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-card rounded-xl p-8 shadow-soft border border-border text-center"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Akses Ditolak
            </h2>
            <p className="text-muted-foreground mb-6">
              Fitur rating sesama admin hanya tersedia untuk pengguna dengan
              role admin.
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Kembali ke Dashboard
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {ratingType === "teman" && !toParam && (
          <div className="mb-6 bg-card rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Pilih Mahasiswa
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Masukkan ID pengguna mahasiswa yang ingin dinilai.
            </p>
            <Input
              value={toInput}
              onChange={(e) => setToInput(e.target.value)}
              placeholder="ID Mahasiswa"
            />
          </div>
        )}

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-2 mb-4">
            {steps.map((step, index) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex-1 text-center"
              >
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full mx-auto mb-1 sm:mb-2 flex items-center justify-center font-bold ${
                    index <= currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                <p
                  className={`hidden sm:block sm:text-sm text-xs ${
                    index <= currentStep
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {step}
                </p>
              </motion.div>
            ))}
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${((currentStep + 1) / steps.length) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
              className="bg-primary h-2 rounded-full"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentStep < steps.length - 1 ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-card rounded-xl p-4 sm:p-8 shadow-soft border border-border"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                {steps[currentStep]} Evaluation
              </h2>
              <div className="space-y-6">
                {getCurrentQuestions().map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-muted/30 rounded-lg"
                  >
                    <p className="text-foreground mb-3 font-medium text-sm sm:text-base">
                      {question.text}
                    </p>
                    <StarRating
                      value={ratings[question.id] || 0}
                      onChange={(value) =>
                        handleRatingChange(question.id, value)
                      }
                      size="lg"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="review"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-card rounded-xl p-4 sm:p-8 shadow-soft border border-border"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                Review & Comment
              </h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {steps.slice(0, 3).map((step, index) => {
                    const stepQuestions = questions.slice(
                      index * questionsPerStep,
                      (index + 1) * questionsPerStep
                    );
                    const avg =
                      stepQuestions.reduce(
                        (sum, q) => sum + (ratings[q.id] || 0),
                        0
                      ) / stepQuestions.length;
                    return (
                      <div
                        key={step}
                        className="p-4 bg-muted/30 rounded-lg text-center"
                      >
                        <p className="text-sm text-muted-foreground mb-2">
                          {step}
                        </p>
                        <p className="text-3xl font-bold text-primary">
                          {avg.toFixed(1)}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div>
                  <label className="text-foreground font-medium mb-2 block">
                    Komentar Tambahan
                  </label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Berikan feedback atau saran..."
                    rows={6}
                    className="w-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext} className="gap-2 w-full sm:w-auto">
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="gap-2 w-full sm:w-auto">
              Submit Rating
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      {isSubmitted && (
        <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-background/80 to-secondary/10 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.3 }}
            className="relative bg-card rounded-2xl p-8 shadow-xl border border-border text-center max-w-md w-full"
          >
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center"
            >
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-500"
            >
              Terima Kasih!
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-muted-foreground mt-1"
            >
              Rating berhasil dikirim dan akan memperkaya analitik.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mt-6 grid grid-cols-5 gap-2"
            >
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="w-2 h-2 rounded-full"
                />
              ))}
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RatingPage;
