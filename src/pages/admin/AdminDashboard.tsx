import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { 
  LayoutDashboard, 
  Package,
  BarChart3, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  Clock, 
  CreditCard, 
  Zap, 
  ShoppingBag, 
  TrendingUp,
  AlertCircle,
  Plus,
  Download,
  ChevronRight,
  FileText,
  UserPlus,
  Users,
  ShieldCheck,
  RefreshCcw,
  Activity
} from 'lucide-react';
import authService from '../../services/authService';
import reportService from '../../services/reportService';
import type { FinancialReportResponse } from '../../services/reportService';
import partService from '../../services/partService';
import type { PartResponse } from '../../services/partService';
import purchaseService from '../../services/purchaseService';

// Helper Components
const NavItem = ({ icon: Icon, label, active = false, delay = "", onClick }: { icon: FC<{ className?: string }>, label: string, active?: boolean, delay?: string, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl transition-all duration-150 ease-out group ${delay} ${active ? 'bg-neutral text-black font-black shadow-xl' : 'text-tertiary hover:text-neutral hover:bg-white/5'}`}
  >
    <Icon className={`w-5 h-5 transition-transform duration-150 ease-out ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
    <span className="text-sm tracking-tight">{label}</span>
  </button>
);

const HeaderIcon = ({ icon: Icon, badge = false, onClick }: { icon: FC<{ className?: string }>, badge?: boolean, onClick?: () => void }) => (
  <button onClick={onClick} className="relative w-11 h-11 flex items-center justify-center rounded-xl bg-secondary/10 hover:bg-primary hover:text-neutral transition-all group">
    <Icon className="w-5 h-5 group-active:scale-90 transition-transform" />
    {badge && <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>}
  </button>
);

const AdminStatCard = ({ label, value, decimal, trend, icon: Icon, delay = "", variant = 'white' }: { label: string, value: string, decimal?: string, trend: string, icon: FC<{ className?: string }>, delay?: string, variant?: 'white' | 'gray' | 'black' }) => (
  <div className={`rounded-3xl p-6 transition-all duration-100 hover:duration-200 ease-out hover:shadow-xl hover:-translate-y-1 ${delay} flex flex-col justify-between min-h-[190px] cursor-default ${
    variant === 'black' ? 'bg-black text-neutral' : 
    variant === 'gray' ? 'bg-[#D4D4D4] text-primary' : 
    'bg-white shadow-sm border border-secondary/10'
  }`}>
    <div className="flex justify-between items-start">
      <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${variant === 'black' ? 'text-neutral/40' : 'text-tertiary'}`}>{label}</p>
      <Icon className={`w-5 h-5 ${variant === 'black' ? 'text-neutral/40' : 'text-tertiary'}`} />
    </div>
    
    <div className="mt-4">
      <p className="text-4xl font-heading font-extrabold tracking-tighter leading-none">{value}</p>
      {decimal && <p className="text-2xl font-heading font-extrabold tracking-tighter opacity-50 mt-1">{decimal}</p>}
    </div>

    <div className={`mt-6 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase ${variant === 'black' ? 'text-neutral/30' : 'text-tertiary opacity-80'}`}>
       {trend.toLowerCase().includes('processing') || trend.toLowerCase().includes('critical') ? <Clock className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
       {trend}
    </div>
  </div>
);

const QuickActionItem = ({ icon: Icon, title, subtitle }: { icon: FC<{ className?: string }>, title: string, subtitle: string }) => (
  <div className="bg-white rounded-3xl p-6 border border-secondary/20 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-150 ease-out cursor-pointer group flex items-center justify-between">
    <div className="flex items-center gap-5">
      <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-neutral transition-all duration-200">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h5 className="text-base font-black tracking-tight">{title}</h5>
        <p className="text-[9px] font-black tracking-[0.2em] text-tertiary mt-1">{subtitle}</p>
      </div>
    </div>
    <ChevronRight className="w-5 h-5 text-tertiary group-hover:text-primary transition-colors" />
  </div>
);

const ActivityRow = ({ id, entity, sub, category, time, amount, status }: { id: string, entity: string, sub: string, category: string, time: string, amount: string, status: string }) => (
  <tr className="hover:bg-secondary/5 transition-colors cursor-default group">
    <td className="px-8 py-6 text-xs font-bold text-tertiary tracking-widest">{id}</td>
    <td className="px-8 py-6">
      <p className="text-sm font-black tracking-tight">{entity}</p>
      <p className="text-[10px] text-tertiary font-bold uppercase tracking-widest mt-1 opacity-60">{sub}</p>
    </td>
    <td className="px-8 py-6">
      <span className="px-3 py-1 bg-secondary/10 rounded text-[9px] font-black tracking-widest text-tertiary">{category}</span>
    </td>
    <td className="px-8 py-6 text-xs font-bold text-tertiary tracking-tighter opacity-70">{time}</td>
    <td className="px-8 py-6 text-sm font-black tracking-tight">{amount}</td>
    <td className="px-8 py-6">
      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest ${
        status === 'COMPLETED' ? 'bg-black text-neutral' : 
        status === 'PENDING' ? 'bg-secondary/20 text-tertiary' : 
        'bg-red-500 text-neutral'
      }`}>{status}</span>
    </td>
  </tr>
);

