export const mockDosen = [
  { id: '1', name: 'Dr. Budi Santoso', nim_nip: 'NIP001', department: 'Teknik Informatika', email: 'budi@university.ac.id' },
  { id: '2', name: 'Prof. Siti Rahayu', nim_nip: 'NIP002', department: 'Sistem Informasi', email: 'siti@university.ac.id' },
  { id: '3', name: 'Dr. Andi Wijaya', nim_nip: 'NIP003', department: 'Teknik Informatika', email: 'andi@university.ac.id' },
  { id: '4', name: 'Dr. Maya Kusuma', nim_nip: 'NIP004', department: 'Teknik Komputer', email: 'maya@university.ac.id' },
  { id: '5', name: 'Dr. Rahmat Hidayat', nim_nip: 'NIP005', department: 'Teknik Informatika', email: 'rahmat@university.ac.id' },
  { id: '6', name: 'Prof. Dewi Sartika', nim_nip: 'NIP006', department: 'Sistem Informasi', email: 'dewi.s@university.ac.id' },
];

export const mockAdmin = [
  { id: 'admin1', name: 'Admin System', nim_nip: 'ADMIN001', department: 'IT Administration', email: 'admin@university.ac.id' },
  { id: 'admin2', name: 'Super Admin', nim_nip: 'ADMIN002', department: 'IT Administration', email: 'superadmin@university.ac.id' },
];

export const mockMahasiswa = [
  { id: '1', name: 'Ahmad Rizki', nim_nip: 'NIM001', semester: 5, department: 'Teknik Informatika', email: 'ahmad@student.ac.id' },
  { id: '2', name: 'Dewi Lestari', nim_nip: 'NIM002', semester: 5, department: 'Teknik Informatika', email: 'dewi@student.ac.id' },
  { id: '3', name: 'Rudi Hartono', nim_nip: 'NIM003', semester: 3, department: 'Sistem Informasi', email: 'rudi@student.ac.id' },
  { id: '4', name: 'Sari Indah', nim_nip: 'NIM004', semester: 7, department: 'Teknik Informatika', email: 'sari@student.ac.id' },
  { id: '5', name: 'Budi Susanto', nim_nip: 'NIM005', semester: 5, department: 'Teknik Informatika', email: 'budis@student.ac.id' },
  { id: '6', name: 'Lina Marlina', nim_nip: 'NIM006', semester: 3, department: 'Teknik Komputer', email: 'lina@student.ac.id' },
];

export const mockKelas = [
  { 
    id: '1', 
    name: 'Pemrograman Web', 
    code: 'TIF301', 
    semester: 5, 
    dosenId: '1',
    dosenName: 'Dr. Budi Santoso',
    studentIds: ['1', '2', '5'],
    schedule: 'Senin, 08:00 - 10:00',
    room: 'Lab 301'
  },
  { 
    id: '2', 
    name: 'Basis Data', 
    code: 'TIF302', 
    semester: 5, 
    dosenId: '2',
    dosenName: 'Prof. Siti Rahayu',
    studentIds: ['1', '2', '4'],
    schedule: 'Selasa, 10:00 - 12:00',
    room: 'Lab 302'
  },
  { 
    id: '3', 
    name: 'Algoritma Lanjut', 
    code: 'TIF303', 
    semester: 7, 
    dosenId: '1',
    dosenName: 'Dr. Budi Santoso',
    studentIds: ['4'],
    schedule: 'Rabu, 13:00 - 15:00',
    room: 'Ruang 201'
  },
  { 
    id: '4', 
    name: 'Jaringan Komputer', 
    code: 'TIF304', 
    semester: 3, 
    dosenId: '3',
    dosenName: 'Dr. Andi Wijaya',
    studentIds: ['3', '6'],
    schedule: 'Kamis, 08:00 - 10:00',
    room: 'Lab 303'
  },
];

export const mockRatings = [
  {
    id: '1',
    fromId: '1',
    fromName: 'Ahmad Rizki',
    fromRole: 'mahasiswa',
    toId: '1',
    toName: 'Dr. Budi Santoso',
    toRole: 'dosen',
    kelasId: '1',
    kelasName: 'Pemrograman Web',
    ratings: {
      leadership: 5,
      teamwork: 4,
      attitude: 5,
    },
    comment: 'Dosen yang sangat baik dan inspiratif',
    date: '2024-01-15',
  },
  {
    id: '2',
    fromId: '1',
    fromName: 'Dr. Budi Santoso',
    fromRole: 'dosen',
    toId: '1',
    toName: 'Ahmad Rizki',
    toRole: 'mahasiswa',
    kelasId: '1',
    kelasName: 'Pemrograman Web',
    ratings: {
      creativity: 5,
      discipline: 4,
      collaboration: 5,
    },
    comment: 'Mahasiswa yang aktif dan kreatif',
    date: '2024-01-16',
  },
];

export const mockEnrollments = [
  { id: '1', studentId: '1', kelasId: '1', status: 'active', enrolledDate: '2024-01-01' },
  { id: '2', studentId: '2', kelasId: '1', status: 'active', enrolledDate: '2024-01-01' },
  { id: '3', studentId: '5', kelasId: '1', status: 'active', enrolledDate: '2024-01-01' },
  { id: '4', studentId: '1', kelasId: '2', status: 'active', enrolledDate: '2024-01-01' },
  { id: '5', studentId: '2', kelasId: '2', status: 'active', enrolledDate: '2024-01-01' },
  { id: '6', studentId: '4', kelasId: '2', status: 'active', enrolledDate: '2024-01-01' },
  { id: '7', studentId: '4', kelasId: '3', status: 'active', enrolledDate: '2024-01-01' },
  { id: '8', studentId: '3', kelasId: '4', status: 'active', enrolledDate: '2024-01-01' },
  { id: '9', studentId: '6', kelasId: '4', status: 'active', enrolledDate: '2024-01-01' },
];

export const getKelasForDosen = (dosenId: string) => {
  return mockKelas.filter(k => k.dosenId === dosenId);
};

export const getKelasForMahasiswa = (mahasiswaId: string) => {
  const enrollments = mockEnrollments.filter(e => e.studentId === mahasiswaId && e.status === 'active');
  return mockKelas.filter(k => enrollments.some(e => e.kelasId === k.id));
};

export const getStudentsInKelas = (kelasId: string) => {
  const kelas = mockKelas.find(k => k.id === kelasId);
  if (!kelas) return [];
  return mockMahasiswa.filter(m => kelas.studentIds.includes(m.id));
};

export const getDosenRatings = (dosenId: string) => {
  return mockRatings.filter(r => r.toId === dosenId && r.toRole === 'dosen');
};

export const getMahasiswaRatings = (mahasiswaId: string) => {
  return mockRatings.filter(r => r.toId === mahasiswaId && r.toRole === 'mahasiswa');
};
