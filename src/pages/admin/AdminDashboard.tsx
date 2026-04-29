import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { FC } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Wrench, 
  Truck, 
  BarChart3, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  Clock, 
  CreditCard, 
  Zap, 
  ShoppingBag, 
  Activity, 
  TrendingUp,
  AlertCircle,
  Plus,
  Download,
  MoreVertical,
  ChevronRight,
  FileText,
  UserPlus,
  Shield,
  Info
} from 'lucide-react';
import authService from '../../services/authService';

// Helper Components
const NavItem = ({ icon: Icon, label, active = false, delay = "" }: { icon: any, label: string, active?: boolean, delay?: string }) => (
  <button className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl transition-all duration-150 ease-out group animate-slide-up ${delay} ${active ? 'bg-neutral text-black font-black shadow-xl' : 'text-tertiary hover:text-neutral hover:bg-white/5'}`}>
    <Icon className={`w-5 h-5 transition-transform duration-150 ease-out ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
    <span className="text-sm tracking-tight">{label}</span>
  </button>
);

const HeaderIcon = ({ icon: Icon, badge = false }: { icon: any, badge?: boolean }) => (
  <button className="relative w-11 h-11 flex items-center justify-center rounded-xl bg-secondary/10 hover:bg-primary hover:text-neutral transition-all group">
    <Icon className="w-5 h-5 group-active:scale-90 transition-transform" />
    {badge && <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>}
  </button>
);

