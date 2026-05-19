import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  Play,
  Check,
  Search,
  Sparkles,
  NotebookTabs,
  ShoppingCart
} from 'lucide-react';
import authService from '../../services/authService';
import { Sidebar } from '../../components/layout/Sidebar';
import { Topbar } from '../../components/layout/Topbar';

interface Appointment {
  id: number;
  customerName: string;
  vehicle: string;
  date: string;
  time: string;
  status: "Scheduled" | "In Progress" | "Completed";
  notes: string;
  technician: string;
}

export default function StaffAppointments() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [globalSearch, setGlobalSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Scheduled" | "In Progress" | "Completed">("All");

  // Success notifications
  const [notification, setNotification] = useState<string | null>(null);

  // Synced local state appointments
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: 1, customerName: "Elena Rossi", vehicle: "Audi A4 B9 (BA-1-PA-1234)", date: "2026-05-20", time: "09:00 AM", status: "Scheduled", notes: "Engine diagnostic checkup, persistent engine light", technician: "Marcus Thorne" },
    { id: 2, customerName: "Marcus Chen", vehicle: "Tesla Model Y (BA-1-PA-5678)", date: "2026-05-20", time: "11:30 AM", status: "In Progress", notes: "Precision wheel alignment and suspension inspection", technician: "Liam Vance" },
    { id: 3, customerName: "Sarah Jenkins", vehicle: "Ford Mustang V8 (BA-2-PA-9999)", date: "2026-05-21", time: "01:30 PM", status: "Completed", notes: "Standard annual transmission fluid replacement", technician: "Sophia Reynolds" },
    { id: 4, customerName: "Liam Vance", vehicle: "BMW M3 Sedan (BA-3-PA-8829)", date: "2026-05-22", time: "03:30 PM", status: "Scheduled", notes: "Battery electrical readout and spark plug swaps", technician: "David Kim" }
  ]);

  // Notes Modal state
  const [editingNotesId, setEditingNotesId] = useState<number | null>(null);
  const [tempNotes, setTempNotes] = useState("");

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Status transition handlers
  const handleStartService = (id: number, name: string) => {
    setAppointments(prev => prev.map(app => 
      app.id === id ? { ...app, status: "In Progress" as const } : app
    ));
    showNotification(`Started maintenance diagnostic for ${name}!`);
  };

  const handleCompleteService = (id: number, name: string) => {
    setAppointments(prev => prev.map(app => 
      app.id === id ? { ...app, status: "Completed" as const } : app
    ));
    showNotification(`Completed vehicle service work order for ${name}!`);
  };

  // Edit notes helper
  const openEditNotes = (id: number, notes: string) => {
    setEditingNotesId(id);
    setTempNotes(notes);
  };

  const saveNotes = () => {
    if (editingNotesId === null) return;
    setAppointments(prev => prev.map(app => 
      app.id === editingNotesId ? { ...app, notes: tempNotes } : app
    ));
    setEditingNotesId(null);
    showNotification("Technical notes updated successfully.");
  };

  // Filtered and Searched list
  const filteredAppointments = useMemo(() => {
    return appointments.filter(app => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        app.customerName.toLowerCase().includes(q) ||
        app.vehicle.toLowerCase().includes(q) ||
        app.notes.toLowerCase().includes(q) ||
        app.technician.toLowerCase().includes(q);

      const matchesStatus = 
        statusFilter === "All" || 
        app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchTerm, statusFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter(a => a.status === "Scheduled").length;
    const active = appointments.filter(a => a.status === "In Progress").length;
    const completed = appointments.filter(a => a.status === "Completed").length;
    return { total, pending, active, completed };
  }, [appointments]);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#F9FAFB", fontFamily: "'Inter', -apple-system, sans-serif", color: "#111827", overflow: "hidden" }}>
      
      {/* Reusable premium sidebar */}
      <Sidebar
        logoTitle="EngineCore"
        logoSubtitle="V-Series Portal"
        logoIcon={Settings}
        items={[
          { icon: LayoutDashboard, label: "Dashboard", active: false, onClick: () => navigate("/staff/dashboard") },
          { icon: ShoppingCart, label: "POS", active: false, onClick: () => navigate("/staff/pos") },
          { icon: Calendar, label: "Appointments", active: true, onClick: () => navigate("/staff/appointments") },
          { icon: BarChart3, label: "Reports", active: false, onClick: () => navigate("/staff/reports") },
          { icon: Users, label: "Customers", active: false, onClick: () => navigate("/staff/customers") }
        ]}
        footerItems={[
          { icon: Settings, label: "Settings", onClick: () => showNotification("Settings are configured at system levels.") }
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
          searchPlaceholder="Search active appointments..."
          notificationBadgeCount={0}
          onNotificationClick={() => showNotification("4 high-priority tasks pending on workshop floor.")}
          onLogoutClick={handleLogout}
          userName={user?.userName || "Marcus Thorne"}
          userRole={user?.roles?.[0] || "SERVICE LEAD"}
        />

        {/* Main Scroll Panel */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px 40px", boxSizing: "border-box" }}>
          <div style={{ maxWidth: 1400, margin: "0 auto" }}>
            
            {/* Header Greeting */}
            <div style={{ marginBottom: 36, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div>
                <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: "-0.8px" }}>Workshop Appointments</h1>
                <p style={{ margin: "8px 0 0 0", fontSize: 14, color: "#6B7280", fontWeight: 500 }}>Precision service schedule management and real-time bay status checks</p>
              </div>
              
              {/* Quick Filters */}
              <div style={{ display: "flex", gap: 8, background: "#F3F4F6", padding: 4, borderRadius: 10 }}>
                {(["All", "Scheduled", "In Progress", "Completed"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: "none",
                      fontSize: 12.5,
                      fontWeight: statusFilter === tab ? 800 : 500,
                      background: statusFilter === tab ? "#FFFFFF" : "transparent",
                      color: statusFilter === tab ? "#111827" : "#6B7280",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      boxShadow: statusFilter === tab ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Precision Diagnostic Metric Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 36 }}>
              <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 16, padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 44, height: 44, background: "#EEF2F6", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#374151" }}>
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 10.5, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Total Schedules</h4>
                  <p style={{ margin: "4px 0 0 0", fontSize: 24, fontWeight: 800 }}>{metrics.total}</p>
                </div>
              </div>

              <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 16, padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 44, height: 44, background: "#FEF3C7", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#D97706" }}>
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 10.5, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Awaiting Service</h4>
                  <p style={{ margin: "4px 0 0 0", fontSize: 24, fontWeight: 800, color: "#D97706" }}>{metrics.pending}</p>
                </div>
              </div>

              <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 16, padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 44, height: 44, background: "#EFF6FF", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB" }}>
                  <Play className="w-5 h-5" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 10.5, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Active In Bays</h4>
                  <p style={{ margin: "4px 0 0 0", fontSize: 24, fontWeight: 800, color: "#2563EB" }}>{metrics.active}</p>
                </div>
              </div>

              <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 16, padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 44, height: 44, background: "#DCFCE7", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#16A34A" }}>
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 10.5, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Finished Today</h4>
                  <p style={{ margin: "4px 0 0 0", fontSize: 24, fontWeight: 800, color: "#16A34A" }}>{metrics.completed}</p>
                </div>
              </div>
            </div>

            {/* List & Search View */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.01)" }}>
              
              {/* Search Bar */}
              <div style={{ position: "relative", marginBottom: 20 }}>
                <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }}>
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search appointments by customer name, technician, notes or license plate..."
                  style={{ width: "100%", paddingLeft: 44, paddingRight: 16, paddingTop: 12, paddingBottom: 12, border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 13.5, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                />
              </div>

              {/* Table List */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #F3F4F6", color: "#6B7280", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      <th style={{ padding: "12px 16px" }}>Time Interval</th>
                      <th style={{ padding: "12px 16px" }}>Customer / Vehicle</th>
                      <th style={{ padding: "12px 16px" }}>Diagnostic Logs & Notes</th>
                      <th style={{ padding: "12px 16px" }}>Technician</th>
                      <th style={{ padding: "12px 16px" }}>Status</th>
                      <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: 48, textAlign: "center", color: "#9CA3AF" }}>
                          No scheduled appointments found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map(app => (
                        <tr key={app.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                          <td style={{ padding: "16px 16px" }}>
                            <span style={{ fontWeight: 800, display: "block" }}>{app.time}</span>
                            <span style={{ fontSize: 11, color: "#6B7280", marginTop: 2, display: "block" }}>{app.date}</span>
                          </td>
                          <td style={{ padding: "16px 16px" }}>
                            <span style={{ fontWeight: 800, display: "block" }}>{app.customerName}</span>
                            <span style={{ fontSize: 11.5, color: "#4B5563", marginTop: 2, display: "block" }}>{app.vehicle}</span>
                          </td>
                          <td style={{ padding: "16px 16px", maxWidth: 280, color: "#4B5563", lineHeight: 1.4 }}>
                            <div>{app.notes}</div>
                            <button
                              onClick={() => openEditNotes(app.id, app.notes)}
                              style={{ border: "none", background: "none", color: "#2563EB", padding: 0, marginTop: 4, cursor: "pointer", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}
                            >
                              <NotebookTabs className="w-3 h-3" /> Edit technical notes
                            </button>
                          </td>
                          <td style={{ padding: "16px 16px", fontWeight: 600 }}>{app.technician}</td>
                          <td style={{ padding: "16px 16px" }}>
                            <span style={{
                              fontSize: 10,
                              fontWeight: 800,
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                              padding: "4px 10px",
                              borderRadius: 20,
                              background: app.status === "Scheduled" ? "#FEF3C7" : app.status === "In Progress" ? "#DBEAFE" : "#D1FAE5",
                              color: app.status === "Scheduled" ? "#D97706" : app.status === "In Progress" ? "#2563EB" : "#16A34A"
                            }}>
                              {app.status}
                            </span>
                          </td>
                          <td style={{ padding: "16px 16px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                              {app.status === "Scheduled" && (
                                <button
                                  onClick={() => handleStartService(app.id, app.customerName)}
                                  style={{ padding: "6px 12px", background: "#111827", color: "#FFF", border: "none", borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                                >
                                  <Play className="w-3 h-3 text-white fill-white" /> Start Service
                                </button>
                              )}
                              {app.status === "In Progress" && (
                                <button
                                  onClick={() => handleCompleteService(app.id, app.customerName)}
                                  style={{ padding: "6px 12px", background: "#10B981", color: "#FFF", border: "none", borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                                >
                                  <Check className="w-3.5 h-3.5" /> Complete Service
                                </button>
                              )}
                              {app.status === "Completed" && (
                                <span style={{ fontSize: 11.5, fontWeight: 700, color: "#9CA3AF" }}>✓ Work Finished</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Inline notes modifier modal */}
      {editingNotesId !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 32, width: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", boxSizing: "border-box" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px 0" }}>Edit Service Diagnostics Notes</h3>
            <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 16px 0" }}>Update technician diagnoses and repair checklists below:</p>
            <textarea
              value={tempNotes}
              onChange={e => setTempNotes(e.target.value)}
              rows={4}
              style={{ width: "100%", padding: 12, border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13.5, outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#111827" }}
            />
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button 
                onClick={() => setEditingNotesId(null)}
                style={{ flex: 1, padding: 11, border: "1.5px solid #E5E7EB", borderRadius: 8, background: "#FFFFFF", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}
              >
                Cancel
              </button>
              <button 
                onClick={saveNotes}
                style={{ flex: 1, padding: 11, background: "#111827", color: "#FFFFFF", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit" }}
              >
                Save Log
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
