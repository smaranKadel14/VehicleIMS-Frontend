import { useState, useEffect, type ComponentType } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { FC } from 'react';
import { 
  LayoutDashboard, 
  Wrench, 
  BarChart3, 
  Settings,
  Clock, 
  CreditCard, 
  Zap,
  ShoppingBag, 
  Fuel, 
  Activity, 
  Gauge,
  Shield,
  Info,
  ArrowUpRight,
  MapPin,
  RefreshCcw
} from 'lucide-react';
import truckImg from '../../assets/customer-img/GT.png';
import dashboardService from '../../services/dashboardService';
import type { DashboardStats, Vehicle, Transaction } from '../../services/dashboardService';
import authService from '../../services/authService';
import customerService, { type VehicleResponse, type NotificationResponse } from '../../services/customerService';
import { CustomerServices } from './CustomerServices';
import { CustomerHistory } from './CustomerHistory';
import { CustomerVehicles } from './CustomerVehicles';
import CustomerBilling from './CustomerBilling';
import { Car } from 'lucide-react';
import type { ServiceHistoryItem } from './CustomerHistory';

// Shared global components
import { Sidebar } from '../../components/layout/Sidebar';
import { Topbar } from '../../components/layout/Topbar';
import { MetricCard } from '../../components/ui/MetricCard';
import { NotificationDrawer } from '../../components/ui/NotificationDrawer';

