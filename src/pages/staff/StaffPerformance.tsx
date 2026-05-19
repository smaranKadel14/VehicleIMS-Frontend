import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  LayoutDashboard, 
  Users, 
  Activity, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  ShieldCheck, 
  Award,
  Zap
} from 'lucide-react';
import authService from '../../services/authService';
import { Sidebar } from '../../components/layout/Sidebar';
import { Topbar } from '../../components/layout/Topbar';

const TECHNICIAN_LEADERBOARD = [
  { rank: 1, name: "Marcus Thorne", role: "Service Lead", completed: 48, rating: "4.9/5", efficiency: "98.4%", badge: "Top Performer" },
  { rank: 2, name: "Liam Vance", role: "Suspension Spec", completed: 42, rating: "4.8/5", efficiency: "96.2%", badge: "Expert" },
  { rank: 3, name: "Sophia Reynolds", role: "Electrical Expert", completed: 39, rating: "4.8/5", efficiency: "95.1%", badge: "Expert" },
  { rank: 4, name: "David Kim", role: "Transmission Tech", completed: 35, rating: "4.7/5", efficiency: "92.8%", badge: "Solid" },
];

export default function StaffPerformance() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [globalSearch, setGlobalSearch] = useState("");

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
          { icon: Activity, label: "Performance", active: true, onClick: () => navigate("/staff/performance") },
          { icon: BarChart3, label: "Reports", active: false, onClick: () => navigate("/staff/reports") },
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
          searchPlaceholder="Search performance metrics..."
          notificationBadgeCount={0}
          onNotificationClick={() => alert("4 high-priority tasks pending on workshop floor.")}
          onLogoutClick={handleLogout}
          userName={user?.userName || "Marcus Thorne"}
          userRole={user?.roles?.[0] || "SERVICE LEAD"}
        />

        {/* Main Scroll Panel */}
        <div style={{ flex: 1, overflowY: "auto", padding: "40px 32px", boxSizing: "border-box" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            
            <div style={{ marginBottom: 36 }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: "-0.8px" }}>Technician Performance</h1>
              <p style={{ margin: "8px 0 0 0", fontSize: 14, color: "#6B7280", fontWeight: 500 }}>Real-time service ticket turnaround and shop floor efficiency levels</p>
            </div>

            {/* Performance Metric Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 36 }}>
              <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 16, padding: 24, display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ width: 48, height: 48, background: "#F3F4F6", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Clock className="w-6 h-6 text-gray-800" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Average Turnaround Time</h4>
                  <p style={{ margin: "4px 0 0 0", fontSize: 28, fontWeight: 800 }}>1.4 Hours</p>
                </div>
              </div>

              <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 16, padding: 24, display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ width: 48, height: 48, background: "#F3F4F6", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCircle className="w-6 h-6 text-gray-800" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Work Orders Completed</h4>
                  <p style={{ margin: "4px 0 0 0", fontSize: 28, fontWeight: 800 }}>142 Ticket Items</p>
                </div>
              </div>
            </div>

            {/* Leaderboard Section */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <Award className="w-5 h-5 text-yellow-500" />
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Active Workshop Leaderboard</h3>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #F3F4F6", color: "#6B7280" }}>
                      <th style={{ padding: "10px 12px", width: 60 }}>Rank</th>
                      <th style={{ padding: "10px 12px" }}>Technician</th>
                      <th style={{ padding: "10px 12px" }}>Role</th>
                      <th style={{ padding: "10px 12px", textAlign: "center" }}>Tickets Fixed</th>
                      <th style={{ padding: "10px 12px", textAlign: "center" }}>CSAT Rating</th>
                      <th style={{ padding: "10px 12px", textAlign: "right" }}>Efficiency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TECHNICIAN_LEADERBOARD.map((tech) => (
                      <tr key={tech.rank} style={{ borderBottom: "1px solid #F3F4F6" }}>
                        <td style={{ padding: "14px 12px", fontWeight: 800 }}>#{tech.rank}</td>
                        <td style={{ padding: "14px 12px" }}>
                          <span style={{ fontWeight: 700, display: "block" }}>{tech.name}</span>
                          <span style={{ fontSize: 10, color: "#10B981", fontWeight: 700, background: "#E6F4EA", padding: "1px 6px", borderRadius: 4, display: "inline-block", marginTop: 2 }}>{tech.badge}</span>
                        </td>
                        <td style={{ padding: "14px 12px", color: "#6B7280" }}>{tech.role}</td>
                        <td style={{ padding: "14px 12px", textAlign: "center", fontWeight: 700 }}>{tech.completed} orders</td>
                        <td style={{ padding: "14px 12px", textAlign: "center", fontWeight: 700, color: "#F59E0B" }}>{tech.rating}</td>
                        <td style={{ padding: "14px 12px", textAlign: "right", fontWeight: 800, color: "#111827" }}>{tech.efficiency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
