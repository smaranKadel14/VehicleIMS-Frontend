import { type FC, type ReactNode } from 'react';
import { Bell, Settings } from 'lucide-react';

interface TopbarProps {
  // Search Configuration
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  
  // Custom slots
  searchSlot?: ReactNode;
  rightActionSlot?: ReactNode;

  // Notification Configuration
  notificationBadgeCount?: number;
  onNotificationClick?: () => void;

  // Navigation callbacks
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
  onProfileClick?: () => void;
  onSupportClick?: () => void;

  // Identity
  userName: string;
  userRole?: string;
}

export const Topbar: FC<TopbarProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search serial numbers, parts, or invoices...",
  searchSlot,
  rightActionSlot,
  notificationBadgeCount = 0,
  onNotificationClick,
  onSettingsClick,
  onProfileClick,
  onSupportClick,
  userName,
  userRole = "Member",
}) => {
  return (
    <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-secondary/20 flex items-center justify-between px-10 shrink-0 z-10 sticky top-0">
      
      {/* Left Area: Search Input (using Admin UI search bar styling) */}
      <div className="flex-1 max-w-xl">
        {searchSlot ? (
          searchSlot
        ) : onSearchChange ? (
          <div className="relative group">
            <svg 
              className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary group-focus-within:text-primary transition-colors" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-[#F5F5F3]/50 border-none rounded-2xl py-3.5 pl-14 pr-6 text-sm focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-tertiary font-medium"
            />
          </div>
        ) : null}
      </div>

      {/* Right Area: Actions, Badges & Profile Card */}
      <div className="flex items-center gap-10">
        
        {/* Support Button */}
        <nav className="flex items-center gap-10">
          <button 
            onClick={onSupportClick}
            className="text-[10px] font-black uppercase tracking-[0.25em] text-tertiary hover:text-primary transition-colors"
          >
            Support
          </button>
        </nav>

        {/* Action icons and User chip */}
        <div className="flex items-center gap-6 pl-10 border-l border-secondary/20">
          <div className="flex gap-2 relative">
            {rightActionSlot}

            {onNotificationClick && (
              <button 
                onClick={onNotificationClick} 
                className="relative w-11 h-11 flex items-center justify-center rounded-xl bg-secondary/10 hover:bg-primary hover:text-neutral transition-all group"
              >
                <Bell className="w-5 h-5 group-active:scale-90 transition-transform" />
                {notificationBadgeCount > 0 && (
                  <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>
                )}
              </button>
            )}

            {onSettingsClick && (
              <button 
                onClick={onSettingsClick} 
                className="relative w-11 h-11 flex items-center justify-center rounded-xl bg-secondary/10 hover:bg-primary hover:text-neutral transition-all group"
              >
                <Settings className="w-5 h-5 group-active:scale-90 transition-transform" />
              </button>
            )}
          </div>

          {/* User profile identifier */}
          <div 
            onClick={onProfileClick}
            className="flex items-center gap-4 ml-2 group cursor-pointer"
          >
            <div className="text-right">
              <p className="font-black text-sm leading-none">{userName}</p>
              {userRole && (
                <p className="text-[10px] text-tertiary font-bold uppercase tracking-widest mt-1">{userRole.toUpperCase()}</p>
              )}
            </div>
            <div className="w-11 h-11 rounded-2xl overflow-hidden ring-4 ring-secondary/10 group-hover:ring-primary/10 transition-all shadow-lg">
              <img 
                src={`https://ui-avatars.com/api/?name=${userName}&background=1a1a1a&color=fff&bold=true`} 
                alt="User avatar" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </div>

      </div>

    </header>
  );
};
