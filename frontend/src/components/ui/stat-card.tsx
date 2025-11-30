import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: string;
  delay?: number;
}

export const StatCard = ({ title, value, icon: Icon, trend, color = 'primary', delay = 0 }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-card rounded-xl p-6 shadow-soft border border-border hover:shadow-medium transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-foreground">{value}</h3>
          {trend && (
            <p className={`text-sm mt-2 ${trend.includes('+') ? 'text-primary' : 'text-destructive'}`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-full bg-${color}/10`}>
          <Icon className={`w-8 h-8 text-${color}`} />
        </div>
      </div>
    </motion.div>
  );
};
