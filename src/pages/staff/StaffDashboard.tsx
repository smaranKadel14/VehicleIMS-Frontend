import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FC } from 'react';
import { 
  Search, 
  ShoppingCart, 
  UserPlus, 
  Car, 
  X, 
  Sparkles,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Bell,
  Package,
  RefreshCw,
  Calendar,
  AlertTriangle,
  Gem,
  Mail
} from 'lucide-react';
import authService from '../../services/authService';
import partService from '../../services/partService';
import customerService from '../../services/customerService';
import salesService from '../../services/salesService';
import reportService from '../../services/reportService';
import type { 
  CustomerReportResponse, 
  HighSpenderCustomerDto, 
  RegularCustomerDto, 
  PendingCreditCustomerDto 
} from '../../services/reportService';
import type { PartResponse } from '../../services/partService';
import type { CustomerResponse } from '../../services/customerService';

// Import modularized components
import SellPartsModal from './components/SellPartsModal';
import RegisterCustomerModal from './components/RegisterCustomerModal';

// Types & Interfaces
interface ActivityLog {
  id: string;
  invoiceId?: number;
  customerName: string;
  actionText: string;
  targetObject: string;
  subtext: string;
  badges: string[];
  time: string;
  type: "purchase" | "refund" | "booking";
}

interface LookupItem {
  type: "Customer" | "Vehicle" | "Part";
  title: string;
  subtitle: string;
  value: string;
}

const LOOKUP_DATABASE: LookupItem[] = [
  { type: "Customer", title: "Elena Rossi", subtitle: "elena.rossi@gmail.com • +39 333 4455", value: "Customer: Elena Rossi" },
  { type: "Customer", title: "Marcus Chen", subtitle: "m.chen@outlook.com • 555-0144", value: "Customer: Marcus Chen" },
  { type: "Customer", title: "Sarah Jenkins", subtitle: "s.jenkins@yahoo.com • 555-8822", value: "Customer: Sarah Jenkins" },
  { type: "Vehicle", title: "Audi A4 B9 (2018)", subtitle: "Plate: AB-123-CD • VIN: WBA53BK00214", value: "VIN: WBA53BK00214" },
  { type: "Vehicle", title: "V-Series GT (Stage 2)", subtitle: "Plate: KAL-1234 • VIN: VSE8820GTS2", value: "VIN: VSE8820GTS2" },
  { type: "Part", title: "Clutch Assembly Kit", subtitle: "SKU: CLU-ASSY-09 • Stock: 14 units", value: "Part: Clutch-Assembly" },
  { type: "Part", title: "V6 Compression Piston Kit", subtitle: "SKU: PIS-V6-KT • Stock: 3 units", value: "Part: V6-Piston-Kit" },
  { type: "Part", title: "Heavy Duty Brake Pads", subtitle: "SKU: BRK-HDPAD-01 • Stock: 28 units", value: "Part: HD-Brake-Pads" }
];

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Users, label: "Customers" },
];