const CustomerDashboard: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  
  // Navigation State
  const [activeView, setActiveView] = useState<'dashboard' | 'services' | 'history' | 'garage' | 'billing'>('dashboard');

  // Backend States
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [dbVehicles, setDbVehicles] = useState<VehicleResponse[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [dbServiceHistory, setDbServiceHistory] = useState<ServiceHistoryItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Telemetry & Loading States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get dashboard stats, vehicles and recent purchases
      const [statsData, vehiclesData, transactionsData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getVehicles(),
        dashboardService.getRecentTransactions(),
      ]);
      
      setStats(statsData);
      setVehicles(vehiclesData);
      setTransactions(transactionsData);

      // Fetch the Customer ID by searching their username
      if (user?.userName) {
        const searchRes = await customerService.search(user.userName);
        if (searchRes && searchRes.length > 0) {
          const matchedCust = searchRes[0];
          setCustomerId(matchedCust.id);
          setUserId(matchedCust.userId);
          setCustomerName(matchedCust.fullName || matchedCust.username || user.userName);
          setDbVehicles(matchedCust.vehicles || []);
          
          // Fetch completed service history from DB
          const historyData = await customerService.getHistory(matchedCust.id);
          setDbServiceHistory(historyData.serviceHistory || []);

          // Fetch notifications from PostgreSQL
          try {
            const notifs = await customerService.getCustomerNotifications(matchedCust.userId);
            setNotifications(notifs || []);
          } catch (notifErr) {
            console.error("Failed to load customer database notifications:", notifErr);
          }
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      const message = err.response?.data?.message || err.message || "Unknown error";
      setError(`Failed to connect to the backend server. Technical details: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await customerService.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Failed to dismiss notification:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    try {
      await customerService.markAllNotificationsAsRead(userId);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    
    interface LocationState {
      activeView?: 'dashboard' | 'services' | 'history' | 'garage' | 'billing';
    }
    const state = location.state as LocationState;
    if (state && state.activeView) {
      setActiveView(state.activeView);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCcw className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="font-heading font-extrabold text-xl animate-pulse">SYNCHRONIZING WITH ENGINECORE...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-4xl border border-red-200 shadow-2xl max-w-lg text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto">
             <Activity className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-heading font-extrabold tracking-tighter">Connection Offline</h2>
          <p className="text-primary/60 font-medium leading-relaxed">
            We're unable to establish a secure link with the Enginecore servers. 
            Technical details: {error}
          </p>
          <button 
            onClick={fetchData}
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
      <Sidebar
        logoTitle="EngineCore"
        logoSubtitle="V-Series Portal"
        logoIcon={Zap}
        items={[
          { icon: LayoutDashboard, label: "Dashboard", active: activeView === 'dashboard', onClick: () => setActiveView('dashboard') },
          { icon: Wrench, label: "Service Scheduler", active: activeView === 'services', onClick: () => setActiveView('services') },
          { icon: Clock, label: "History & Reviews", active: activeView === 'history', onClick: () => setActiveView('history') },
          { icon: Car, label: "My Garage", active: activeView === 'garage', onClick: () => setActiveView('garage') },
          { icon: CreditCard, label: "Billing & Invoices", active: activeView === 'billing', onClick: () => setActiveView('billing') }
        ]}
        footerItems={[
          { icon: Settings, label: "Settings", onClick: () => navigate('/profile') }
        ]}
        actionButton={{
          label: "New Part Request",
          onClick: () => setActiveView('services')
        }}
        handleLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative h-screen custom-scrollbar">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] -z-10 rounded-full opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 blur-[100px] -z-10 rounded-full opacity-20 pointer-events-none"></div>

        {/* Reusable Topbar header */}
        <Topbar
          searchQuery=""
          onSearchChange={() => {}}
          searchPlaceholder="Search components, parts, or VIN..."
          notificationBadgeCount={notifications.filter(n => !n.isRead).length}
          onNotificationClick={() => setShowNotifications(true)}
          onSettingsClick={() => navigate('/profile')}
          userName={customerName || user?.userName || 'User'}
          userRole={user?.roles?.[0] || 'Member'}
          onProfileClick={() => navigate('/profile')}
        />
 
        {/* Dynamic Main Body Content */}
        <main className="flex-1 p-10">
          <div className="max-w-[1500px] mx-auto space-y-10">
            {activeView === 'dashboard' && (
              <>
                {/* Top Row */}
                <div className="grid grid-cols-12 gap-8 animate-fade-in">
                  {/* Welcome Banner */}
                  <div className="col-span-12 lg:col-span-6 bg-white rounded-4xl p-10 relative overflow-hidden flex flex-col justify-between border border-secondary/20 shadow-sm group">
                      <div className="relative z-10">
                        <span className="inline-block px-3 py-1 bg-primary/5 text-[10px] font-black text-primary uppercase tracking-[0.2em] rounded-full mb-4">Personal Portal</span>
                        <h2 className="text-5xl font-heading font-extrabold mb-4 tracking-tighter">Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-primary/60">{(customerName || user?.userName || 'Rider').split(' ')[0]}.</span></h2>
                        <p className="text-primary/60 text-base max-w-md leading-relaxed font-medium">
                          Your V-Series GT is currently in peak performance. All systems report nominal status for the upcoming season.
                        </p>
                      </div>
                    <div className="flex gap-4 relative z-10">
                      <button 
                        onClick={() => setActiveView('services')}
                        className="bg-black text-neutral px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95"
                      >
                        Schedule Checkup
                      </button>
                      <button 
                        onClick={() => navigate('/profile')}
                        className="bg-[#F5F5F3] text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#EDEDED] transition-all active:scale-95"
                      >
                        View Profile
                      </button>
                    </div>
                    {/* Visual Flair */}
                    <div className="absolute right-0 top-0 h-full w-full pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity">
                       <div className="absolute top-10 right-10 w-64 h-64 bg-primary/5 rounded-full blur-[80px]"></div>
                       <div className="absolute -bottom-1 right-20 w-48 h-48 bg-secondary/20 rounded-full blur-[60px]"></div>
                    </div>
                  </div>

                  {/* Pending Balance */}
                  <div className="col-span-12 md:col-span-6 lg:col-span-3">
                    <MetricCard
                      title="Pending Balance"
                      invoiceInfo={stats?.lastInvoiceNumber ? `Invoice: #${stats.lastInvoiceNumber}` : "Invoice: N/A"}
                      value={`RS ${stats?.pendingBalance.toLocaleString() || '0'}.00`}
                      icon={CreditCard}
                      dark={true}
                      buttonText="Pay Balance"
                      onButtonClick={() => setActiveView('billing')}
                    />
                  </div>

                  {/* Service Recommendation */}
                  <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-white rounded-4xl p-8 border border-secondary/20 shadow-sm flex flex-col justify-between hover:border-primary/20 transition-colors">
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
                <div className="grid grid-cols-12 gap-8 animate-fade-in delay-[100ms]">
                  {/* Active Vehicles Section */}
                  <div className="col-span-12 lg:col-span-8 space-y-8">
                    <div className="flex justify-between items-end px-2">
                      <div>
                        <h3 className="text-3xl font-heading font-extrabold tracking-tighter">Active Vehicles</h3>
                        <p className="text-base text-tertiary font-medium">Real-time status of your registered assets.</p>
                      </div>
                      <button 
                        onClick={() => setActiveView('garage')}
                        className="px-5 py-2.5 bg-white border border-secondary/30 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white hover:border-black transition-all shadow-sm"
                      >
                        Manage All
                      </button>
                    </div>

                    <div className="bg-white rounded-5xl overflow-hidden border border-secondary/20 shadow-sm group hover:shadow-2xl transition-all duration-150 ease-out">
                      {vehicles.length > 0 ? (
                        <>
                          <div className="relative h-[400px] bg-[#F9F9F9] overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-secondary/5 to-transparent pointer-events-none"></div>
                            
                            <img src={vehicles[0].image || truckImg} alt={vehicles[0].name} className="w-full h-full object-contain p-12 drop-shadow-2xl group-hover:scale-105 transition-transform duration-700" />
                            
                            <div className="absolute top-10 right-10 flex items-center gap-3 bg-white/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-white shadow-xl animate-fade-in">
                              <div className={`w-2.5 h-2.5 ${vehicles[0].status === 'In Operation' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-yellow-500'} rounded-full animate-pulse`}></div>
                              <span className="text-[11px] font-black uppercase tracking-[0.15em] text-primary">{vehicles[0].status}</span>
                            </div>

                            <div className="absolute bottom-10 left-12">
                              <div className="inline-block px-3 py-1 bg-black text-neutral text-[9px] font-black uppercase tracking-widest rounded mb-3">Priority Asset</div>
                              <h4 className="text-4xl font-heading font-extrabold text-black tracking-tighter">{vehicles[0].name}</h4>
                              <p className="text-xs font-bold text-tertiary tracking-[0.25em] uppercase mt-2 opacity-80">VIN: {vehicles[0].vin}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 border-t border-secondary/10 bg-white">
                            <TelemetryStat label="Engine Health" value={vehicles[0].engineHealth} icon={Activity} color={vehicles[0].engineHealth.includes('Nominal') ? "text-green-500" : "text-primary"} />
                            <TelemetryStat label="Tire Pressure" value={vehicles[0].tirePressure} icon={Gauge} />
                            <TelemetryStat label="Odometer" value={vehicles[0].odometer} icon={Clock} />
                          </div>
                        </>
                      ) : (
                        <div className="h-[400px] flex items-center justify-center bg-[#F9F9F9]">
                          <p className="text-tertiary font-bold uppercase tracking-widest">No active vehicles found</p>
                        </div>
                      )}

                      <button className="w-full py-5 bg-[#F9F9F9] text-tertiary text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-black hover:text-white transition-all duration-150 ease-out border-t border-secondary/10">
                        <BarChart3 className="w-4 h-4" /> View Full Telemetry Data
                      </button>
                    </div>
                  </div>

                  {/* Right Side Panel */}
                  <div className="col-span-12 lg:col-span-4 space-y-10">
                    {/* Appointments */}
                    <section>
                      <div className="flex justify-between items-center mb-6 px-2">
                        <h4 className="text-sm font-black uppercase tracking-[0.3em] text-tertiary">Upcoming Bookings</h4>
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
                          location="Enginecore Tech Lab" 
                          date="Nov 12" 
                          time="11:30 AM"
                        />
                      </div>
                    </section>

                    {/* Recent Purchases */}
                    <section>
                      <div className="flex justify-between items-center mb-6 px-2">
                        <h4 className="text-sm font-black uppercase tracking-[0.3em] text-tertiary">Recent Purchases</h4>
                      </div>
                      <div className="bg-white rounded-4xl border border-secondary/20 shadow-sm overflow-hidden group">
                        <div className="divide-y divide-secondary/10">
                          {transactions.length > 0 ? (
                            transactions.map(tx => (
                              <PurchaseItem 
                                key={tx.id}
                                title={tx.title} 
                                id={tx.orderId} 
                                date={tx.date} 
                                price={tx.price} 
                                icon={ShoppingBag}
                              />
                            ))
                          ) : (
                            <div className="p-8 text-center text-tertiary font-bold uppercase tracking-widest text-xs">
                              No recent transactions
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => setActiveView('history')}
                          className="w-full py-6 bg-secondary/10 text-tertiary text-xs font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all duration-150 ease-out"
                        >
                          Full Transaction History
                        </button>
                      </div>
                    </section>
                  </div>
                </div>

                {/* Bottom Row - 3 Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 animate-fade-in delay-[200ms]">
                  <StatCard 
                    label="Fuel Economy" 
                    value={`${stats?.fuelEconomy || '0'} L/100`} 
                    trend="FROM LAST MONTH" 
                    trendUp={false}
                    icon={Fuel}
                  />
                  <StatCard 
                    label="Total Maintenance" 
                    value={`RS ${stats?.totalMaintenance.toLocaleString() || '0'}`} 
                    trend="SINCE REGISTRATION" 
                    icon={Wrench}
                  />
                  <StatCard 
                    label="Next Service" 
                    value={`${stats?.nextServiceDistance.toLocaleString() || '0'} KM`} 
                    trend="ESTIMATED DISTANCE" 
                    icon={Gauge}
                  />
                </div>
              </>
            )}

            {/* SERVICES VIEW: Scheduler & Unavailable Parts Sourcing */}
            {activeView === 'services' && (
              <CustomerServices 
                customerId={customerId}
                vehicles={vehicles}
                fetchData={fetchData}
              />
            )}

            {/* HISTORY VIEW: Completed Bookings & Star Quality Feedback */}
            {activeView === 'history' && (
              <CustomerHistory 
                customerId={customerId}
                dbServiceHistory={dbServiceHistory}
                transactions={transactions}
                fetchData={fetchData}
              />
            )}

            {/* GARAGE VIEW: Vehicle Fleet Management */}
            {activeView === 'garage' && (
              <CustomerVehicles 
                customerId={customerId}
                vehicles={dbVehicles}
                fetchData={fetchData}
              />
            )}

            {/* BILLING VIEW: Sales Invoices & Statements */}
            {activeView === 'billing' && (
              <CustomerBilling 
                customerId={customerId}
                onBackToDashboard={() => setActiveView('dashboard')}
              />
            )}
          </div>
        </main>

        {/* Global Footer */}
        <footer className="w-full py-8 px-12 flex justify-between items-center text-[10px] uppercase tracking-[0.2em] text-tertiary font-black bg-white border-t border-secondary/20 shrink-0 z-10">
          <div className="flex gap-8 items-center">
            <span className="text-primary opacity-40">Precision Industrialism</span>
            <span className="opacity-30">© 2024 Enginecore Global</span>
          </div>
          <div className="flex gap-10">
            <FooterLink icon={Shield} label="Safety Protocols" />
            <FooterLink icon={Activity} label="Network Status" />
            <FooterLink icon={Info} label="Support" />
          </div>
        </footer>
      </div>

      {/* Reusable premium NotificationDrawer */}
      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications.map(n => ({
          id: n.id,
          message: n.message,
          isRead: n.isRead,
          date: n.createdAt
        }))}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </div>
  );
};

// Helper Components

const TelemetryStat = ({ label, value, icon: Icon, color = "text-primary" }: { label: string, value: string, icon: ComponentType<{ className?: string }>, color?: string }) => (
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

const PurchaseItem = ({ title, id, date, price, icon: Icon }: { title: string, id: string, date: string, price: string, icon: ComponentType<{ className?: string }> }) => (
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

const StatCard = ({ label, value, trend, trendUp = true, icon: Icon, delay = "" }: { label: string, value: string, trend: string, trendUp?: boolean, icon: ComponentType<{ className?: string }>, delay?: string }) => (
  <div className={`bg-white rounded-3xl p-6 border border-secondary/20 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-100 hover:duration-200 ease-out group animate-slide-up ${delay} cursor-default`}>
    <div className="w-11 h-11 bg-secondary/5 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-neutral transition-all duration-100 hover:duration-200 ease-out shadow-inner group-hover:rotate-12">
      <Icon className="w-5 h-5" />
    </div>
    <p className="text-[10px] font-black text-tertiary uppercase tracking-[0.25em] mb-1">{label}</p>
    <p className="text-2xl font-heading font-extrabold mb-3 tracking-tighter">{value}</p>
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest ${trendUp ? 'bg-green-500/10 text-green-600' : 'bg-green-500/10 text-green-600'}`}>
        {trend}
      </div>
    </div>
  </div>
);

const FooterLink = ({ icon: Icon, label }: { icon: ComponentType<{ className?: string }>, label: string }) => (
  <button className="hover:text-primary transition-colors flex items-center gap-2 group text-left">
    <Icon className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" /> 
    <span className="opacity-80 group-hover:opacity-100">{label}</span>
  </button>
);

export default CustomerDashboard;
