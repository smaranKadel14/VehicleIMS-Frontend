import { type FC } from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  trend?: string;
  trendColor?: 'success' | 'danger' | 'neutral';
  icon: LucideIcon;
  dark?: boolean;
  onClick?: () => void;
  
  // Custom slots for balance widgets
  invoiceInfo?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export const MetricCard: FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  trend,
  trendColor = 'neutral',
  icon: Icon,
  dark = false,
  onClick,
  invoiceInfo,
  buttonText,
  onButtonClick,
}) => {
  const getTrendColor = () => {
    if (trendColor === 'success') return '#10B981';
    if (trendColor === 'danger') return '#EF4444';
    return '#6B7280';
  };

  return (
    <div 
      onClick={onClick}
      style={{
        background: dark ? '#1A1A1A' : '#FFFFFF',
        color: dark ? '#F9FAFB' : '#111827',
        border: dark ? '1px solid #000000' : '1px solid #E5E7EB',
        borderLeft: !dark ? '4px solid #111827' : '1px solid #000000',
        borderRadius: 16,
        padding: '20px 24px',
        boxShadow: dark ? '0 10px 30px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      className="group hover:scale-[1.02]"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: dark ? 'rgba(255,255,255,0.1)' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon className="w-5 h-5" style={{ color: dark ? '#F9FAFB' : '#111827' }} />
        </div>
      </div>

      <div>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: dark ? 'rgba(255,255,255,0.5)' : '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {title}
        </p>
        {invoiceInfo && (
          <p style={{ margin: '4px 0 0 0', fontSize: 10, color: dark ? 'rgba(255,255,255,0.3)' : '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 900 }}>
            {invoiceInfo}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 12 }}>
          <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>
            {value}
          </span>
          {trend && (
            <span style={{ fontSize: 12, fontWeight: 700, color: getTrendColor() }}>
              {trend}
            </span>
          )}
        </div>
        {subtext && (
          <p style={{ margin: '8px 0 0 0', fontSize: 12, color: dark ? 'rgba(255,255,255,0.4)' : '#9CA3AF' }}>
            {subtext}
          </p>
        )}
      </div>

      {buttonText && onButtonClick && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onButtonClick();
          }}
          style={{
            width: '100%',
            background: dark ? '#FFFFFF' : '#111827',
            color: dark ? '#000000' : '#FFFFFF',
            padding: '10px 0',
            borderRadius: 12,
            fontWeight: 800,
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            border: 'none',
            marginTop: 20,
            cursor: 'pointer',
            transition: 'background 0.15s'
          }}
          className="hover:opacity-90 active:scale-95"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};
