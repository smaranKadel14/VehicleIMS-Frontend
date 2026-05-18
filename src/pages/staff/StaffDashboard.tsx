import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FC } from 'react';
import { 
  Search, 
  ShoppingCart, 
  UserPlus, 
  Car, 
  X, 
  Sparkles
} from 'lucide-react';
import authService from '../../services/authService';

// Types & Interfaces
interface ActivityLog {
  id: string;
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

const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: "act-1",
    customerName: "Elena Rossi",
    actionText: "purchased",
    targetObject: "Clutch Assembly Kit",
    subtext: "Invoice #INV-92831 • Amount: $420.00",
    badges: ["PAID", "IN STOCK"],
    time: "2 MIN AGO",
    type: "purchase"
  },
  {
    id: "act-2",
    customerName: "Marcus Chen",
    actionText: "requested a",
    targetObject: "Core Refund",
    subtext: "Order #ORD-112 • Part: Turbocharger Core",
    badges: ["PENDING REVIEW"],
    time: "14 MIN AGO",
    type: "refund"
  },
  {
    id: "act-3",
    customerName: "Sarah Jenkins",
    actionText: "booked",
    targetObject: "Brake Inspection",
    subtext: "Scheduled for Tomorrow • 09:30 AM",
    badges: [],
    time: "45 MIN AGO",
    type: "booking"
  }
];

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
  { icon: "⊞", label: "Dashboard", active: true },
  { icon: "📦", label: "Inventory" },
  { icon: "🔧", label: "Work Orders" },
  { icon: "🚚", label: "Logistics" },
  { icon: "👥", label: "Customers" },
  { icon: "📊", label: "Analytics" },
];

