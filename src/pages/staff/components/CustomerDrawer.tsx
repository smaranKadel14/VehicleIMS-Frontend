import { useState, useEffect } from "react";
import { Car, Edit3, Trash2 } from "lucide-react";
import customerService from "../../../services/customerService";
import type { CustomerHistoryResponse } from "../../../services/customerService";
import type { Customer } from "../CustomerDirectory";

interface CustomerDrawerProps {
  customer: Customer;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CustomerDrawer({
  customer,
  onClose,
  onEdit,
  onDelete,
}: CustomerDrawerProps) {
  const [history, setHistory] = useState<CustomerHistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    customerService.getHistory(customer.id)
      .then(res => setHistory(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [customer.id]);

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 200 }} onClick={onClose} />
      <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 360, background: "#fff", boxShadow: "-8px 0 40px rgba(0,0,0,0.12)", zIndex: 300, padding: 28, overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <span style={{ fontWeight: 800, fontSize: 16 }}>Customer Details</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#6b7280" }}>✕</button>
        </div>

        {/* Avatar + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ width: 56, height: 56, background: "#111", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff" }}>{customer.initials}</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>{customer.name}</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 3 }}>{customer.phone}</div>
            <span style={{ background: customer.status === "Active" ? "#dcfce7" : "#f3f4f6", color: customer.status === "Active" ? "#16a34a" : "#9ca3af", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, display: "inline-block", marginTop: 6 }}>
              {customer.status}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          {[
            { label: "TOTAL REVENUE", value: loading ? "Loading..." : `RS ${(history?.totalSpent || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
            { label: "VEHICLES",      value: String(customer.vehicles) },
            { label: "SERVICES RUN",   value: loading ? "Loading..." : String(history?.totalServices || 0) },
            { label: "CUSTOMER ID",   value: `#CUS-${String(customer.id).padStart(4, "0")}` },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "#f9fafb", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Vehicle Plates */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", letterSpacing: "0.06em", marginBottom: 10 }}>REGISTERED VEHICLES</div>
          {customer.vehiclePlates.length === 0 && (
            <p style={{ fontSize: 13, color: "#9ca3af" }}>No vehicles registered.</p>
          )}
          {customer.vehiclePlates.map((plate) => (
            <div key={plate} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#f9fafb", borderRadius: 8, marginBottom: 8 }}>
              <Car className="w-4 h-4 text-gray-500" />
              <span style={{ fontWeight: 600, fontSize: 13, fontFamily: "monospace" }}>{plate}</span>
            </div>
          ))}
        </div>

        {/* Sales & Service History */}
        {!loading && history && (
          <div style={{ marginBottom: 24, borderTop: "1px solid #f3f4f6", paddingTop: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", letterSpacing: "0.06em", marginBottom: 10 }}>RECENT INVOICES</div>
            {history.salesInvoices.length === 0 ? (
              <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16 }}>No invoices recorded.</p>
            ) : (
              history.salesInvoices.slice(0, 3).map((inv) => (
                <div key={inv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#f9fafb", borderRadius: 8, marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{inv.invoiceNumber}</span>
                    <span style={{ fontSize: 10, color: "#9ca3af", display: "block" }}>{new Date(inv.date).toLocaleDateString()}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800 }}>RS {inv.totalAmount.toLocaleString()}</span>
                </div>
              ))
            )}

            <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", letterSpacing: "0.06em", marginTop: 20, marginBottom: 10 }}>SERVICE APPOINTMENTS</div>
            {history.serviceHistory.length === 0 ? (
              <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16 }}>No service appointments.</p>
            ) : (
              history.serviceHistory.slice(0, 3).map((srv) => (
                <div key={srv.id} style={{ padding: "8px 12px", background: "#f9fafb", borderRadius: 8, marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{srv.vehicleName} ({srv.licensePlate})</span>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: srv.status === "Completed" ? "#16a34a" : "#ca8a04" }}>{srv.status}</span>
                  </div>
                  <span style={{ fontSize: 10, color: "#9ca3af" }}>{new Date(srv.appointmentDate).toLocaleDateString()}</span>
                  {srv.notes && <span style={{ fontSize: 11, color: "#4b5563", display: "block", marginTop: 4, fontStyle: "italic" }}>"{srv.notes}"</span>}
                </div>
              ))
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <button style={{ flex: 1, padding: 11, border: "1.5px solid #e5e7eb", borderRadius: 10, background: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>View History</button>
          <button style={{ flex: 1, padding: 11, background: "#111", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>New Sale</button>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }}
            style={{ flex: 1, padding: 11, border: "1.5px solid #e5e7eb", borderRadius: 10, background: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </span>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
            style={{ flex: 1, padding: 11, background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
