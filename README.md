### 📚 EDURATE

## 🎯 OVERVIEW
**EduRate** adalah platform rating dan review untuk institusi pendidikan yang memungkinkan mahasiswa memberikan penilaian terhadap dosen dan mata kuliah.

---

## 🏗️ ARSITEKTUR SISTEM

### **BACKEND (Node.js + Express + MongoDB)**

#### **Tech Stack:**
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js v4.18.2
- **Database:** MongoDB dengan Mongoose v7.0.0
- **Authentication:** JWT (jsonwebtoken v9.0.0) + bcryptjs v2.4.3
- **Validation:** express-validator v7.0.0
- **Security:** CORS, express-rate-limit v6.7.0
- **Environment:** dotenv v16.0.3

#### **Struktur Folder Backend:**
```
backend/
├── config/
│   └── database.js          # Konfigurasi koneksi MongoDB
├── middlewares/
│   ├── auth.js              # Middleware autentikasi JWT
│   └── errorHandler.js      # Error handling middleware
├── models/                  # Database Models (Mongoose Schemas)
│   ├── User.js              # Model user (mahasiswa/dosen/admin)
│   ├── Teacher.js           # Model data dosen
│   ├── Course.js            # Model mata kuliah
│   ├── Institution.js       # Model institusi pendidikan
│   ├── Review.js            # Model review dosen
│   ├── StudentReview.js     # Model review mahasiswa
│   ├── AdminReview.js       # Model review admin
│   └── Enrollment.js        # Model enrollment mahasiswa ke kelas
├── routes/                  # API Routes
│   ├── auth.js              # Login, register, authentication
│   ├── users.js             # User management
│   ├── teachers.js          # Teacher CRUD operations
│   ├── courses.js           # Course CRUD operations
│   ├── institutions.js      # Institution management
│   ├── reviews.js           # Review management
│   ├── studentReviews.js    # Student review operations
│   ├── adminReviews.js      # Admin review operations
│   ├── enrollments.js       # Enrollment management
│   ├── admins.js            # Admin operations
│   └── stats.js             # Statistics & analytics
├── tools/                   # Utility scripts
│   ├── checkUser.js         # Check user data
│   ├── fixAdmin.js          # Fix admin accounts
│   ├── listUsers.js         # List all users
│   └── testLogin.js         # Test login functionality
├── index.js                 # Main server entry point
├── seed.js                  # Database seeding script
└── package.json
```

#### **API Endpoints:**
```
BASE URL: http://localhost:5000/api

Authentication:
- POST   /api/auth/register          # Register user baru
- POST   /api/auth/login             # Login user
- GET    /api/auth/me                # Get current user info

Users:
- GET    /api/users                  # Get all users (admin only)
- GET    /api/users/:id              # Get user by ID
- PUT    /api/users/:id              # Update user
- DELETE /api/users/:id              # Delete user (admin only)

Teachers:
- GET    /api/teachers               # Get all teachers
- GET    /api/teachers/:id           # Get teacher by ID
- POST   /api/teachers               # Create teacher (admin only)
- PUT    /api/teachers/:id           # Update teacher
- DELETE /api/teachers/:id           # Delete teacher (admin only)

Courses:
- GET    /api/courses                # Get all courses
- GET    /api/courses/:id            # Get course by ID
- POST   /api/courses                # Create course (admin/dosen)
- PUT    /api/courses/:id            # Update course
- DELETE /api/courses/:id            # Delete course (admin only)

Institutions:
- GET    /api/institutions           # Get all institutions
- GET    /api/institutions/:id       # Get institution by ID
- POST   /api/institutions           # Create institution (admin)
- PUT    /api/institutions/:id       # Update institution
- DELETE /api/institutions/:id       # Delete institution (admin)

Reviews:
- GET    /api/reviews                # Get all reviews
- GET    /api/reviews/teacher/:id    # Get reviews by teacher
- POST   /api/reviews                # Create review (mahasiswa)
- PUT    /api/reviews/:id            # Update review
- DELETE /api/reviews/:id            # Delete review

Student Reviews:
- GET    /api/student-reviews        # Get all student reviews
- POST   /api/student-reviews        # Create student review
- PUT    /api/student-reviews/:id    # Update student review
- DELETE /api/student-reviews/:id    # Delete student review

Admin Reviews:
- GET    /api/admin-reviews          # Get all admin reviews
- POST   /api/admin-reviews          # Create admin review (admin)
- PUT    /api/admin-reviews/:id      # Update admin review
- DELETE /api/admin-reviews/:id      # Delete admin review

Enrollments:
- GET    /api/enrollments            # Get all enrollments
- GET    /api/enrollments/user/:id   # Get enrollments by user
- POST   /api/enrollments            # Create enrollment
- DELETE /api/enrollments/:id        # Delete enrollment

Admins:
- GET    /api/admins                 # Get all admins
- POST   /api/admins                 # Create admin account

Stats:
- GET    /api/stats                  # Get platform statistics
- GET    /api/stats/teacher/:id      # Get teacher statistics
- GET    /api/stats/course/:id       # Get course statistics
```