const StaffDashboard: FC = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  // Primary States
  const [activeTab, setActiveTab] = useState<"Overview" | "Performance" | "Reports">("Overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [activities, setActivities] = useState<ActivityLog[]>(INITIAL_ACTIVITIES);
  const [customersServed, setCustomersServed] = useState(42);
  const [todaySales, setTodaySales] = useState(14280.50);
  const [pendingCredits] = useState(18);

  // Modals & Interactivity States
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isCrmModalOpen, setIsCrmModalOpen] = useState(false);
  
  // Custom Success Notifications
  const [notification, setNotification] = useState<string | null>(null);

  // Form states for Sell Parts POS
  const [posData, setPosData] = useState({
    partName: "Clutch Assembly Kit",
    price: 420.00,
    quantity: 1,
    customerName: "Elena Rossi",
    discount: 0
  });

  // Form states for Register Customer CRM
  const [crmData, setCrmData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: ""
  });

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

  // Submit handlers
  const handleAuthorizeSale = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = (posData.price * posData.quantity * (1 - posData.discount / 100));
    
    // Add to sales metric
    setTodaySales(prev => prev + finalAmount);
    
    // Add to activity list
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      customerName: posData.customerName,
      actionText: "purchased",
      targetObject: posData.partName,
      subtext: `Invoice #INV-${Math.floor(10000 + Math.random() * 90000)} • Amount: $${finalAmount.toFixed(2)}`,
      badges: ["PAID", "IN STOCK"],
      time: "JUST NOW",
      type: "purchase"
    };

    setActivities(prev => [newLog, ...prev]);
    setIsSellModalOpen(false);
    showNotification(`Invoice authorized! $${finalAmount.toFixed(2)} added to sales log.`);
    
    // Reset POS form
    setPosData({
      partName: "Clutch Assembly Kit",
      price: 420.00,
      quantity: 1,
      customerName: "Elena Rossi",
      discount: 0
    });
  };

  const handleRegisterCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!crmData.firstName || !crmData.lastName || !crmData.email) return;

    const fullName = `${crmData.firstName} ${crmData.lastName}`;
    
    // Update KPI metrics
    setCustomersServed(prev => prev + 1);

    // Add to activity list
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      customerName: fullName,
      actionText: "registered a",
      targetObject: "CRM profile",
      subtext: `Account created for ${crmData.email} • Mobile: ${crmData.phone || 'N/A'}`,
      badges: ["VERIFIED"],
      time: "JUST NOW",
      type: "booking"
    };

    setActivities(prev => [newLog, ...prev]);
    setIsCrmModalOpen(false);
    showNotification(`Registered customer "${fullName}" successfully!`);

    // Reset CRM Form
    setCrmData({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      address: ""
    });
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#F9FAFB", fontFamily: "'Inter', -apple-system, sans-serif", color: "#111827", overflow: "hidden", position: "relative" }}>
      
      {/* ── Left Navigation Sidebar (Standard Project Style) ── */}
      <aside style={{ width: 240, background: "#1a1a1a", display: "flex", flexDirection: "column", flexShrink: 0, height: "100vh" }}>
        
        {/* Sidebar Brand Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #2a2a2a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚙️</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#fff", letterSpacing: "-0.3px" }}>EngineCore</div>
              <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 500, letterSpacing: "0.04em" }}>V-Series Portal</div>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation Items */}
        <nav style={{ flex: 1, padding: "12px 0" }}>
          {NAV_ITEMS.map(({ icon, label, active }) => (
            <div
              key={label}
              onClick={() => {
                if (label === "Dashboard") navigate("/staff-dashboard");
                if (label === "Customers") navigate("/customers");
                if (label === "Inventory") navigate("/inventory");
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
              <span style={{ fontSize: 15, opacity: active ? 1 : 0.7 }}>{icon}</span>
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
            <span style={{ fontSize: 15 }}>⚙️</span> Settings
          </div>
          <div
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", color: "#9ca3af", fontSize: 13.5, cursor: "pointer" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#9ca3af"; }}
            onClick={handleLogout}
          >
            <span style={{ fontSize: 15 }}>↪</span> Sign Out
          </div>
        </div>
      </aside>

      {/* ── Right Content Area (With Topbar + Main Scroll Panel) ── */}
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
              style={{ fontSize: 18, cursor: "pointer", color: "#374151" }}
            >
              🔔
            </span>
            
            {/* Gear Settings */}
            <span 
              onClick={handleLogout}
              style={{ fontSize: 18, cursor: "pointer", color: "#374151" }}
              title="Sign Out"
            >
              ⚙️
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

        {/* ── Main Scroll Panel ── */}
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

            {/* ── KPI Metric Cards Row (4 Columns) ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 36 }}>
              
              {/* Card 1: Today's Sales */}
              <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderLeft: "4px solid #111827", borderRadius: 12, padding: "20px 24px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>Today's Sales</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 12 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>
                    ${todaySales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                  <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>{pendingCredits}</span>
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

            {/* ── Main Dashboard Split Columns ── */}
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

            {/* ── Customer Activity Feed Panel (Bottom Column) ── */}
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
                      <div style={{ width: 42, height: 42, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                        {act.type === "purchase" ? "📦" : act.type === "refund" ? "🔄" : "📅"}
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

                    <div style={{ fontSize: 10.5, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.05em" }}>
                      {act.time}
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ── Modal Component: Sell Parts (POS Terminal Overlay) ── */}
      {isSellModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 32, width: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Authorize POS Part Sale</h3>
              <button onClick={() => setIsSellModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAuthorizeSale} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Select Part Component</label>
                <select 
                  value={posData.partName}
                  onChange={e => {
                    const price = e.target.value === "Clutch Assembly Kit" ? 420.00 : e.target.value === "V6 Piston Kit" ? 280.00 : 120.00;
                    setPosData(prev => ({ ...prev, partName: e.target.value, price }));
                  }}
                  style={{ width: "100%", padding: 11, border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13.5, background: "#FFFFFF", outline: "none" }}
                >
                  <option value="Clutch Assembly Kit">Clutch Assembly Kit ($420.00)</option>
                  <option value="V6 Piston Kit">V6 Piston Kit ($280.00)</option>
                  <option value="Heavy Duty Brake Pads">Heavy Duty Brake Pads ($120.00)</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Quantity</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={20}
                    value={posData.quantity}
                    onChange={e => setPosData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    style={{ width: "100%", padding: 11, border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13.5, outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Discount (%)</label>
                  <select 
                    value={posData.discount}
                    onChange={e => setPosData(prev => ({ ...prev, discount: parseInt(e.target.value) }))}
                    style={{ width: "100%", padding: 11, border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13.5, background: "#FFFFFF", outline: "none", boxSizing: "border-box" }}
                  >
                    <option value={0}>0% (None)</option>
                    <option value={5}>5% Off</option>
                    <option value={10}>10% Off</option>
                    <option value={20}>20% Special</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Customer Name</label>
                <input 
                  type="text" 
                  value={posData.customerName}
                  onChange={e => setPosData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="e.g. Elena Rossi"
                  style={{ width: "100%", padding: 11, border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13.5, outline: "none", boxSizing: "border-box" }}
                  required
                />
              </div>

              {/* POS Summary */}
              <div style={{ padding: 16, background: "#F9FAFB", borderRadius: 10, marginTop: 8, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "#6B7280" }}>Subtotal:</span>
                  <span style={{ fontWeight: 700 }}>${(posData.price * posData.quantity).toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "#6B7280" }}>Discount Applied:</span>
                  <span style={{ fontWeight: 700, color: "#EF4444" }}>-${((posData.price * posData.quantity) * (posData.discount / 100)).toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #E5E7EB", paddingTop: 8, fontSize: 14, fontWeight: 800 }}>
                  <span>Total Amount:</span>
                  <span>${(posData.price * posData.quantity * (1 - posData.discount / 100)).toFixed(2)}</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                <button type="button" onClick={() => setIsSellModalOpen(false)} style={{ flex: 1, padding: 12, border: "1.5px solid #E5E7EB", borderRadius: 8, background: "#FFFFFF", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: 12, background: "#111827", color: "#FFFFFF", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit" }}>Authorize Access</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Component: Register Customer (CRM Overlay) ── */}
      {isCrmModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 32, width: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Register CRM Customer</h3>
              <button onClick={() => setIsCrmModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleRegisterCustomer} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>First Name *</label>
                  <input 
                    type="text" 
                    value={crmData.firstName}
                    onChange={e => setCrmData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="e.g. John"
                    style={{ width: "100%", padding: 11, border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13.5, outline: "none", boxSizing: "border-box" }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Last Name *</label>
                  <input 
                    type="text" 
                    value={crmData.lastName}
                    onChange={e => setCrmData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="e.g. Doe"
                    style={{ width: "100%", padding: 11, border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13.5, outline: "none", boxSizing: "border-box" }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Email Address *</label>
                <input 
                  type="email" 
                  value={crmData.email}
                  onChange={e => setCrmData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="e.g. john.doe@mail.com"
                  style={{ width: "100%", padding: 11, border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13.5, outline: "none", boxSizing: "border-box" }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Phone Number</label>
                <input 
                  type="text" 
                  value={crmData.phone}
                  onChange={e => setCrmData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="e.g. 555-0100"
                  style={{ width: "100%", padding: 11, border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13.5, outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Home Address</label>
                <input 
                  type="text" 
                  value={crmData.address}
                  onChange={e => setCrmData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="e.g. 128 Fleet Way, Sector 4"
                  style={{ width: "100%", padding: 11, border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13.5, outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                <button type="button" onClick={() => setIsCrmModalOpen(false)} style={{ flex: 1, padding: 12, border: "1.5px solid #E5E7EB", borderRadius: 8, background: "#FFFFFF", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: 12, background: "#111827", color: "#FFFFFF", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit" }}>Create CRM Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StaffDashboard;