const AdminStatCard = ({ label, value, decimal, trend, icon: Icon, delay = "", variant = 'white' }: { label: string, value: string, decimal?: string, trend: string, icon: any, delay?: string, variant?: 'white' | 'gray' | 'black' }) => (
  <div className={`rounded-3xl p-8 transition-all duration-100 hover:duration-200 ease-out hover:shadow-xl hover:-translate-y-1 animate-slide-up ${delay} flex flex-col justify-between min-h-[220px] cursor-default ${
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

const QuickActionItem = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle: string }) => (
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

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };
  return (
    <div className="min-h-screen bg-[#F4F4F4] flex text-primary font-body overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[280px] h-screen bg-[#1A1A1A] text-neutral flex flex-col shrink-0 z-20 shadow-2xl animate-fade-in overflow-hidden sticky top-0">
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
          <NavItem icon={LayoutDashboard} label="Dashboard" active delay="delay-[100ms]" />
          <NavItem icon={Package} label="Inventory" delay="delay-[200ms]" />
          <NavItem icon={Wrench} label="Work Orders" delay="delay-[300ms]" />
          <NavItem icon={Truck} label="Logistics" delay="delay-[400ms]" />
          <NavItem icon={BarChart3} label="Analytics" delay="delay-[500ms]" />
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
              <div className="flex gap-2">
                <HeaderIcon icon={Bell} badge />
                <HeaderIcon icon={Settings} />
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
              <div className="flex gap-4">
                <button className="flex items-center gap-2 px-6 py-3 bg-white border border-secondary/30 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral transition-all shadow-sm">
                  <Download className="w-4 h-4" /> Export Data
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-black text-neutral rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95">
                  <Plus className="w-4 h-4" /> New Part
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex flex-row gap-6 pb-4 overflow-x-auto no-scrollbar">
              <div className="min-w-[240px] flex-1">
                <AdminStatCard label="Total Sales" value="1,284" trend="+12.5% vs last month" icon={ShoppingBag} delay="delay-[100ms]" />
              </div>
              <div className="min-w-[240px] flex-1">
                <AdminStatCard label="Monthly Revenue" value="$42,902" decimal=".00" trend="+8.2% vs last month" icon={CreditCard} delay="delay-[200ms]" />
              </div>
              <div className="min-w-[240px] flex-1">
                <AdminStatCard label="Yearly Revenue" value="$512.4k" trend="+15% annual projection" icon={BarChart3} delay="delay-[300ms]" />
              </div>
              <div className="min-w-[240px] flex-1">
                <AdminStatCard label="Purchase Cost" value="$12,450.00" trend="Processing 4 pending invoices" icon={FileText} delay="delay-[400ms]" variant="gray" />
              </div>
              <div className="min-w-[240px] flex-1">
                <AdminStatCard label="Stock Alerts" value="18 Items" trend="Critical levels: Brake Pads, V8 Seals" icon={AlertCircle} delay="delay-[500ms]" variant="black" />
              </div>
            </div>

            {/* Middle Row */}
            <div className="grid grid-cols-12 gap-8">
              {/* Revenue vs Expense Chart Area */}
              <div className="col-span-12 lg:col-span-8 bg-white rounded-5xl border border-secondary/20 p-10 shadow-sm animate-slide-up delay-[600ms] relative overflow-hidden group">
                <div className="flex justify-between items-center mb-12">
                  <div>
                    <h3 className="text-2xl font-extrabold tracking-tight">Revenue vs Expense</h3>
                    <p className="text-sm text-tertiary font-bold mt-1">FY 2024 Performance Analysis</p>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-black rounded-full"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-tertiary">Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-secondary/30 rounded-full"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-tertiary">Expense</span>
                    </div>
                  </div>
                </div>
                
                {/* Visual Placeholder for Chart */}
                <div className="h-[350px] w-full flex items-end justify-between px-4 pb-4">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => (
                    <div key={month} className="flex flex-col items-center gap-4 w-full">
                      <div className="w-16 flex items-end gap-1.5 h-full relative group/bar">
                        <div 
                          className="w-full bg-black rounded-t-lg transition-all duration-700 delay-300 group-hover/bar:bg-primary" 
                          style={{ height: `${[40, 65, 45, 85, 55, 75][i]}%` }}
                        ></div>
                        <div 
                          className="w-full bg-secondary/20 rounded-t-lg transition-all duration-700 delay-500" 
                          style={{ height: `${[25, 35, 30, 45, 20, 40][i]}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-tertiary">{month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="col-span-12 lg:col-span-4 space-y-8 animate-slide-up delay-[700ms]">
                <h4 className="text-sm font-black uppercase tracking-[0.3em] text-tertiary px-2">Quick Actions</h4>
                <div className="space-y-4">
                  <QuickActionItem icon={Plus} title="Add New Part" subtitle="UPDATE INVENTORY" />
                  <QuickActionItem icon={FileText} title="Create Purchase Invoice" subtitle="ACCOUNTS PAYABLE" />
                  <QuickActionItem icon={UserPlus} title="Register Staff" subtitle="TEAM MANAGEMENT" />
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
                   <button className="text-[10px] font-black uppercase tracking-widest text-tertiary hover:text-primary transition-colors pb-1">Sales</button>
                   <button className="text-[10px] font-black uppercase tracking-widest text-tertiary hover:text-primary transition-colors pb-1">Purchases</button>
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
                    <ActivityRow id="#TRX-88219" entity="V8 Cylinder Gasket Set" sub="CLIENT: APEX RACING INTL" category="PERFORMANCE" time="Today, 02:14 PM" amount="$1,420.00" status="COMPLETED" />
                    <ActivityRow id="#TRX-88218" entity="Bulk Order: Synthetic Oil 5W-30" sub="VENDOR: PETROGLOBAL SUPPLIERS" category="MAINTENANCE" time="Today, 11:05 AM" amount="$8,900.00" status="PENDING" />
                    <ActivityRow id="#TRX-88217" entity="Carbon Fiber Spoiler Kit" sub="CLIENT: PRIVATE COLLECTOR" category="BODYWORK" time="Yesterday, 04:45 PM" amount="$2,100.00" status="COMPLETED" />
                    <ActivityRow id="#TRX-88216" entity="Heavy Duty Brake Pads (Front)" sub="CLIENT: FLEET RENTAL GROUP" category="BRAKING" time="Yesterday, 09:20 AM" amount="$450.00" status="FLAGGED" />
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
