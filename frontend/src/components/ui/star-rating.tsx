import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StarRating = ({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) => {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex gap-1">
      {stars.map((star) => {
        const isFilled = (hoverValue || value) >= star;
        return (
          <motion.button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHoverValue(star)}
            onMouseLeave={() => !readonly && setHoverValue(0)}
            whileHover={!readonly ? { scale: 1.2 } : {}}
            whileTap={!readonly ? { scale: 0.9 } : {}}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled ? 'fill-primary text-primary' : 'text-muted-foreground'
              } transition-colors duration-200`}
            />
          </motion.button>
        );
      })}
    </div>
  );
};
