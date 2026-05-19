import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  LayoutDashboard, 
  Users, 
  Activity, 
  BarChart3, 
  Gem, 
  RefreshCw, 
  AlertTriangle,
  Download,
  CreditCard,
  FileText
} from 'lucide-react';
import authService from '../../services/authService';
import reportService from '../../services/reportService';
import type { 
  CustomerReportResponse, 
  HighSpenderCustomerDto, 
  RegularCustomerDto, 
  PendingCreditCustomerDto,
  FinancialReportResponse
} from '../../services/reportService';
import purchaseService from '../../services/purchaseService';
import { Sidebar } from '../../components/layout/Sidebar';
import { Topbar } from '../../components/layout/Topbar';
import { MetricCard } from '../../components/ui/MetricCard';

export default function StaffReports() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  // Tab Control
  const [activeTab, setActiveTab] = useState<'financial' | 'segments'>('financial');

  // Customer Segments State
  const [customerReport, setCustomerReport] = useState<CustomerReportResponse | null>(null);
  const [loadingSegments, setLoadingSegments] = useState(false);

  // Financial Reports State
  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [financialData, setFinancialData] = useState<FinancialReportResponse | null>(null);
  const [purchaseCost, setPurchaseCost] = useState<number>(0);
  const [pendingPurchasesCount, setPendingPurchasesCount] = useState<number>(0);
  const [loadingFinancial, setLoadingFinancial] = useState(false);

  const [globalSearch, setGlobalSearch] = useState("");

  // Fetch functions
  const fetchSegments = async () => {
    setLoadingSegments(true);
    try {
      const res = await reportService.getCustomerReport();
      setCustomerReport(res);
    } catch (err) {
      console.error("Failed to load customer report segments:", err);
    } finally {
      setLoadingSegments(false);
    }
  };

  const fetchFinancials = async () => {
    setLoadingFinancial(true);
    try {
      const finReport = await reportService.getFinancialReport(reportType);
      setFinancialData(finReport);

      // Fetch purchase costs
      const purchases = await purchaseService.getAll();
      const totalCost = purchases.reduce((sum, p) => sum + p.finalTotal, 0);
      setPurchaseCost(totalCost);
      setPendingPurchasesCount(purchases.length);
    } catch (err) {
      console.error("Failed to load financial report details:", err);
    } finally {
      setLoadingFinancial(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'segments') {
      fetchSegments();
    } else {
      fetchFinancials();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, reportType]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const handleExportCSV = () => {
    if (!financialData) {
      alert("No financial data loaded to export!");
      return;
    }

    // Construct CSV Rows
    const rows = [
      ["EngineCore Financial Report Export"],
      [`Selected Interval`, reportType.toUpperCase()],
      [`Date Range Filter`, `${startDate} to ${endDate}`],
      [],
      ["METRICS", "AMOUNT (RS)"],
      ["Total Revenue", (financialData.totalRevenue || 0).toFixed(2)],
      ["Operational Expenses", purchaseCost.toFixed(2)],
      ["Net Profit", (financialData.netProfit || 0).toFixed(2)],
      [],
      ["PART COMPONENT", "QUANTITY SOLD", "REVENUE GENERATED (RS)"],
      ...financialData.popularParts.map(p => [
        p.name,
        p.quantitySold,
        p.revenueGenerated.toFixed(2)
      ])
    ];

    const csvContent = rows
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `EngineCore_Financial_Report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#F9FAFB", fontFamily: "'Inter', -apple-system, sans-serif", color: "#111827", overflow: "hidden" }}>
      
      {/* Sidebar */}
      <Sidebar
        logoTitle="EngineCore"
        logoSubtitle="V-Series Portal"
        logoIcon={Settings}
        items={[
          { icon: LayoutDashboard, label: "Dashboard", active: false, onClick: () => navigate("/staff/dashboard") },
          { icon: Activity, label: "Performance", active: false, onClick: () => navigate("/staff/performance") },
          { icon: BarChart3, label: "Reports", active: true, onClick: () => navigate("/staff/reports") },
          { icon: Users, label: "Customers", active: false, onClick: () => navigate("/staff/customers") }
        ]}
        footerItems={[
          { icon: Settings, label: "Settings", onClick: () => alert("Settings options are managed in your account panel.") }
        ]}
        handleLogout={handleLogout}
      />

      {/* Right Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* Topbar */}
        <Topbar
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          searchPlaceholder="Search reports..."
          notificationBadgeCount={0}
          onNotificationClick={() => alert("All ledger streams verified.")}
          onLogoutClick={handleLogout}
          userName={user?.userName || "Marcus Thorne"}
          userRole={user?.roles?.[0] || "SERVICE LEAD"}
        />

        {/* Main Scroll Panel */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 32px 40px", boxSizing: "border-box" }}>
          <div style={{ maxWidth: 1400, margin: "0 auto" }}>
            
            {/* Page Header Title */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: "-0.8px" }}>
                {activeTab === 'financial' ? "Financial Reports" : "Customer Segment Analytics"}
              </h1>
              <p style={{ margin: "8px 0 0 0", fontSize: 14, color: "#6B7280", fontWeight: 500 }}>
                {activeTab === 'financial' 
                  ? "Comprehensive overview of engine parts revenue and operational expenses." 
                  : "Live segment analytics fetched from transaction history databases"}
              </p>
            </div>

            {/* Switcher Tabs */}
            <div style={{ display: "flex", gap: 8, background: "#E5E7EB", padding: 4, borderRadius: 12, width: "fit-content", marginBottom: 32 }}>
              <button 
                onClick={() => setActiveTab('financial')}
                style={{
                  padding: "10px 22px",
                  borderRadius: 10,
                  border: "none",
                  background: activeTab === 'financial' ? "#FFFFFF" : "transparent",
                  color: activeTab === 'financial' ? "#111827" : "#4B5563",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  boxShadow: activeTab === 'financial' ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                  transition: "all 0.2s"
                }}
              >
                Financial Analytics
              </button>
              <button 
                onClick={() => setActiveTab('segments')}
                style={{
                  padding: "10px 22px",
                  borderRadius: 10,
                  border: "none",
                  background: activeTab === 'segments' ? "#FFFFFF" : "transparent",
                  color: activeTab === 'segments' ? "#111827" : "#4B5563",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  boxShadow: activeTab === 'segments' ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                  transition: "all 0.2s"
                }}
              >
                Customer Segments
              </button>
            </div>

            {activeTab === 'financial' ? (
              // TAB 1: FINANCIAL REPORTS VIEW
              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                
                {/* Title and Controls */}
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    
                    {/* Period selectors */}
                    <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", padding: 3, borderRadius: 10, display: "flex", gap: 2 }}>
                      {(['daily', 'monthly', 'yearly'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setReportType(type)}
                          style={{
                            padding: "6px 14px",
                            border: "none",
                            background: reportType === type ? "#111827" : "transparent",
                            color: reportType === type ? "#FFFFFF" : "#6B7280",
                            fontSize: 11,
                            fontWeight: 700,
                            borderRadius: 8,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            transition: "all 0.2s"
                          }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    {/* Date range picker for CSV export */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#FFFFFF", border: "1px solid #E5E7EB", padding: "6px 16px", borderRadius: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: "#6B7280", letterSpacing: "0.03em" }}>FROM:</span>
                        <input 
                          type="date" 
                          value={startDate} 
                          onChange={(e) => setStartDate(e.target.value)} 
                          style={{ border: "none", fontSize: 12, fontWeight: 700, color: "#111827", outline: "none", fontFamily: "inherit", cursor: "pointer" }}
                        />
                      </div>
                      <div style={{ width: 1, height: 16, background: "#E5E7EB" }}></div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: "#6B7280", letterSpacing: "0.03em" }}>TO:</span>
                        <input 
                          type="date" 
                          value={endDate} 
                          onChange={(e) => setEndDate(e.target.value)} 
                          style={{ border: "none", fontSize: 12, fontWeight: 700, color: "#111827", outline: "none", fontFamily: "inherit", cursor: "pointer" }}
                        />
                      </div>
                    </div>

                    <button 
                      onClick={handleExportCSV}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#111827", color: "#FFFFFF", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
                    >
                      <Download className="w-3.5 h-3.5" /> Export CSV
                    </button>

                  </div>
                </div>

                {loadingFinancial && !financialData ? (
                  <div style={{ padding: "80px 0", textAlign: "center", fontSize: 14, color: "#6B7280", fontWeight: 500 }}>
                    Assembling financial metrics and chart indexes...
                  </div>
                ) : (
                  <>
                    {/* Stats Metrics Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
                      <MetricCard
                        title="Total Revenue"
                        value={`RS ${(financialData?.totalRevenue || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                        trend="+12.4%"
                        trendColor="success"
                        icon={CreditCard}
                      />
                      <MetricCard
                        title="Operational Expenses"
                        value={`RS ${purchaseCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                        subtext={`${pendingPurchasesCount} purchases logged`}
                        trend="-3.1%"
                        trendColor="danger"
                        icon={FileText}
                      />
                      <MetricCard
                        title="Net Profit Margin"
                        value="67.6%"
                        trend="+2.1%"
                        trendColor="success"
                        icon={BarChart3}
                      />
                    </div>

                    {/* Popular Parts Contribution Telemetry Chart */}
                    <div style={{ background: "#FFFFFF", borderRadius: 24, border: "1px solid #E5E7EB", padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36 }}>
                        <div>
                          <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Revenue vs. Expense Trends</h3>
                          <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>DAILY COMPARISON FOR CURRENT PERIOD</p>
                        </div>
                        <div style={{ display: "flex", gap: 16 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 10, height: 10, background: "#111827", borderRadius: "50%" }}></div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#4B5563" }}>Revenue</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 10, height: 10, background: "#9CA3AF", borderRadius: "50%" }}></div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#4B5563" }}>Expense</span>
                          </div>
                        </div>
                      </div>

                      {/* Telemetry Visual Parts Chart */}
                      <div style={{ height: 260, display: "flex", alignItems: "end", justifyContent: "space-around", padding: "0 24px 10px", borderBottom: "1.5px solid #F3F4F6", position: "relative" }}>
                        {financialData && financialData.popularParts && financialData.popularParts.length > 0 ? (
                          financialData.popularParts.slice(0, 6).map((part) => {
                            const maxRevenue = Math.max(...financialData.popularParts.map(p => p.revenueGenerated), 1);
                            const percent = Math.max(12, Math.min(100, (part.revenueGenerated / maxRevenue) * 100));
                            return (
                              <div key={part.partId} style={{ display: "flex", flexDirection: "column", gap: 8, width: "auto", alignItems: "center" }}>
                                <div style={{ height: 180, display: "flex", alignItems: "end", justifyContent: "center", width: 80, position: "relative" }}>
                                  <div 
                                    style={{ 
                                      width: 44, 
                                      height: `${percent}%`, 
                                      background: "#111827", 
                                      borderRadius: "6px 6px 0 0", 
                                      position: "relative",
                                      transition: "all 0.3s ease",
                                      cursor: "pointer"
                                    }}
                                    title={`Sold: ${part.quantitySold} | Rev: RS ${part.revenueGenerated.toLocaleString()}`}
                                  >
                                    <div style={{ position: "absolute", bottom: "105%", left: "50%", transform: "translateX(-50%)", background: "#111827", color: "#FFF", fontSize: 9, fontWeight: 700, padding: "3px 6px", borderRadius: 4, whiteSpace: "nowrap" }}>
                                      RS {part.revenueGenerated.toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                                <span style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", maxWidth: 88, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {part.name}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#9CA3AF", fontWeight: 600 }}>
                            No invoice records available for this telemetry period.
                          </div>
                        )}
                      </div>

                      {/* X-Axis dates */}
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px 0", fontSize: 9.5, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        <span>01 Oct</span>
                        <span>05 Oct</span>
                        <span>10 Oct</span>
                        <span>15 Oct</span>
                        <span>20 Oct</span>
                        <span>25 Oct</span>
                        <span>30 Oct</span>
                      </div>

                    </div>
                  </>
                )}

              </div>
            ) : (
              // TAB 2: CUSTOMER SEGMENTS VIEW
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                  <button 
                    onClick={() => navigate("/staff/customers")}
                    style={{ padding: "10px 20px", background: "#FFFFFF", color: "#111827", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
                  >
                    View Customer Directory
                  </button>
                  <button 
                    onClick={fetchSegments}
                    style={{ padding: "10px 20px", background: "#111827", color: "#FFF", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {loadingSegments ? "Analyzing..." : "Refresh Segments"}
                  </button>
                </div>

                {loadingSegments && !customerReport ? (
                  <div style={{ padding: "40px 0", textAlign: "center", fontSize: 14, color: "#6B7280", fontWeight: 500 }}>
                    Fetching financial ledger details...
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 24 }}>
                    
                    {/* Segment 1: High Spenders */}
                    <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 20, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Gem className="w-5 h-5 text-amber-500" />
                          </div>
                          <div>
                            <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>High Spenders ({customerReport?.highSpenders?.length || 0})</h3>
                            <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>Top revenue contributors</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ maxHeight: 320, overflowY: "auto", paddingRight: 4 }}>
                        {customerReport?.highSpenders && customerReport.highSpenders.length > 0 ? (
                          customerReport.highSpenders.map((cust: HighSpenderCustomerDto) => (
                            <div key={cust.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #F3F4F6" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#111827" }}>
                                  {cust.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{cust.name}</span>
                                  <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>{cust.email}</span>
                                </div>
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 800, color: "#10B981" }}>
                                RS {cust.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: "32px 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#9CA3AF", fontWeight: 600, textAlign: "center" }}>
                            No high spender customers found.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Segment 2: Regular Customers */}
                    <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 20, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <RefreshCw className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Regular Customers ({customerReport?.regulars?.length || 0})</h3>
                            <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>Most frequent buyers</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ maxHeight: 320, overflowY: "auto", paddingRight: 4 }}>
                        {customerReport?.regulars && customerReport.regulars.length > 0 ? (
                          customerReport.regulars.map((cust: RegularCustomerDto) => (
                            <div key={cust.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #F3F4F6" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#111827" }}>
                                  {cust.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{cust.name}</span>
                                  <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>{cust.email}</span>
                                </div>
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 700, color: "#3B82F6", background: "#EFF6FF", padding: "4px 8px", borderRadius: 20 }}>
                                {cust.purchaseCount} purchases
                              </span>
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: "32px 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#9CA3AF", fontWeight: 600, textAlign: "center" }}>
                            No regular customers found.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Segment 3: Pending Credits */}
                    <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 20, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                          </div>
                          <div>
                            <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Pending Credits ({customerReport?.pendingCredits?.length || 0})</h3>
                            <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>Outstanding balances</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ maxHeight: 320, overflowY: "auto", paddingRight: 4 }}>
                        {customerReport?.pendingCredits && customerReport.pendingCredits.length > 0 ? (
                          customerReport.pendingCredits.map((cust: PendingCreditCustomerDto) => (
                            <div key={cust.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #F3F4F6" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#111827" }}>
                                  {cust.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{cust.name}</span>
                                  <span style={{ fontSize: 10.5, color: "#EF4444", fontWeight: 600 }}>{cust.unpaidInvoiceCount} unpaid invoice(s)</span>
                                </div>
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 800, color: "#EF4444" }}>
                                RS {cust.pendingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: "32px 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#10B981", fontWeight: 600, textAlign: "center" }}>
                            No pending credit customers found.
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
