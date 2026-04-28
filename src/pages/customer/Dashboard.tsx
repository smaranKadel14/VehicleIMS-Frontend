import React from 'react';
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
  Calendar, 
  ShoppingBag, 
  Fuel, 
  Activity, 
  Gauge,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  MoreVertical,
  ArrowUpRight,
  MapPin
} from 'lucide-react';
import truckImg from '../../assets/customer-img/GT.png';

const CustomerDashboard: React.FC = () => {
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
            <button className="flex items-center gap-4 px-4 py-3 w-full text-tertiary hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all text-sm font-bold group text-left">
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
                placeholder="Search components, parts, or VIN..." 
                className="w-full bg-[#F5F5F3]/50 border-none rounded-2xl py-3.5 pl-14 pr-6 text-sm focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-tertiary font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-10">
            <nav className="flex items-center gap-10">
              <NavLink label="Dashboard" active />
              <NavLink label="Services" />
              <NavLink label="History" />
              <NavLink label="Support" />
            </nav>

            <div className="flex items-center gap-6 pl-10 border-l border-secondary/20">
              <div className="flex gap-2">
                <HeaderIcon icon={Bell} badge />
                <HeaderIcon icon={Settings} />
              </div>
              <div className="flex items-center gap-4 ml-2 group cursor-pointer">
                <div className="text-right">
                  <p className="font-black text-sm leading-none">Marcus Sterling</p>
                  <p className="text-[10px] text-tertiary font-bold uppercase tracking-widest mt-1">Senior Lead</p>
                </div>
                <div className="w-11 h-11 rounded-2xl overflow-hidden ring-4 ring-secondary/10 group-hover:ring-primary/10 transition-all shadow-lg">
                  <img src="https://ui-avatars.com/api/?name=Marcus+Sterling&background=1a1a1a&color=fff&bold=true" alt="User" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-10">
          <div className="max-w-[1500px] mx-auto space-y-10">
            
            {/* Top Row */}
            <div className="grid grid-cols-12 gap-8">
              {/* Welcome Banner */}
              <div className="col-span-12 lg:col-span-6 bg-white rounded-4xl p-10 relative overflow-hidden flex flex-col justify-between border border-secondary/20 shadow-sm animate-slide-up group">
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 bg-primary/5 text-[10px] font-black text-primary uppercase tracking-[0.2em] rounded-full mb-4">Personal Portal</span>
                  <h2 className="text-5xl font-heading font-extrabold mb-4 tracking-tighter">Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-primary/60">Marcus.</span></h2>
                  <p className="text-primary/60 text-base max-w-md leading-relaxed font-medium">
                    Your V-Series GT is currently in peak performance. All systems report nominal status for the upcoming season.
                  </p>
                </div>
                <div className="flex gap-4 relative z-10">
                  <button className="bg-black text-neutral px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95">
                    Schedule Checkup
                  </button>
                  <button className="bg-[#F5F5F3] text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#EDEDED] transition-all active:scale-95">
                    View Fleet
                  </button>
                </div>
                {/* Visual Flair */}
                <div className="absolute right-0 top-0 h-full w-full pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity">
                   <div className="absolute top-10 right-10 w-64 h-64 bg-primary/5 rounded-full blur-[80px]"></div>
                   <div className="absolute -bottom-10 right-20 w-48 h-48 bg-secondary/20 rounded-full blur-[60px]"></div>
                </div>
              </div>

              {/* Pending Balance */}
              <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-[#1A1A1A] text-neutral rounded-4xl p-8 flex flex-col justify-between border border-black shadow-2xl animate-slide-up delay-[100ms] group hover:scale-[1.02] transition-transform">
                <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:rotate-12 transition-transform">
                  <CreditCard className="w-6 h-6 text-neutral" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral/50 mb-1">Pending Balance</p>
                  <p className="text-[10px] text-neutral/30 uppercase tracking-[0.2em] font-black mb-3">Invoice: #INV-9021</p>
                  <p className="text-4xl font-heading font-extrabold tracking-tighter">$482.<span className="text-2xl opacity-50">50</span></p>
                </div>
                <button className="w-full bg-neutral text-black py-3.5 rounded-xl font-black text-xs uppercase tracking-widest mt-8 hover:bg-neutral/90 transition-all active:scale-95 shadow-xl">
                  Pay Balance
                </button>
              </div>

              {/* Service Recommendation */}
              <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-white rounded-4xl p-8 border border-secondary/20 shadow-sm flex flex-col justify-between animate-slide-up delay-[200ms] hover:border-primary/20 transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-lg shadow-black/20">
                      <Zap className="w-4 h-4 text-neutral fill-neutral" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/40">Enginecore AI</span>
                  </div>
                  <h3 className="text-xl font-extrabold mb-3 tracking-tight leading-tight">Brake Pad Inspection Required</h3>
                  <p className="text-sm text-primary/60 leading-relaxed font-medium">
                    Based on your recent 1,200km long-distance trip, we suggest a brake pad inspection within the next <span className="text-primary font-bold underline decoration-secondary">45 days</span>.
                  </p>
                </div>
                <button className="text-primary text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all mt-6 group">
                  Detailed Analysis <ArrowUpRight className="w-4 h-4 text-tertiary group-hover:text-primary transition-colors" />
                </button>
              </div>
            </div>

            {/* Middle Row */}
            <div className="grid grid-cols-12 gap-8">
              {/* Active Vehicles Section */}
              <div className="col-span-12 lg:col-span-8 space-y-8 animate-slide-up delay-[300ms]">
                <div className="flex justify-between items-end px-2">
                  <div>
                    <h3 className="text-3xl font-heading font-extrabold tracking-tighter">Active Vehicles</h3>
                    <p className="text-base text-tertiary font-medium">Real-time status of your registered assets.</p>
                  </div>
                  <button className="px-5 py-2.5 bg-white border border-secondary/30 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white hover:border-black transition-all shadow-sm">
                    Manage All
                  </button>
                </div>

                <div className="bg-white rounded-5xl overflow-hidden border border-secondary/20 shadow-sm group hover:shadow-2xl transition-all duration-150 ease-out">
                  <div className="relative h-[400px] bg-[#F9F9F9] overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-secondary/5 to-transparent pointer-events-none"></div>
                    
                    <img src={truckImg} alt="2023 V-Series GT" className="w-full h-full object-contain p-12 drop-shadow-2xl group-hover:scale-105 transition-transform duration-700" />
                    
                    <div className="absolute top-10 right-10 flex items-center gap-3 bg-white/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-white shadow-xl animate-fade-in">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                      <span className="text-[11px] font-black uppercase tracking-[0.15em] text-primary">In Operation</span>
                    </div>

                    <div className="absolute bottom-10 left-12">
                      <div className="inline-block px-3 py-1 bg-black text-neutral text-[9px] font-black uppercase tracking-widest rounded mb-3">Priority Asset</div>
                      <h4 className="text-4xl font-heading font-extrabold text-black tracking-tighter">2023 V-Series GT</h4>
                      <p className="text-xs font-bold text-tertiary tracking-[0.25em] uppercase mt-2 opacity-80">VIN: 1HGCM8263JA...441</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 border-t border-secondary/10 bg-white">
                    <TelemetryStat label="Engine Health" value="98% Nominal" icon={Activity} color="text-green-500" />
                    <TelemetryStat label="Tire Pressure" value="32 / 32 / 31 / 32" icon={Gauge} />
                    <TelemetryStat label="Odometer" value="14,202 KM" icon={Clock} />
                  </div>

                  <button className="w-full py-5 bg-[#F9F9F9] text-tertiary text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-black hover:text-white transition-all duration-150 ease-out border-t border-secondary/10">
                    <BarChart3 className="w-4 h-4" /> View Full Telemetry Data
                  </button>
                </div>
              </div>

              {/* Right Side Panel */}
              <div className="col-span-12 lg:col-span-4 space-y-10">
                {/* Appointments */}
                <section className="animate-slide-up delay-[400ms]">
                  <div className="flex justify-between items-center mb-6 px-2">
                    <h4 className="text-sm font-black uppercase tracking-[0.3em] text-tertiary">Appointments</h4>
                    <span className="bg-secondary/20 text-primary text-xs font-black px-3 py-1 rounded-lg">02</span>
                  </div>
                  <div className="space-y-4">
                    <AppointmentItem 
                      title="Oil & Filter Exchange" 
                      location="Mainland Service Center A1" 
                      date="Oct 24" 
                      time="09:00 AM"
                      active
                    />
                    <AppointmentItem 
                      title="Annual Inspection" 
                      location="Pending Confirmation" 
                      date="Nov 12" 
                      time=""
                    />
                  </div>
                </section>

                {/* Recent Purchases */}
                <section className="animate-slide-up delay-[500ms]">
                  <div className="flex justify-between items-center mb-6 px-2">
                    <h4 className="text-sm font-black uppercase tracking-[0.3em] text-tertiary">Recent Purchases</h4>
                  </div>
                  <div className="bg-white rounded-4xl border border-secondary/20 shadow-sm overflow-hidden group">
                    <div className="divide-y divide-secondary/10">
                      <PurchaseItem 
                        title="V-Carbon Intake Filter" 
                        id="#3392" 
                        date="Yesterday" 
                        price="$129.00" 
                        icon={Activity}
                      />
                      <PurchaseItem 
                        title="Synthetic Lube X-Series" 
                        id="#3381" 
                        date="Oct 12" 
                        price="$45.50" 
                        icon={Clock}
                      />
                    </div>
                    <button className="w-full py-6 bg-secondary/10 text-tertiary text-xs font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all duration-150 ease-out">
                      Full Transaction History
                    </button>
                  </div>
                </section>
              </div>
            </div>

            {/* Bottom Row - 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8">
              <StatCard 
                label="Fuel Economy" 
                value="8.4 L/100" 
                trend="2.1% FROM LAST MONTH" 
                trendUp={false}
                icon={Fuel}
                delay="delay-[600ms]"
              />
              <StatCard 
                label="Total Maintenance" 
                value="$2,410" 
                trend="SINCE REGISTRATION" 
                icon={Wrench}
                delay="delay-[700ms]"
              />
              <StatCard 
                label="Next Service" 
                value="1,402 KM" 
                trend="EST. 18 DAYS AWAY" 
                icon={Gauge}
                delay="delay-[800ms]"
              />
            </div>

          </div>
        </main>

        {/* Global Footer */}
        <footer className="w-full py-8 px-12 flex justify-between items-center text-[10px] uppercase tracking-[0.2em] text-tertiary font-black bg-white border-t border-secondary/20 shrink-0 z-10">
          <div className="flex gap-8 items-center">
            <span className="text-primary opacity-40">Precision Industrialism</span>
            <span className="opacity-30">© 2024 Enginecore Global</span>
          </div>
          <div className="flex gap-10">
            <FooterLink icon={ShieldCheck} label="Safety Protocols" />
            <FooterLink icon={Activity} label="Network Status" />
            <FooterLink icon={HelpCircle} label="Support" />
          </div>
        </footer>
      </div>
    </div>
  );
};

