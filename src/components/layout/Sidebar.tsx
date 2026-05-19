import { type FC } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface SidebarNavItem {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}

export interface SidebarFooterItem {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

interface SidebarProps {
  logoTitle: string;
  logoSubtitle?: string;
  logoIcon: LucideIcon;
  items: SidebarNavItem[];
  footerItems?: SidebarFooterItem[];
  handleLogout?: () => void;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export const Sidebar: FC<SidebarProps> = ({
  logoTitle,
  logoSubtitle,
  logoIcon: LogoIcon,
  items,
  footerItems = [],
  handleLogout,
  actionButton,
}) => {
  return (
    <aside className="w-[280px] h-screen bg-[#1A1A1A] text-neutral flex flex-col shrink-0 z-20 shadow-2xl overflow-hidden sticky top-0">
      
      {/* Sidebar Brand Header */}
      <div className="p-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-neutral rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-110 transition-transform cursor-pointer">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
             <LogoIcon className="w-4 h-4 text-neutral fill-neutral" />
          </div>
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-xl leading-tight uppercase tracking-tighter text-white">{logoTitle}</h1>
          {logoSubtitle && (
            <p className="text-[10px] text-tertiary uppercase tracking-[0.3em] font-bold opacity-70">{logoSubtitle}</p>
          )}
        </div>
      </div>

      {/* Main Navigation Items */}
      <nav className="flex-1 px-6 py-8 space-y-3">
        {items.map(({ icon: Icon, label, active, onClick }) => (
          <button 
            key={label}
            onClick={onClick}
            className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl transition-all duration-150 ease-out group ${
              active 
                ? 'bg-neutral text-black font-black shadow-xl' 
                : 'text-tertiary hover:text-neutral hover:bg-white/5'
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform duration-150 ease-out ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="text-sm tracking-tight">{label}</span>
          </button>
        ))}
      </nav>

      {/* Sidebar Footer Area */}
      <div className="px-6 py-8 border-t border-white/5 space-y-6">
        
        {/* Context Action Button (e.g. "NEW PART REQUEST") */}
        {actionButton && (
          <button 
            onClick={actionButton.onClick}
            className="w-full bg-neutral text-black py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:shadow-[0_10px_20px_rgba(255,255,255,0.1)] hover:-translate-y-1 transition-all active:scale-95"
          >
            {actionButton.label}
          </button>
        )}

        {/* Footer Navigation Items */}
        <div className="space-y-2">
          {footerItems.map(({ icon: Icon, label, onClick }) => (
            <button 
              key={label}
              onClick={onClick}
              className="flex items-center gap-4 px-4 py-3 w-full text-tertiary hover:text-neutral hover:bg-white/5 rounded-xl transition-all text-sm font-bold group text-left"
            >
              <Icon className="w-4 h-4 group-hover:rotate-45 transition-transform" /> {label}
            </button>
          ))}

          {handleLogout && (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 px-4 py-3 w-full text-tertiary hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all text-sm font-bold group text-left"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              Sign Out
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
