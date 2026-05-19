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
  AlertTriangle 
} from 'lucide-react';
import authService from '../../services/authService';
import reportService from '../../services/reportService';
import type { 
  CustomerReportResponse, 
  HighSpenderCustomerDto, 
  RegularCustomerDto, 
  PendingCreditCustomerDto 
} from '../../services/reportService';
import { Sidebar } from '../../components/layout/Sidebar';
import { Topbar } from '../../components/layout/Topbar';

export default function StaffReports() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const [customerReport, setCustomerReport] = useState<CustomerReportResponse | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  const refreshReport = async () => {
    setLoadingReport(true);
    try {
      const res = await reportService.getCustomerReport();
      setCustomerReport(res);
    } catch (err) {
      console.error("Failed to load customer report segments:", err);
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    refreshReport();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#F9FAFB", fontFamily: "'Inter', -apple-system, sans-serif", color: "#111827", overflow: "hidden" }}>
      
      {/* Reusable premium sidebar */}
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
        
        {/* Reusable premium Topbar */}
        <Topbar
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          searchPlaceholder="Search reports..."
          notificationBadgeCount={0}
          onNotificationClick={() => alert("4 high-priority tasks pending on workshop floor.")}
          onLogoutClick={handleLogout}
          userName={user?.userName || "Marcus Thorne"}
          userRole={user?.roles?.[0] || "SERVICE LEAD"}
        />

        {/* Main Scroll Panel */}
        <div style={{ flex: 1, overflowY: "auto", padding: "40px 32px", boxSizing: "border-box" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: "-0.8px" }}>Customer Segment Analytics</h1>
                  <p style={{ margin: "8px 0 0 0", fontSize: 14, color: "#6B7280", fontWeight: 500 }}>Live segment analytics fetched from transaction history databases</p>
                </div>
                <button 
                  onClick={refreshReport}
                  style={{ padding: "10px 20px", background: "#111827", color: "#FFF", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
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

          </div>
        </div>

      </div>

    </div>
  );
}