const AdminDashboard: FC = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [reportData, setReportData] = useState<FinancialReportResponse | null>(null);
  const [stockAlerts, setStockAlerts] = useState<number>(0);
  const [criticalItems, setCriticalItems] = useState<string>("All levels nominal");
  const [purchaseCost, setPurchaseCost] = useState<number>(0);
  const [pendingPurchasesCount, setPendingPurchasesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic system notifications & alerts
  const [showNotificationList, setShowNotificationList] = useState(false);
  const [lowStockList, setLowStockList] = useState<PartResponse[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch financial report for selected type
      const finReport = await reportService.getFinancialReport(reportType);
      setReportData(finReport);

      // Fetch parts for stock alerts
      const parts = await partService.getAll();
      const lowStockParts = parts.filter(p => p.stockQuantity < 10);
      setStockAlerts(lowStockParts.length);
      setLowStockList(lowStockParts);
      
      const lowStockNames = lowStockParts.slice(0, 2).map(p => p.name).join(", ");
      setCriticalItems(lowStockParts.length > 0 
        ? `Critical: ${lowStockNames}${lowStockParts.length > 2 ? ` +${lowStockParts.length - 2} more` : ""}` 
        : "All levels nominal"
      );

      // Fetch purchase invoices for purchase cost
      const purchases = await purchaseService.getAll();
      const totalCost = purchases.reduce((sum, p) => sum + p.finalTotal, 0);
      setPurchaseCost(totalCost);
      setPendingPurchasesCount(purchases.length);

    } catch (err: unknown) {
      console.error("Error fetching admin dashboard data:", err);
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = errorObj.response?.data?.message || errorObj.message || "Unknown error";
      setError(`Failed to fetch database records: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (loading && !reportData) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCcw className="w-12 h-12 text-primary animate-spin mx-auto text-black" />
          <p className="font-heading font-extrabold text-xl animate-pulse tracking-widest">CONNECTING TO ENGINECORE DATABASE...</p>
        </div>
      </div>
    );
  }

  if (error && !reportData) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-4xl border border-red-200 shadow-2xl max-w-lg text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto animate-bounce">
             <Activity className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-heading font-extrabold tracking-tighter">Database Offline</h2>
          <p className="text-primary/60 font-medium leading-relaxed">
            We're unable to retrieve dynamic telemetry. 
            Technical details: {error}
          </p>
          <button 
            onClick={fetchDashboardData}
            className="w-full bg-black text-neutral py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F4] flex text-primary font-body overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[280px] h-screen bg-[#1A1A1A] text-neutral flex flex-col shrink-0 z-20 shadow-2xl overflow-hidden sticky top-0">
        <div className="p-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-neutral rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-110 transition-transform cursor-pointer">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
               <Zap className="w-4 h-4 text-neutral fill-neutral" />
            </div>
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-xl leading-tight uppercase tracking-tighter">Enginecore</h1>
            <p className="text-[10px] text-tertiary uppercase tracking-[0.3em] font-bold opacity-70">V-Series Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-6 py-8 space-y-3">
          <NavItem icon={LayoutDashboard} label="Dashboard" active onClick={() => navigate('/admin-dashboard')} />
          <NavItem icon={Package} label="Inventory" onClick={() => navigate('/inventory')} />
          <NavItem icon={Users} label="Vendors" onClick={() => navigate('/vendors')} />
          <NavItem icon={ShieldCheck} label="Staff" onClick={() => navigate('/staff-management')} />
          <NavItem icon={FileText} label="Purchases" onClick={() => navigate('/purchases')} />
        </nav>

        <div className="px-6 py-8 border-t border-white/5 space-y-6">
          <button className="w-full bg-neutral text-black py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:shadow-[0_10px_20px_rgba(255,255,255,0.1)] hover:-translate-y-1 transition-all active:scale-95">
            New Part Request
          </button>
          
          <div className="space-y-2">
            <button className="flex items-center gap-4 px-4 py-3 w-full text-tertiary hover:text-neutral hover:bg-white/5 rounded-xl transition-all text-sm font-bold group text-left">
              <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform" /> Settings
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 px-4 py-3 w-full text-tertiary hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all text-sm font-bold group text-left"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative h-screen custom-scrollbar">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] -z-10 rounded-full opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 blur-[100px] -z-10 rounded-full opacity-20 pointer-events-none"></div>

        {/* Header */}
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-secondary/20 flex items-center justify-between px-10 shrink-0 z-10 sticky top-0">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search serial numbers, parts, or invoices..." 
                className="w-full bg-[#F5F5F3]/50 border-none rounded-2xl py-3.5 pl-14 pr-6 text-sm focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-tertiary font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-10">
            <nav className="flex items-center gap-10">
              <button className="text-[10px] font-black uppercase tracking-[0.25em] text-tertiary hover:text-primary transition-colors">Support</button>
            </nav>

            <div className="flex items-center gap-6 pl-10 border-l border-secondary/20">
              <div className="flex gap-2 relative">
                <HeaderIcon icon={Bell} badge={stockAlerts > 0} onClick={() => setShowNotificationList(!showNotificationList)} />
                <HeaderIcon icon={Settings} />

                {/* Dynamic System Notification List Dropdown */}
                {showNotificationList && (
                  <div className="absolute right-0 top-14 w-[380px] bg-white rounded-3xl border border-secondary/20 shadow-2xl p-6 z-50 animate-fade-in">
                    <h4 className="font-heading font-extrabold text-lg text-primary border-b border-secondary/20 pb-3 flex justify-between items-center">
                      <span>🔔 System Notifications</span>
                      {stockAlerts > 0 && (
                        <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">{stockAlerts} Alerts</span>
                      )}
                    </h4>

                    <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {stockAlerts === 0 ? (
                        <div className="py-6 text-center">
                          <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                            🟢 All inventory levels are nominal
                          </p>
                        </div>
                      ) : (
                        lowStockList.map((part) => (
                          <div key={part.id} className="p-3 bg-red-50 border border-red-100 rounded-2xl flex flex-col gap-1">
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-black text-red-950 uppercase tracking-tight leading-snug">{part.name}</span>
                              <span className="text-[10px] bg-red-200 text-red-950 px-2.5 py-0.5 rounded-lg font-mono font-bold shrink-0">Qty: {part.stockQuantity}</span>
                            </div>
                            <div className="flex justify-between items-center text-[9px] text-red-700 font-bold uppercase tracking-wider mt-1">
                              <span>SKU: {part.sku}</span>
                              <span>VEND: {part.vendorName}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <button 
                      onClick={() => {
                        setShowNotificationList(false);
                        navigate('/inventory');
                      }}
                      className="w-full mt-4 bg-black text-white text-[10px] font-black uppercase tracking-widest py-3.5 rounded-xl hover:bg-neutral transition-all text-center block"
                    >
                      Manage Inventory Ledger
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 ml-2 group cursor-pointer">
                <div className="text-right">
                  <p className="font-black text-sm leading-none">{user?.userName || 'Admin'}</p>
                  <p className="text-[10px] text-tertiary font-bold uppercase tracking-widest mt-1">{user?.roles?.[0] || 'Administrator'}</p>
                </div>
                <div className="w-11 h-11 rounded-2xl overflow-hidden ring-4 ring-secondary/10 group-hover:ring-primary/10 transition-all shadow-lg">
                  <img src={`https://ui-avatars.com/api/?name=${user?.userName || 'Admin'}&background=1a1a1a&color=fff&bold=true`} alt="User" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-10">
          <div className="max-w-[1500px] mx-auto space-y-10">
            
            {/* Page Title & Actions */}
            <div className="flex justify-between items-end animate-slide-up">
              <div>
                <h2 className="text-4xl font-heading font-extrabold tracking-tighter">Operations Dashboard</h2>
                <p className="text-base text-tertiary font-medium mt-1">Real-time telemetry and inventory metrics for V-Series components.</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Period Selector Toggle */}
                <div className="bg-white border border-secondary/20 p-1 rounded-2xl flex gap-1 shadow-sm">
                  {(['daily', 'monthly', 'yearly'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setReportType(type)}
                      className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        reportType === type 
                          ? 'bg-black text-white' 
                          : 'text-tertiary hover:bg-[#F5F5F3] hover:text-black'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-secondary/30 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral transition-all shadow-sm"
                >
                  <Download className="w-4 h-4" /> Export Data
                </button>
                <button 
                  onClick={() => navigate('/inventory')}
                  className="flex items-center gap-2 px-6 py-3 bg-black text-neutral rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" /> New Part
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 pb-4">
              <AdminStatCard 
                label={`${reportType} Sales`} 
                value={reportData ? reportData.totalSalesCount.toLocaleString() : "0"} 
                trend="From live database" 
                icon={ShoppingBag} 
              />
              <AdminStatCard 
                label={`${reportType} Revenue`} 
                value={`RS ${(reportData ? reportData.totalRevenue : 0).toLocaleString()}`} 
                decimal=".00" 
                trend="From sales invoices" 
                icon={CreditCard} 
              />
              <AdminStatCard 
                label={`${reportType} Est. Profit`} 
                value={`RS ${(reportData ? reportData.netProfit : 0).toLocaleString()}`} 
                decimal=".00"
                trend="40% profit margin" 
                icon={BarChart3} 
              />
              <AdminStatCard 
                label="Total Purchase Cost" 
                value={`RS ${purchaseCost.toLocaleString()}`} 
                decimal=".00"
                trend={`Based on ${pendingPurchasesCount} invoices`} 
                icon={FileText} 
                variant="gray" 
              />
              <AdminStatCard 
                label="Low Stock Alerts" 
                value={`${stockAlerts} Items`} 
                trend={criticalItems} 
                icon={AlertCircle} 
                variant="black" 
              />
            </div>

            {/* Middle Row */}
            <div className="grid grid-cols-12 gap-8">
              {/* Revenue vs Expense Chart Area */}
              <div className="col-span-12 lg:col-span-8 bg-white rounded-5xl border border-secondary/20 p-10 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-center mb-12">
                  <div>
                    <h3 className="text-2xl font-extrabold tracking-tight">Popular Parts Contribution</h3>
                    <p className="text-sm text-tertiary font-bold mt-1">Telemetry analysis of top-performing assets</p>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-black rounded-full"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-tertiary">Revenue Share</span>
                    </div>
                  </div>
                </div>
                
                {/* Visual Popular Parts Bar Chart */}
                <div className="h-[350px] w-full flex items-end justify-between px-4 pb-4">
                  {reportData && reportData.popularParts.length > 0 ? (
                    reportData.popularParts.slice(0, 6).map((part) => {
                      const maxRevenue = Math.max(...reportData.popularParts.map(p => p.revenueGenerated), 1);
                      const percent = Math.max(10, Math.min(100, (part.revenueGenerated / maxRevenue) * 100));
                      return (
                        <div key={part.partId} className="flex flex-col items-center gap-4 w-full">
                          <div className="w-16 flex items-end justify-center h-full relative group/bar">
                            {/* Hover info tooltip */}
                            <div className="absolute bottom-full mb-2 bg-black text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 shadow-lg">
                              Qty: {part.quantitySold} | RS {part.revenueGenerated.toLocaleString()}
                            </div>
                            <div 
                              className="w-8 bg-black rounded-t-lg transition-all duration-700 hover:bg-primary cursor-pointer" 
                              style={{ height: `${percent}%` }}
                            ></div>
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-tertiary text-center w-20 truncate" title={part.name}>
                            {part.name}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-tertiary font-bold uppercase tracking-widest text-xs">
                      No part sale statistics for this period
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="col-span-12 lg:col-span-4 space-y-8">
                <h4 className="text-sm font-black uppercase tracking-[0.3em] text-tertiary px-2">Quick Actions</h4>
                <div className="space-y-4">
                  <div onClick={() => navigate('/inventory')}>
                    <QuickActionItem icon={Plus} title="Add New Part" subtitle="UPDATE INVENTORY" />
                  </div>
                  <div onClick={() => navigate('/purchases')}>
                    <QuickActionItem icon={FileText} title="Create Purchase Invoice" subtitle="ACCOUNTS PAYABLE" />
                  </div>
                  <div onClick={() => navigate('/staff-management')}>
                    <QuickActionItem icon={UserPlus} title="Register Staff" subtitle="TEAM MANAGEMENT" />
                  </div>
                </div>
                
                <div className="bg-[#1A1A1A] rounded-4xl p-8 text-neutral relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform duration-200">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral/40 mb-10">Live Warehouse View</p>
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-bold tracking-widest">CAMERA FEED ACTIVE</span>
                    </div>
                  </div>
                  <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/5 to-transparent"></div>
                </div>
              </div>
            </div>

            {/* Bottom Row - Activity Log */}
            <div className="bg-white rounded-5xl border border-secondary/20 shadow-sm animate-slide-up delay-[800ms] overflow-hidden">
              <div className="p-8 border-b border-secondary/10 flex justify-between items-center">
                <h3 className="text-xl font-extrabold tracking-tight">Recent Activity Log</h3>
                <div className="flex gap-4">
                   <button className="text-[10px] font-black uppercase tracking-widest text-primary border-b-2 border-primary pb-1">All Activity</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary border-b border-secondary/10">
                      <th className="px-8 py-6">Transaction ID</th>
                      <th className="px-8 py-6">Entity / Description</th>
                      <th className="px-8 py-6">Category</th>
                      <th className="px-8 py-6">Timestamp</th>
                      <th className="px-8 py-6">Amount</th>
                      <th className="px-8 py-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary/10">
                    {reportData && reportData.transactions.length > 0 ? (
                      reportData.transactions.map((tx) => (
                        <ActivityRow 
                          key={tx.invoiceId}
                          id={`#${tx.invoiceNumber}`} 
                          entity={tx.customerName} 
                          sub={`INVOICE ID: ${tx.invoiceId}`} 
                          category="SPARE PARTS" 
                          time={new Date(tx.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })} 
                          amount={`RS ${tx.amount.toLocaleString()}.00`} 
                          status={tx.isPaid ? "COMPLETED" : "PENDING"} 
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-8 py-12 text-center text-tertiary font-bold uppercase tracking-widest text-xs">
                          No transactions found for this period in database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <button className="w-full py-6 bg-[#F9F9F9] text-tertiary text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all duration-150 ease-out">
                View Full Audit Trail
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