// Helper Components
const NavItem = ({ icon: Icon, label, active = false, delay = "" }: { icon: any, label: string, active?: boolean, delay?: string }) => (
  <button className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl transition-all duration-150 ease-out group animate-slide-up ${delay} ${active ? 'bg-neutral text-black font-black shadow-xl' : 'text-tertiary hover:text-neutral hover:bg-white/5'}`}>
    <Icon className={`w-5 h-5 transition-transform duration-150 ease-out ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
    <span className="text-sm tracking-tight">{label}</span>
  </button>
);

const NavLink = ({ label, active = false }: { label: string, active?: boolean }) => (
  <button className={`text-[10px] font-black uppercase tracking-[0.25em] transition-all relative py-2 ${active ? 'text-primary' : 'text-tertiary hover:text-primary'}`}>
    {label}
    {active && <span className="absolute -bottom-1 left-0 w-full h-1 bg-primary rounded-full animate-fade-in"></span>}
  </button>
);

const HeaderIcon = ({ icon: Icon, badge = false }: { icon: any, badge?: boolean }) => (
  <button className="relative w-11 h-11 flex items-center justify-center rounded-xl bg-secondary/10 hover:bg-primary hover:text-neutral transition-all group">
    <Icon className="w-5 h-5 group-active:scale-90 transition-transform" />
    {badge && <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>}
  </button>
);

