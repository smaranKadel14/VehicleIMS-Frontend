import { type FC, type ComponentType } from 'react';
import { Clock, TrendingUp } from 'lucide-react';

interface AdminStatCardProps {
  label: string;
  value: string;
  decimal?: string;
  trend: string;
  icon: ComponentType<{ className?: string }>;
  delay?: string;
  variant?: 'white' | 'gray' | 'black';
}

export const AdminStatCard: FC<AdminStatCardProps> = ({
  label,
  value,
  decimal,
  trend,
  icon: Icon,
  delay = '',
  variant = 'white',
}) => {
  const isTimeTrend = trend.toLowerCase().includes('processing') || 
                      trend.toLowerCase().includes('critical') || 
                      trend.toLowerCase().includes('has phone');

  return (
    <div
      className={`rounded-3xl p-6 transition-all duration-200 ease-out hover:shadow-xl hover:-translate-y-1 ${delay} flex flex-col justify-between min-h-[170px] cursor-default ${
        variant === 'black'
          ? 'bg-black text-neutral'
          : variant === 'gray'
          ? 'bg-[#D4D4D4] text-primary'
          : 'bg-white shadow-sm border border-secondary/10'
      }`}
    >
      <div className="flex justify-between items-start">
        <p
          className={`text-[10px] font-black uppercase tracking-[0.2em] ${
            variant === 'black' ? 'text-neutral/40' : 'text-tertiary'
          }`}
        >
          {label}
        </p>
        <Icon className={`w-5 h-5 ${variant === 'black' ? 'text-neutral/40' : 'text-tertiary'}`} />
      </div>

      <div className="mt-4">
        <p className="text-3xl font-heading font-extrabold tracking-tighter leading-none">
          {value}
        </p>
        {decimal && (
          <p className="text-xl font-heading font-extrabold tracking-tighter opacity-50 mt-1">
            {decimal}
          </p>
        )}
      </div>

      <div
        className={`mt-4 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase ${
          variant === 'black' ? 'text-neutral/30' : 'text-tertiary opacity-80'
        }`}
      >
        {isTimeTrend ? <Clock className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
        {trend}
      </div>
    </div>
  );
};
