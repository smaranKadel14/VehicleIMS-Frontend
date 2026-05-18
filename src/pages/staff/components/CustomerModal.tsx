import { useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";
import type { Customer, CustomerFormData } from "../CustomerDirectory";

interface CustomerModalProps {
  customer: Customer | null;
  onClose: () => void;
  onSave: (data: CustomerFormData) => void;
}

export default function CustomerModal({
  customer,
  onClose,
  onSave,
}: CustomerModalProps) {
  const [form, setForm] = useState<CustomerFormData>(
    customer
      ? {
          firstName: customer.name.split(" ")[0] || "",
          lastName: customer.name.split(" ").slice(1).join(" ") || "",
          username: "",
          email: "",
          phone: customer.phone,
          address: "",
          make: "",
          model: "",
          year: new Date().getFullYear(),
          vin: "",
          licensePlate: customer.vehiclePlates[0] || "",
          name: customer.name,
          status: customer.status,
          plate1: customer.vehiclePlates[0] ?? "",
          plate2: customer.vehiclePlates[1] ?? "",
        }
      : {
          firstName: "",
          lastName: "",
          username: "",
          email: "",
          phone: "",
          address: "",
          make: "",
          model: "",
          year: new Date().getFullYear(),
          vin: "",
          licensePlate: "",
          name: "",
          status: "Active",
          plate1: "",
          plate2: "",
        }
  );
  const [errors, setErrors] = useState<Partial<CustomerFormData>>({});

  const set = (key: keyof CustomerFormData) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = (): boolean => {
    const e: Partial<CustomerFormData> = {};
    if (!customer) {
      if (!form.firstName.trim()) e.firstName = "First name is required";
      if (!form.lastName.trim())  e.lastName  = "Last name is required";
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        e.email = "Valid email is required";
      }
      if (!form.licensePlate.trim()) e.licensePlate = "License plate is required";
    } else {
      if (!form.name?.trim()) e.name = "Full name is required";
    }
    if (!form.phone.trim()) e.phone = "Phone number is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (validate()) onSave(form);
  };

  const inputStyle: CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb",
    borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };
  const errStyle:   CSSProperties = { fontSize: 11, color: "#dc2626", marginTop: 4 };
  const labelStyle: CSSProperties = {
    fontSize: 11, fontWeight: 700, color: "#6b7280", display: "block",
    marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: customer ? 500 : 640, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{customer ? "Edit Customer Details" : "Register Client & Vehicle"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6b7280" }}>✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {customer ? (
            <>
              {/* Edit Existing Customer Details (Local Only) */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Full Name / Company *</label>
                <input value={form.name} onChange={set("name")} style={{ ...inputStyle, borderColor: errors.name ? "#dc2626" : "#e5e7eb" }} placeholder="e.g. Liam Vance" />
                {errors.name && <p style={errStyle}>{errors.name}</p>}
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Phone Number *</label>
                <input value={form.phone} onChange={set("phone")} style={{ ...inputStyle, borderColor: errors.phone ? "#dc2626" : "#e5e7eb" }} placeholder="e.g. +977 98..." />
                {errors.phone && <p style={errStyle}>{errors.phone}</p>}
              </div>
              <div>
                <label style={labelStyle}>Vehicle Plate 1</label>
                <input value={form.plate1} onChange={set("plate1")} style={inputStyle} placeholder="e.g. BA-1-PA-1234" />
              </div>
              <div>
                <label style={labelStyle}>Vehicle Plate 2</label>
                <input value={form.plate2} onChange={set("plate2")} style={inputStyle} placeholder="e.g. BA-1-PA-5678" />
              </div>
            </>
          ) : (
            <>
              {/* Complete Database DTO Fields for Customer + Vehicle Registration */}
              <div style={{ gridColumn: "1 / -1", borderBottom: "1.5px solid #f3f4f6", paddingBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#111", letterSpacing: "0.05em" }}>1. CLIENT PROFILE DETAILS</span>
              </div>
              <div>
                <label style={labelStyle}>First Name *</label>
                <input value={form.firstName} onChange={set("firstName")} style={{ ...inputStyle, borderColor: errors.firstName ? "#dc2626" : "#e5e7eb" }} placeholder="e.g. Liam" />
                {errors.firstName && <p style={errStyle}>{errors.firstName}</p>}
              </div>
              <div>
                <label style={labelStyle}>Last Name *</label>
                <input value={form.lastName} onChange={set("lastName")} style={{ ...inputStyle, borderColor: errors.lastName ? "#dc2626" : "#e5e7eb" }} placeholder="e.g. Vance" />
                {errors.lastName && <p style={errStyle}>{errors.lastName}</p>}
              </div>
              <div>
                <label style={labelStyle}>Username</label>
                <input value={form.username} onChange={set("username")} style={inputStyle} placeholder="Auto-generated if empty" />
              </div>
              <div>
                <label style={labelStyle}>Email Address *</label>
                <input type="email" value={form.email} onChange={set("email")} style={{ ...inputStyle, borderColor: errors.email ? "#dc2626" : "#e5e7eb" }} placeholder="liam@gmail.com" />
                {errors.email && <p style={errStyle}>{errors.email}</p>}
              </div>
              <div>
                <label style={labelStyle}>Phone Number *</label>
                <input value={form.phone} onChange={set("phone")} style={{ ...inputStyle, borderColor: errors.phone ? "#dc2626" : "#e5e7eb" }} placeholder="e.g. +977 98..." />
                {errors.phone && <p style={errStyle}>{errors.phone}</p>}
              </div>
              <div>
                <label style={labelStyle}>Home Address</label>
                <input value={form.address} onChange={set("address")} style={inputStyle} placeholder="Kathmandu, Nepal" />
              </div>

              <div style={{ gridColumn: "1 / -1", borderBottom: "1.5px solid #f3f4f6", paddingBottom: 6, marginTop: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#111", letterSpacing: "0.05em" }}>2. PRIMARY VEHICLE ASSET</span>
              </div>
              <div>
                <label style={labelStyle}>Vehicle Make *</label>
                <input value={form.make} onChange={set("make")} style={inputStyle} placeholder="e.g. Tesla" />
              </div>
              <div>
                <label style={labelStyle}>Vehicle Model *</label>
                <input value={form.model} onChange={set("model")} style={inputStyle} placeholder="e.g. Model Y" />
              </div>
              <div>
                <label style={labelStyle}>Production Year</label>
                <input type="number" value={form.year} onChange={set("year")} style={inputStyle} placeholder="2023" />
              </div>
              <div>
                <label style={labelStyle}>Chassis VIN Code</label>
                <input value={form.vin} onChange={set("vin")} style={inputStyle} placeholder="17-Digit VIN Number" />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>License Plate Code *</label>
                <input value={form.licensePlate} onChange={set("licensePlate")} style={{ ...inputStyle, borderColor: errors.licensePlate ? "#dc2626" : "#e5e7eb" }} placeholder="e.g. BA-1-PA-9999" />
                {errors.licensePlate && <p style={errStyle}>{errors.licensePlate}</p>}
              </div>
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 28, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 24px", border: "1.5px solid #e5e7eb", borderRadius: 8, background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: "10px 24px", background: "#111", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
            {customer ? "Save Changes" : "Register Client"}
          </button>
        </div>
      </div>
    </div>
  );
}
