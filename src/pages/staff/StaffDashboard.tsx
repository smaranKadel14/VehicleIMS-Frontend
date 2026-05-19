import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FC } from 'react';
import { 
  Search, 
  ShoppingCart, 
  UserPlus, 
  Car, 
  Sparkles,
  LayoutDashboard,
  Users,
  Settings,
  Package,
  RefreshCw,
  Calendar,
  AlertTriangle,
  Mail,
  Activity,
  BarChart3
} from 'lucide-react';
import authService from '../../services/authService';
import partService from '../../services/partService';
import customerService from '../../services/customerService';
import salesService from '../../services/salesService';
import reportService from '../../services/reportService';
import type { PartResponse } from '../../services/partService';
import type { CustomerResponse } from '../../services/customerService';

// Import modularized components
import SellPartsModal from '../../components/staff/SellPartsModal';
import RegisterCustomerModal from '../../components/staff/RegisterCustomerModal';

// Shared global components
import { Sidebar } from '../../components/layout/Sidebar';
import { Topbar } from '../../components/layout/Topbar';
import { MetricCard } from '../../components/ui/MetricCard';

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

const StaffDashboard: FC = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

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

    refreshDashboardStats();
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
      
      {/* Reusable premium sidebar */}
      <Sidebar
        logoTitle="EngineCore"
        logoSubtitle="V-Series Portal"
        logoIcon={Settings}
        items={[
          { icon: LayoutDashboard, label: "Dashboard", active: true, onClick: () => navigate("/staff/dashboard") },
          { icon: Activity, label: "Performance", active: false, onClick: () => navigate("/staff/performance") },
          { icon: BarChart3, label: "Reports", active: false, onClick: () => navigate("/staff/reports") },
          { icon: Users, label: "Customers", active: false, onClick: () => navigate("/staff/customers") }
        ]}
        footerItems={[
          { icon: Settings, label: "Settings", onClick: () => showNotification("Settings options are managed in your account panel.") }
        ]}
        handleLogout={handleLogout}
      />

      {/* Right Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* Floating Success Notifications */}
        {notification && (
          <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", background: "#111827", color: "#FFF", padding: "14px 28px", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.15)", zIndex: 10000, display: "flex", alignItems: "center", gap: 10, animation: "fadeIn 0.2s ease" }}>
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>{notification}</span>
          </div>
        )}

        {/* Reusable premium Topbar */}
        <Topbar
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          searchPlaceholder="Search customer, vehicle, or VIN..."
          notificationBadgeCount={0}
          onNotificationClick={() => showNotification("4 high-priority tasks pending on workshop floor.")}
          onLogoutClick={handleLogout}
          userName={user?.userName || "Marcus Thorne"}
          userRole={user?.roles?.[0] || "SERVICE LEAD"}
        />

        {/* Main Scroll Panel */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px 40px", boxSizing: "border-box" }}>
          
          <div style={{ maxWidth: 1400, margin: "0 auto" }}>
            
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
              <MetricCard
                title="Today's Sales"
                value={`RS ${todaySales.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                trend="+12%"
                trendColor="success"
                icon={ShoppingCart}
              />
              <MetricCard
                title="Customers Served"
                value={customersServed}
                subtext="vs 38 yesterday"
                icon={Users}
              />
              <MetricCard
                title="Pending Credits"
                value={pendingCreditsCount}
                subtext="Awaiting Auth"
                icon={AlertTriangle}
              />
              <MetricCard
                title="Appointments"
                value={7}
                trend="3 Critical"
                trendColor="danger"
                icon={Calendar}
              />
            </div>

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
