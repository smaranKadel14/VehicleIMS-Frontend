import { useState } from "react";
import type { FormEvent } from "react";
import { X } from "lucide-react";

interface RegisterCustomerModalProps {
  onClose: () => void;
  onSave: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  }) => Promise<void>;
}

export default function RegisterCustomerModal({
  onClose,
  onSave,
}: RegisterCustomerModalProps) {
  const [crmData, setCrmData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  const handleRegisterCustomer = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(crmData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#FFFFFF", borderRadius: 16, padding: 32, width: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Register CRM Customer</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
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
            <button type="button" onClick={onClose} style={{ flex: 1, padding: 12, border: "1.5px solid #E5E7EB", borderRadius: 8, background: "#FFFFFF", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: 12, background: "#111827", color: "#FFFFFF", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit" }}>
              {loading ? "Registering..." : "Create CRM Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