---

### **FRONTEND (React + TypeScript + Vite)**

#### **Tech Stack:**
- **Framework:** React 18.3.1
- **Language:** TypeScript 5.8.3
- **Build Tool:** Vite 7.2.2
- **UI Library:** Shadcn/ui + Radix UI
- **Styling:** Tailwind CSS 3.4.17
- **Routing:** React Router DOM v6.30.1
- **State Management:** React Context API + TanStack Query v5.83.0
- **Forms:** React Hook Form v7.61.1 + Zod v3.25.76
- **Charts:** Chart.js v4.5.1 + Recharts v2.15.4
- **Animations:** Framer Motion v12.23.24
- **Icons:** Lucide React v0.462.0
- **Notifications:** Sonner v1.7.4

#### **Struktur Folder Frontend:**
```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/              # Static assets (images, fonts, etc)
│   ├── components/
│   │   ├── layout/          # Layout components (Header, Sidebar, etc)
│   │   └── ui/              # Shadcn UI components
│   ├── contexts/
│   │   └── AuthContext.tsx  # Authentication context
│   ├── data/                # Static data / mock data
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   ├── pages/               # Page components
│   │   ├── LandingPage.tsx          # Homepage
│   │   ├── LoginPage.tsx            # Login page
│   │   ├── DashboardDosen.tsx       # Dashboard untuk dosen
│   │   ├── DashboardMahasiswa.tsx   # Dashboard untuk mahasiswa
│   │   ├── DashboardAdmin.tsx       # Dashboard untuk admin
│   │   ├── RatingPage.tsx           # Halaman rating/review
│   │   ├── ProfilePage.tsx          # Halaman profil user
│   │   ├── KelaskuPage.tsx          # Halaman kelas user
│   │   ├── DosenPage.tsx            # Halaman daftar dosen
│   │   ├── UserManagement.tsx       # Manajemen user (admin)
│   │   ├── KelasManagement.tsx      # Manajemen kelas (admin/dosen)
│   │   ├── EnrollmentManagement.tsx # Manajemen enrollment (admin)
│   │   └── NotFound.tsx             # 404 page
│   ├── App.tsx              # Main App component
│   ├── App.css
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── components.json          # Shadcn UI config
├── tailwind.config.ts       # Tailwind configuration
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript config
└── package.json
```

#### **Fitur Utama Frontend:**

**1. Authentication & Authorization:**
- Login system dengan JWT
- Role-based access control (Mahasiswa, Dosen, Admin)
- Protected routes
- Context-based auth state management

**2. Dashboard per Role:**
- **Mahasiswa:** Lihat kelas, beri rating dosen, lihat jadwal
- **Dosen:** Lihat kelas yang diajar, lihat rating, kelola mata kuliah
- **Admin:** Kelola users, courses, enrollments, institutions

**3. Rating & Review System:**
- Mahasiswa bisa memberi rating ke dosen
- Rating berdasarkan berbagai kriteria
- Komentar dan feedback
- Admin dapat memoderasi review

**4. Management Features (Admin):**
- User Management: CRUD users
- Kelas Management: CRUD courses
- Enrollment Management: Assign mahasiswa ke kelas
- Institution Management: Kelola institusi

**5. UI/UX Features:**
- Responsive design (mobile-friendly)
- Dark mode support (next-themes)
- Toast notifications (Sonner)
- Form validation (React Hook Form + Zod)
- Data tables dengan sorting & filtering
- Charts & statistics visualization
- Smooth animations (Framer Motion)

---

## 🗄️ DATABASE MODELS

