import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, Star, Users, TrendingUp, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: Star,
      title: 'Rating Transparan',
      description: 'Sistem rating yang fair dan transparan untuk semua stakeholder',
    },
    {
      icon: Users,
      title: 'Multi-Role Access',
      description: 'Dashboard khusus untuk Dosen, Mahasiswa, dan Admin',
    },
    {
      icon: TrendingUp,
      title: 'Analytics Real-time',
      description: 'Laporan dan visualisasi data yang komprehensif',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-block p-4 bg-gradient-primary rounded-2xl mb-6"
            >
              <GraduationCap className="w-16 h-16 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl md:text-6xl font-bold text-foreground mb-6"
            >
              Bangun Transparansi
              <span className="text-primary block mt-2">Akademik Bersama</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Platform rating akademik yang membantu meningkatkan kualitas pendidikan melalui feedback yang konstruktif dan terukur
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex gap-4 justify-center"
            >
              <Link to="/login">
                <Button size="lg" className="gap-2 text-lg px-8 py-6">
                  Mulai Sekarang
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">Fitur Unggulan</h2>
            <p className="text-muted-foreground text-lg">
              Semua yang Anda butuhkan untuk sistem rating akademik yang efektif
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  whileHover={{ y: -10 }}
                  className="bg-card rounded-xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 border border-border"
                >
                  <div className="p-4 bg-primary/10 rounded-full w-fit mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-primary rounded-2xl p-12 text-center text-white shadow-strong"
          >
            <h2 className="text-4xl font-bold mb-4">Siap Memulai?</h2>
            <p className="text-xl mb-8 text-white/90">
              Bergabunglah dengan ribuan pengguna yang telah merasakan manfaatnya
            </p>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="gap-2 text-lg px-8 py-6">
                Login Sekarang
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