const StaffDashboard: FC = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  // Primary States
  const [activeTab, setActiveTab] = useState<"Overview" | "Performance" | "Reports">("Overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [customersServed, setCustomersServed] = useState(0);
  const [todaySales, setTodaySales] = useState(0);
  const [pendingCreditsCount, setPendingCreditsCount] = useState(0);

  // Modals & Interactivity States
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isCrmModalOpen, setIsCrmModalOpen] = useState(false);
  
  // Custom Success Notifications
  const [notification, setNotification] = useState<string | null>(null);

  // DB integration states
  const [dbParts, setDbParts] = useState<PartResponse[]>([]);
  const [dbCustomers, setDbCustomers] = useState<CustomerResponse[]>([]);
  const [customerReport, setCustomerReport] = useState<CustomerReportResponse | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const refreshDashboardStats = async () => {
    try {
      const daily = await reportService.getFinancialReport("daily");
      setTodaySales(daily.totalRevenue);
      setCustomersServed(daily.totalSalesCount);

      const invoices = await salesService.getAll();
      const mapped = invoices.slice(0, 5).map(inv => ({
        id: `act-${inv.id}`,
        invoiceId: inv.id,
        customerName: inv.customerName,
        actionText: "purchased",
        targetObject: inv.items.map(item => item.partName).join(", ") || "Parts",
        subtext: `Invoice #${inv.invoiceNumber} • Amount: RS ${inv.finalTotal.toFixed(2)}`,
        badges: [inv.isPaid ? "PAID" : "UNPAID", "DATABASE SAVED"],
        time: new Date(inv.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "purchase" as const
      }));
      setActivities(mapped);

      const rep = await reportService.getCustomerReport();
      setCustomerReport(rep);
      setPendingCreditsCount(rep.pendingCredits ? rep.pendingCredits.length : 0);
    } catch (err) {
      console.error("Failed to refresh dashboard statistics:", err);
    }
  };

  useEffect(() => {
    partService.getAll()
      .then(res => {
        setDbParts(res);
      })
      .catch(err => console.error("Error loading parts:", err));

    customerService.search("", "All", "Active")
      .then(res => {
        setDbCustomers(res);
      })
      .catch(err => console.error("Error loading customers:", err));

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingReport(true);
    refreshDashboardStats().finally(() => setLoadingReport(false));
  }, []);

  // Global search input for topbar / popup searches
  const [globalSearch, setGlobalSearch] = useState("");

  // Filtered lookup items based on Operational Search
  const filteredLookup = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return LOOKUP_DATABASE.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.subtitle.toLowerCase().includes(q) || 
      item.value.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Submit handlers for Modular Modals
  const handleAuthorizeSale = async (data: { customerId: number; partId: number; quantity: number; discountPercentage: number; totalAmount: number }) => {
    try {
      await salesService.create({
        customerId: data.customerId,
        isPaid: true,
        items: [
          {
            partId: data.partId,
            quantity: data.quantity,
            unitPrice: dbParts.find(p => p.id === data.partId)?.price || 0
          }
        ]
      });

      setIsSellModalOpen(false);
      await refreshDashboardStats();
      showNotification(`Invoice processed transactionally! RS ${data.totalAmount.toFixed(2)} added.`);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("POS transaction failed:", error);
      showNotification(error?.response?.data?.message || "POS Transaction failed. Out of stock?");
      throw err;
    }
  };

  const handleRegisterCustomer = async (data: { firstName: string; lastName: string; email: string; phone: string; address: string }) => {
    try {
      await customerService.register({
        username: data.firstName.toLowerCase() + data.lastName.toLowerCase() + Math.floor(Math.random() * 100),
        email: data.email.trim(),
        passwordHash: "Client123!",
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone.trim(),
        address: data.address.trim() || "N/A",
        make: "Generic",
        model: "Vehicle",
        year: 2024,
        vin: "VIN-TEMP-1234",
        licensePlate: "TEMP-" + Math.floor(1000 + Math.random() * 9000)
      });

      const fullName = `${data.firstName} ${data.lastName}`;
      setCustomersServed(prev => prev + 1);

      // Refresh DB customer list
      const updatedCustomers = await customerService.search("", "All", "Active");
      setDbCustomers(updatedCustomers);

      // Add to activity list
      const newLog: ActivityLog = {
        id: `act-${Date.now()}`,
        customerName: fullName,
        actionText: "registered a",
        targetObject: "CRM profile",
        subtext: `Account created for ${data.email} • Mobile: ${data.phone || 'N/A'}`,
        badges: ["VERIFIED", "DATABASE SAVED"],
        time: "JUST NOW",
        type: "booking"
      };

      setActivities(prev => [newLog, ...prev]);
      setIsCrmModalOpen(false);
      showNotification(`Registered customer "${fullName}" successfully in database!`);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("CRM customer registration failed:", error);
      showNotification(error?.response?.data?.message || "Customer registration failed.");
      throw err;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#F9FAFB", fontFamily: "'Inter', -apple-system, sans-serif", color: "#111827", overflow: "hidden", position: "relative" }}>
      
      {/* Left Navigation Sidebar */}
      <aside style={{ width: 240, background: "#1a1a1a", display: "flex", flexDirection: "column", flexShrink: 0, height: "100vh" }}>
        
        {/* Sidebar Brand Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #2a2a2a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#111" }}>
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#fff", letterSpacing: "-0.3px" }}>EngineCore</div>
              <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 500, letterSpacing: "0.04em" }}>V-Series Portal</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "12px 0" }}>
          {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              onClick={() => {
                if (label === "Dashboard") navigate("/staff-dashboard");
                if (label === "Customers") navigate("/customers");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 20px",
                background: active ? "#2a2a2a" : "transparent",
                color: active ? "#fff" : "#9ca3af",
                fontWeight: active ? 600 : 400,
                fontSize: 13.5,
                cursor: "pointer",
                borderLeft: active ? "3px solid #fff" : "3px solid transparent",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#222"; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ display: "flex", alignItems: "center", opacity: active ? 1 : 0.7 }}>
                <Icon className="w-4 h-4" />
              </span>
              {label}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer (Settings & Sign Out) */}
        <div style={{ borderTop: "1px solid #2a2a2a", padding: "12px 0" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", color: "#9ca3af", fontSize: 13.5, cursor: "pointer" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#9ca3af"; }}
            onClick={() => showNotification("Settings options are managed in your account panel.")}
          >
            <Settings className="w-4 h-4" /> Settings
          </div>
          <div
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", color: "#9ca3af", fontSize: 13.5, cursor: "pointer" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#9ca3af"; }}
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </div>
        </div>
      </aside>

      {/* Right Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* Floating Success Notifications */}
        {notification && (
          <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", background: "#111827", color: "#FFF", padding: "14px 28px", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.15)", zIndex: 10000, display: "flex", alignItems: "center", gap: 10, animation: "fadeIn 0.2s ease" }}>
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>{notification}</span>
          </div>
        )}

        {/* Topbar Header */}
        <header style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E7EB", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", flexShrink: 0, boxSizing: "border-box" }}>
          
          {/* Global Search */}
          <div style={{ position: "relative", flex: 1, maxWidth: 380 }}>
            <Search className="w-4 h-4" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search customer, vehicle, or VIN..."
              style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#374151" }}
            />
          </div>

          {/* Center Navigation Tabs */}
          <div style={{ display: "flex", gap: 24 }}>
            {(["Overview", "Performance", "Reports"] as const).map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    color: active ? "#111827" : "#6B7280",
                    cursor: "pointer",
                    paddingBottom: 2,
                    borderBottom: active ? "2px solid #111827" : "2px solid transparent",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                    transition: "color 0.15s ease"
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Icons & Staff Identity */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* Notification Bell */}
            <span 
              onClick={() => showNotification("4 high-priority tasks pending on workshop floor.")}
              style={{ display: "flex", alignItems: "center", cursor: "pointer", color: "#374151" }}
            >
              <Bell className="w-5 h-5" />
            </span>
            
            {/* Gear Settings */}
            <span 
              onClick={handleLogout}
              style={{ display: "flex", alignItems: "center", cursor: "pointer", color: "#374151" }}
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </span>

            {/* Staff Identity Block */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 4 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111", lineHeight: 1.2 }}>
                  {user?.userName || "Marcus Thorne"}
                </div>
                <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.05em" }}>
                  {user?.roles?.[0] || "SERVICE LEAD"}
                </div>
              </div>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#374151", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {user?.userName ? user.userName.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'MT'}
              </div>
            </div>
          </div>

        </header>

        {/* Main Scroll Panel */}
        <div style={{ flex: 1, overflowY: "auto", padding: "40px 32px", boxSizing: "border-box" }}>
          
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            
            {/* Page Greeting */}
            <div style={{ marginBottom: 36 }}>
              <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0, letterSpacing: "-0.8px" }}>
                Morning, {user?.userName?.split(' ')[0] || "Marcus"}.
              </h1>
              <p style={{ fontSize: 15, fontWeight: 500, color: "#6B7280", margin: "8px 0 0 0" }}>
                The warehouse floor is active. 4 high-priority work orders pending today.
              </p>
            </div>

            {/* KPI Metric Cards Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 36 }}>
              
              {/* Card 1: Today's Sales */}
              <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderLeft: "4px solid #111827", borderRadius: 12, padding: "20px 24px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>Today's Sales</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 12 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>
                    RS {todaySales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#10B981" }}>+12%</span>
                </div>
              </div>

              {/* Card 2: Customers Served */}
              <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, padding: "20px 24px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>Customers Served</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 12 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>{customersServed}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#6B7280" }}>vs 38 yesterday</span>
                </div>
              </div>

              {/* Card 3: Pending Credits */}
              <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, padding: "20px 24px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>Pending Credits</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 12 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>{pendingCreditsCount}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>Awaiting Auth</span>
                </div>
              </div>

              {/* Card 4: Appointments */}
              <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12, padding: "20px 24px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>Appointments</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 12 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>7</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#EF4444" }}>3 Critical</span>
                </div>
              </div>

            </div>
            {activeTab === "Overview" && (
              <>
                {/* Main Dashboard Split Columns */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 36, alignItems: "start" }}>
                  
                  {/* Left Column: Operational Lookup Box */}
                  <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 16, padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.02)", position: "relative" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                      <Search className="w-5 h-5" style={{ color: "#111827" }} />
                      <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: "-0.3px" }}>Operational Lookup</h2>
                    </div>

                    {/* Massive Centered Search Bar */}
                    <div style={{ position: "relative", marginBottom: 24 }}>
                      <span style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }}>
                        <Search className="w-5 h-5" />
                      </span>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Start typing name, license plate, or part number..."
                        style={{ width: "100%", paddingLeft: 52, paddingRight: 96, paddingTop: 18, paddingBottom: 18, border: "1.5px solid #E5E7EB", background: "#F9FAFB", borderRadius: 14, fontSize: 14.5, fontWeight: 500, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#111827" }}
                      />
                      <span style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 4, background: "#FFFFFF", border: "1.5px solid #E5E7EB", padding: "4px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, color: "#9CA3AF" }}>
                        <span>CTRL</span>
                        <span>K</span>
                      </span>
                    </div>

                    {/* Autocomplete Popup List */}
                    {searchQuery.trim() ? (
                      <div style={{ background: "#FFFFFF", border: "1.5px solid #E5E7EB", borderRadius: 12, overflow: "hidden", position: "absolute", left: 32, right: 32, top: "100%", zIndex: 10, boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
                        {filteredLookup.length === 0 ? (
                          <div style={{ padding: "16px 20px", color: "#6B7280", fontSize: 13, textAlign: "center" }}>
                            No results found for "{searchQuery}". Try "Elena", "WBA" or "Clutch".
                          </div>
                        ) : (
                          <div>
                            {filteredLookup.map((item, idx) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  setSearchQuery("");
                                  showNotification(`Navigated to: ${item.title}`);
                                }}
                                style={{ padding: "14px 20px", borderBottom: idx === filteredLookup.length - 1 ? "none" : "1px solid #F3F4F6", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "#FFFFFF")}
                              >
                                <div>
                                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700 }}>{item.title}</p>
                                  <p style={{ margin: "2px 0 0 0", fontSize: 11, color: "#6B7280" }}>{item.subtitle}</p>
                                </div>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 6, background: item.type === "Customer" ? "#E0F2FE" : item.type === "Vehicle" ? "#FEF3C7" : "#DCFCE7", color: item.type === "Customer" ? "#0369A1" : item.type === "Vehicle" ? "#B45309" : "#15803D" }}>
                                  {item.type.toUpperCase()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: "#6B7280", display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <span style={{ textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF" }}>Recent Searches:</span>
                        <span style={{ color: "#111827", cursor: "pointer" }} onClick={() => setSearchQuery("WBA53BK")}>VIN: WBA53BK...</span>
                        <span style={{ color: "#111827", cursor: "pointer" }} onClick={() => setSearchQuery("Elena")}>Customer: Elena Rossi</span>
                        <span style={{ color: "#111827", cursor: "pointer" }} onClick={() => setSearchQuery("Piston-Kit")}>Part: V6-Piston-Kit</span>
                      </div>
                    )}

                  </div>

                  {/* Right Column: Action Buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    
                    {/* Action 1: Sell Parts */}
                    <button
                      onClick={() => setIsSellModalOpen(true)}
                      style={{
                        width: "100%",
                        background: "#111827",
                        border: "none",
                        borderRadius: 14,
                        padding: "20px 24px",
                        textAlign: "left",
                        color: "#FFFFFF",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        boxShadow: "0 6px 20px rgba(17,24,39,0.15)",
                        transition: "transform 0.15s ease, background 0.15s ease",
                        fontFamily: "inherit"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.background = "#1F2937";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.background = "#111827";
                      }}
                    >
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Sell Parts</p>
                        <p style={{ margin: "4px 0 0 0", fontSize: 11, color: "#9CA3AF", fontWeight: 500 }}>Direct POS terminal</p>
                      </div>
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </button>

                    {/* Action 2: Register Customer */}
                    <button
                      onClick={() => setIsCrmModalOpen(true)}
                      style={{
                        width: "100%",
                        background: "#E5E7EB",
                        border: "none",
                        borderRadius: 14,
                        padding: "20px 24px",
                        textAlign: "left",
                        color: "#111827",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "transform 0.15s ease, background 0.15s ease",
                        fontFamily: "inherit"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.background = "#D1D5DB";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.background = "#E5E7EB";
                      }}
                    >
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Register Customer</p>
                        <p style={{ margin: "4px 0 0 0", fontSize: 11, color: "#6B7280", fontWeight: 500 }}>Create CRM profile</p>
                      </div>
                      <UserPlus className="w-5 h-5 text-gray-800" />
                    </button>

                    {/* Action 3: Search Vehicle */}
                    <button
                      onClick={() => showNotification("OBD Telemetry details loaded! Check Customer Activity feed below.")}
                      style={{
                        width: "100%",
                        background: "#E5E7EB",
                        border: "none",
                        borderRadius: 14,
                        padding: "20px 24px",
                        textAlign: "left",
                        color: "#111827",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "transform 0.15s ease, background 0.15s ease",
                        fontFamily: "inherit"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.background = "#D1D5DB";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.background = "#E5E7EB";
                      }}
                    >
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Search Vehicle</p>
                        <p style={{ margin: "4px 0 0 0", fontSize: 11, color: "#6B7280", fontWeight: 500 }}>Service history & specs</p>
                      </div>
                      <Car className="w-5 h-5 text-gray-800" />
                    </button>

                  </div>

                </div>

                {/* Customer Activity Feed Panel */}
                <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 16, padding: "28px 32px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                  
                  {/* Feed Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: "-0.3px" }}>Customer Activity Feed</h2>
                    <button 
                      onClick={() => showNotification("Retrieving complete history logs database...")}
                      style={{ background: "none", border: "none", fontSize: 10.5, fontWeight: 800, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      View All Logs
                    </button>
                  </div>

                  {/* Activity Cards List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {activities.map((act) => (
                      <div 
                        key={act.id} 
                        style={{ 
                          background: "#F9FAFB", 
                          border: "1px solid #F3F4F6", 
                          borderRadius: 12, 
                          padding: "18px 24px", 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center" 
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={{ width: 42, height: 42, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#374151" }}>
                            {act.type === "purchase" ? (
                              <Package className="w-5 h-5" />
                            ) : act.type === "refund" ? (
                              <RefreshCw className="w-5 h-5" />
                            ) : (
                              <Calendar className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                              <strong style={{ fontWeight: 800 }}>{act.customerName}</strong> {act.actionText} <strong style={{ fontWeight: 800 }}>{act.targetObject}</strong>
                            </p>
                            <p style={{ margin: "4px 0 0 0", fontSize: 11.5, color: "#6B7280", fontWeight: 500 }}>{act.subtext}</p>
                            
                            {/* Badges */}
                            {act.badges.length > 0 && (
                              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                                {act.badges.map((b) => (
                                  <span 
                                    key={b} 
                                    style={{ 
                                      fontSize: 9, 
                                      fontWeight: 800, 
                                      padding: "3px 8px", 
                                      borderRadius: 4, 
                                      background: b === "PAID" || b === "VERIFIED" ? "#DCFCE7" : b === "IN STOCK" ? "#E5E7EB" : "#FEE2E2", 
                                      color: b === "PAID" || b === "VERIFIED" ? "#15803D" : b === "IN STOCK" ? "#4B5563" : "#B91C1C",
                                      letterSpacing: "0.04em"
                                    }}
                                  >
                                    {b}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          {act.invoiceId && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                showNotification(`Sending Invoice #${act.invoiceId} via Email...`);
                                try {
                                  await salesService.sendEmail(act.invoiceId!, {
                                    subject: `EngineCore Workshop Invoice #${act.invoiceId}`,
                                    message: "Dear Customer,\n\nThank you for choosing EngineCore Workshop. Your invoice has been processed and is attached. Please contact us if you have any questions.\n\nBest Regards,\nEngineCore Workshop Team"
                                  });
                                  showNotification(`Invoice #${act.invoiceId} email dispatched successfully!`);
                                } catch (err) {
                                  console.error("Email dispatch failed:", err);
                                  showNotification("Failed to send email. Check SMTP settings.");
                                }
                              }}
                              style={{
                                padding: "6px 12px",
                                background: "#111827",
                                color: "#FFF",
                                border: "none",
                                borderRadius: 8,
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: "pointer",
                                fontFamily: "inherit",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                transition: "background 0.15s ease"
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#1F2937")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "#111827")}
                            >
                              <Mail className="w-3.5 h-3.5" /> Send Email
                            </button>
                          )}
                          <div style={{ fontSize: 10.5, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.05em" }}>
                            {act.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </>
            )}

            {activeTab === "Reports" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>Customer Segment Analytics</h2>
                    <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#6B7280" }}>Live segment analytics fetched from transaction history databases</p>
                  </div>
                  <button 
                    onClick={async () => {
                      setLoadingReport(true);
                      try {
                        const res = await reportService.getCustomerReport();
                        setCustomerReport(res);
                        showNotification("Refreshed analytical report segments successfully!");
                      } catch(e) {
                        console.error(e);
                      } finally {
                        setLoadingReport(false);
                      }
                    }}
                    style={{ padding: "8px 16px", background: "#111827", color: "#FFF", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {loadingReport ? "Analyzing..." : "Refresh Segments"}
                  </button>
                </div>

                {loadingReport && !customerReport ? (
                  <div style={{ padding: "40px 0", textAlign: "center", fontSize: 14, color: "#6B7280", fontWeight: 500 }}>
                    Fetching financial ledger details...
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
                    
                    {/* Segment 1: High Spenders */}
                    <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                        <Gem className="w-5 h-5 text-yellow-500" />
                        <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>High Spenders (Top Revenue Contributors)</h3>
                      </div>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                          <thead>
                            <tr style={{ borderBottom: "2px solid #F3F4F6", color: "#6B7280" }}>
                              <th style={{ padding: "10px 12px" }}>Customer Name</th>
                              <th style={{ padding: "10px 12px" }}>Email</th>
                              <th style={{ padding: "10px 12px" }}>Phone</th>
                              <th style={{ padding: "10px 12px", textAlign: "right" }}>Total Spent</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customerReport?.highSpenders && customerReport.highSpenders.length > 0 ? (
                              customerReport.highSpenders.map((cust: HighSpenderCustomerDto) => (
                                <tr key={cust.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                                  <td style={{ padding: "12px 12px", fontWeight: 700 }}>{cust.name}</td>
                                  <td style={{ padding: "12px 12px", color: "#6B7280" }}>{cust.email}</td>
                                  <td style={{ padding: "12px 12px" }}>{cust.phone || "N/A"}</td>
                                  <td style={{ padding: "12px 12px", textAlign: "right", fontWeight: 800, color: "#10B981" }}>RS {cust.totalSpent.toFixed(2)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} style={{ padding: "20px 12px", textAlign: "center", color: "#9CA3AF" }}>No high spenders recorded. Complete invoices to generate revenue data.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Segment 2: Regular Customers */}
                    <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                        <RefreshCw className="w-5 h-5 text-blue-500" />
                        <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Regular Customers (Most Frequent Buyers)</h3>
                      </div>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                          <thead>
                            <tr style={{ borderBottom: "2px solid #F3F4F6", color: "#6B7280" }}>
                              <th style={{ padding: "10px 12px" }}>Customer Name</th>
                              <th style={{ padding: "10px 12px" }}>Email</th>
                              <th style={{ padding: "10px 12px" }}>Phone</th>
                              <th style={{ padding: "10px 12px", textAlign: "right" }}>Invoices Issued</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customerReport?.regulars && customerReport.regulars.length > 0 ? (
                              customerReport.regulars.map((cust: RegularCustomerDto) => (
                                <tr key={cust.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                                  <td style={{ padding: "12px 12px", fontWeight: 700 }}>{cust.name}</td>
                                  <td style={{ padding: "12px 12px", color: "#6B7280" }}>{cust.email}</td>
                                  <td style={{ padding: "12px 12px" }}>{cust.phone || "N/A"}</td>
                                  <td style={{ padding: "12px 12px", textAlign: "right", fontWeight: 800, color: "#3B82F6" }}>{cust.purchaseCount} purchases</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} style={{ padding: "20px 12px", textAlign: "center", color: "#9CA3AF" }}>No regular customers recorded.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Segment 3: Pending Credits */}
                    <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Pending Credits (Outstanding Balances)</h3>
                      </div>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                          <thead>
                            <tr style={{ borderBottom: "2px solid #F3F4F6", color: "#6B7280" }}>
                              <th style={{ padding: "10px 12px" }}>Customer Name</th>
                              <th style={{ padding: "10px 12px" }}>Email</th>
                              <th style={{ padding: "10px 12px" }}>Unpaid Invoices</th>
                              <th style={{ padding: "10px 12px", textAlign: "right" }}>Pending Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customerReport?.pendingCredits && customerReport.pendingCredits.length > 0 ? (
                              customerReport.pendingCredits.map((cust: PendingCreditCustomerDto) => (
                                <tr key={cust.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                                  <td style={{ padding: "12px 12px", fontWeight: 700 }}>{cust.name}</td>
                                  <td style={{ padding: "12px 12px", color: "#6B7280" }}>{cust.email}</td>
                                  <td style={{ padding: "12px 12px", fontWeight: 600 }}>{cust.unpaidInvoiceCount} invoices pending</td>
                                  <td style={{ padding: "12px 12px", textAlign: "right", fontWeight: 800, color: "#EF4444" }}>RS {cust.pendingBalance.toFixed(2)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} style={{ padding: "20px 12px", textAlign: "center", color: "#9CA3AF" }}>No pending credits. All customer accounts are fully paid!</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}

            {activeTab === "Performance" && (
              <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 16, padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 8px 0" }}>Technician Performance Dashboard</h2>
                <p style={{ margin: 0, fontSize: 13, color: "#6B7280", marginBottom: 24 }}>Real-time service ticket turnaround and shop floor efficiency levels</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div style={{ padding: 20, border: "1px solid #E5E7EB", borderRadius: 12 }}>
                    <h4 style={{ margin: 0, fontSize: 12, color: "#6B7280", textTransform: "uppercase" }}>Average Turnaround Time</h4>
                    <p style={{ margin: "8px 0 0 0", fontSize: 28, fontWeight: 800 }}>1.4 Hours</p>
                  </div>
                  <div style={{ padding: 20, border: "1px solid #E5E7EB", borderRadius: 12 }}>
                    <h4 style={{ margin: 0, fontSize: 12, color: "#6B7280", textTransform: "uppercase" }}>Work Orders Completed</h4>
                    <p style={{ margin: "8px 0 0 0", fontSize: 28, fontWeight: 800 }}>142 Ticket Items</p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Modal Component: Sell Parts */}
      {isSellModalOpen && (
        <SellPartsModal
          onClose={() => setIsSellModalOpen(false)}
          onSave={handleAuthorizeSale}
          dbParts={dbParts}
          dbCustomers={dbCustomers}
        />
      )}

      {/* Modal Component: Register Customer */}
      {isCrmModalOpen && (
        <RegisterCustomerModal
          onClose={() => setIsCrmModalOpen(false)}
          onSave={handleRegisterCustomer}
        />
      )}

    </div>
  );
};

export default StaffDashboard;