### **1. User Model:**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['mahasiswa', 'dosen', 'admin']),
  institution: ObjectId (ref: Institution),
  createdAt: Date,
  updatedAt: Date
}
```

### **2. Teacher Model:**
```javascript
{
  user: ObjectId (ref: User),
  name: String,
  department: String,
  institution: ObjectId (ref: Institution),
  bio: String,
  expertise: [String],
  averageRating: Number,
  totalReviews: Number,
  createdAt: Date
}
```

### **3. Course Model:**
```javascript
{
  name: String,
  code: String (unique),
  description: String,
  teacher: ObjectId (ref: Teacher),
  institution: ObjectId (ref: Institution),
  semester: String,
  credits: Number,
  schedule: {
    day: String,
    time: String,
    room: String
  },
  enrolledStudents: [ObjectId] (ref: User),
  createdAt: Date
}
```

### **4. Review Model:**
```javascript
{
  student: ObjectId (ref: User),
  teacher: ObjectId (ref: Teacher),
  course: ObjectId (ref: Course),
  rating: Number (1-5),
  comment: String,
  criteria: {
    teaching: Number,
    communication: Number,
    knowledge: Number,
    fairness: Number
  },
  isApproved: Boolean,
  createdAt: Date
}
```

### **5. Enrollment Model:**
```javascript
{
  student: ObjectId (ref: User),
  course: ObjectId (ref: Course),
  enrolledAt: Date,
  status: String (enum: ['active', 'completed', 'dropped']),
  grade: String
}
```

### **6. Institution Model:**
```javascript
{
  name: String,
  type: String (enum: ['university', 'college', 'school']),
  address: String,
  city: String,
  country: String,
  website: String,
  createdAt: Date
}
```

---

## 🚀 CARA SETUP & MENJALANKAN

### **Prerequisites:**
- Node.js v18+ 
- MongoDB (local atau MongoDB Atlas)
- npm atau pnpm

### **Setup Backend:**
```bash
cd backend

# Install dependencies
npm install

# Buat file .env
# Isi dengan:
# MONGODB_URI=mongodb://localhost:27017/edurate
# JWT_SECRET=your_secret_key_here
# PORT=5000

# (Optional) Seed database dengan data dummy
node seed.js

# Run development server
npm run dev
```

### **Setup Frontend:**
```bash
cd frontend

# Install dependencies
npm install
# atau
pnpm install

# Run development server
npm run dev
# atau
pnpm run dev

# Build for production
npm run build
```

---

## 👥 USER ROLES & PERMISSIONS

### **Mahasiswa:**
- ✅ Lihat daftar dosen
- ✅ Lihat detail dosen & rating
- ✅ Memberikan rating/review ke dosen
- ✅ Lihat kelas yang diambil
- ✅ Lihat profil sendiri
- ❌ Tidak bisa akses admin panel

### **Dosen:**
- ✅ Lihat kelas yang diajar
- ✅ Lihat rating yang diterima
- ✅ Kelola mata kuliah sendiri
- ✅ Lihat daftar mahasiswa di kelas
- ❌ Tidak bisa edit/delete user lain

### **Admin:**
- ✅ Full access ke semua fitur
- ✅ Kelola users (CRUD)
- ✅ Kelola courses (CRUD)
- ✅ Kelola enrollments
- ✅ Kelola institutions
- ✅ Moderasi reviews
- ✅ Lihat statistics platform

---

## 📊 FITUR UTAMA

1. **Authentication System** - JWT-based login/register
2. **Role-Based Access Control** - 3 roles dengan permissions berbeda
3. **Rating & Review System** - Multi-criteria rating untuk dosen
4. **Course Management** - Kelola mata kuliah & jadwal
5. **Enrollment System** - Assign mahasiswa ke kelas
6. **Institution Management** - Multi-institution support
7. **Statistics Dashboard** - Analytics & insights
8. **Responsive Design** - Mobile-friendly UI
9. **Real-time Notifications** - Toast notifications
10. **Form Validation** - Client & server-side validation

---

## 🔒 SECURITY FEATURES

- Password hashing dengan bcryptjs
- JWT token authentication
- Protected API routes dengan middleware
- Role-based authorization
- Input validation dengan express-validator
- Rate limiting untuk prevent abuse
- CORS configuration
- Environment variables untuk sensitive data

---

## 📝 CATATAN PENTING

1. **Environment Variables:** Pastikan setup .env file dengan benar di backend
2. **MongoDB Connection:** Gunakan MongoDB Atlas atau local MongoDB
3. **JWT Secret:** Gunakan secret key yang kuat untuk production
4. **CORS:** Sesuaikan CORS settings untuk production deployment
5. **Port Configuration:** Default backend port 5000, frontend port 5173 (Vite)

---