const TelemetryStat = ({ label, value, icon: Icon, color = "text-primary" }: { label: string, value: string, icon: any, color?: string }) => (
  <div className="p-8 group hover:bg-secondary/5 transition-colors cursor-default">
    <div className="flex items-center gap-3 mb-2">
      <Icon className="w-4 h-4 text-tertiary group-hover:text-primary transition-colors" />
      <p className="text-[10px] font-black text-tertiary uppercase tracking-[0.2em]">{label}</p>
    </div>
    <p className={`text-xl font-extrabold ${color} tracking-tight`}>{value}</p>
  </div>
);
const AppointmentItem = ({ title, location, date, time, active = false }: { title: string, location: string, date: string, time: string, active?: boolean }) => (
  <div className={`rounded-3xl p-6 transition-all duration-150 ease-out cursor-pointer hover:shadow-xl hover:-translate-y-1 border-l-[6px] border-transparent hover:border-black ${active ? 'bg-white shadow-sm' : 'bg-secondary/10 opacity-80 hover:bg-secondary/20 hover:opacity-100'}`}>
    <div className="flex justify-between items-start mb-2">
      <h5 className="text-base font-black uppercase tracking-tight">{title}</h5>
      <p className={`text-sm font-black uppercase ${active ? 'text-black' : 'text-tertiary'}`}>{date}</p>
    </div>
    <div className="flex items-center gap-2 text-tertiary font-bold text-xs mb-4">
      {active ? <MapPin className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
      <span>{location}</span>
    </div>
    
    {active && (
      <>
        <div className="h-px bg-secondary/20 w-full mb-4" />
        <div className="flex justify-between items-center">
          <span className="text-xs font-black uppercase text-tertiary opacity-70">{time}</span>
          <button className="text-xs font-black text-black hover:underline tracking-tight">Reschedule</button>
        </div>
      </>
    )}
  </div>
);

const PurchaseItem = ({ title, id, date, price, icon: Icon }: { title: string, id: string, date: string, price: string, icon: any }) => (
  <div className="p-6 flex items-center justify-between group cursor-pointer hover:bg-secondary/5 transition-colors">
    <div className="flex items-center gap-5">
      <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-neutral transition-all duration-150 ease-out shadow-inner">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h5 className="text-base font-black tracking-tight">{title}</h5>
        <p className="text-xs text-tertiary font-bold mt-1">Order {id} • {date}</p>
      </div>
    </div>
    <span className="text-base font-black tracking-tight">{price}</span>
  </div>
);

const StatCard = ({ label, value, trend, trendUp = true, icon: Icon, delay = "" }: { label: string, value: string, trend: string, trendUp?: boolean, icon: any, delay?: string }) => (
  <div className={`bg-white rounded-3xl p-6 border border-secondary/20 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-100 hover:duration-200 ease-out group animate-slide-up ${delay} cursor-default`}>
    <div className="w-11 h-11 bg-secondary/5 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-neutral transition-all duration-100 hover:duration-200 ease-out shadow-inner group-hover:rotate-12">
      <Icon className="w-5 h-5" />
    </div>
    <p className="text-[10px] font-black text-tertiary uppercase tracking-[0.25em] mb-1">{label}</p>
    <p className="text-2xl font-heading font-extrabold mb-3 tracking-tighter">{value}</p>
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest ${trendUp ? 'bg-green-500/10 text-green-600' : 'bg-green-500/10 text-green-600'}`}>
        {trend.includes('%') && (trendUp ? '↑ ' : '↓ ')}
        {trend}
      </div>
    </div>
  </div>
);

const FooterLink = ({ icon: Icon, label }: { icon: any, label: string }) => (
  <button className="hover:text-primary transition-colors flex items-center gap-2 group text-left">
    <Icon className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" /> 
    <span className="opacity-80 group-hover:opacity-100">{label}</span>
  </button>
);

export default CustomerDashboard;
