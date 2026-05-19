import { useMemo, useRef, useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import customerService from "../../services/customerService";
import type { VehicleResponse } from "../../services/customerService";
import {
  Bell,
  LockKeyhole,
  Smartphone,
  Upload,
  ArrowLeft
} from "lucide-react";

type ProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  portalId: string;
  tierStatus: string;
  lastActive: string;
};

const initialProfile: ProfileData = {
  firstName: "Client",
  lastName: "Profile",
  email: "client@enginecore.global",
  phone: "Not Provided",
  address: "Not Provided",
  portalId: "EC-PENDING",
  tierStatus: "Customer Account",
  lastActive: "Active Now",
};

const securityItems = [
  {
    icon: LockKeyhole,
    title: "Account Password",
    description: "Managed via EngineCore Identity service",
    action: "Change Password",
  },
  {
    icon: Smartphone,
    title: "Two-Factor Authentication",
    description: "Enabled via authenticator app",
    action: "Configure",
  },
];

interface InfoFieldProps {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function InfoField({
  label,
  value,
  isEditing,
  onChange,
  disabled = false,
}: InfoFieldProps) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary">
        {label}
      </p>

      {isEditing && !disabled ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#f8f8f6] border border-secondary/30 rounded-xl px-4 py-3 text-sm font-semibold text-primary focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
        />
      ) : (
        <div className={`rounded-xl px-4 py-3 text-sm font-semibold text-primary border border-secondary/10 ${disabled ? "bg-secondary/10 text-primary/50 cursor-not-allowed" : "bg-[#fcfcfb]"}`}>
          {value || <span className="text-tertiary italic font-normal">Not Provided</span>}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [draft, setDraft] = useState<ProfileData>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Live database vehicles and loader states
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const initials = useMemo(() => {
    const name = `${profile.firstName} ${profile.lastName}`.trim();
    return name
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("");
  }, [profile.firstName, profile.lastName]);

  const fetchProfile = async () => {
    const user = authService.getCurrentUser();
    if (!user?.userName) return;

    try {
      setLoading(true);
      const res = await customerService.search(user.userName);
      if (res && res.length > 0) {
        const matchedCust = res[0];
        setCustomerId(matchedCust.id);
        const mappedProfile: ProfileData = {
          firstName: matchedCust.firstName,
          lastName: matchedCust.lastName,
          email: matchedCust.email,
          phone: matchedCust.phone,
          address: matchedCust.address || "",
          portalId: `EC-${matchedCust.id}-CUST`,
          tierStatus: "Verified Customer",
          lastActive: "Active Now"
        };
        setProfile(mappedProfile);
        setDraft(mappedProfile);
        setVehicles(matchedCust.vehicles || []);
      }
    } catch (err) {
      console.error("Failed to load customer profile:", err);
      setErrorMsg("Unable to retrieve database records for your profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setAvatarPreview(localPreview);
  };

  const startEditing = () => {
    setDraft(profile);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const saveChanges = async () => {
    if (!customerId) return;
    try {
      setUpdating(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const updated = await customerService.updateCustomer(customerId, {
        firstName: draft.firstName,
        lastName: draft.lastName,
        phone: draft.phone,
        address: draft.address,
      });

      const mappedProfile: ProfileData = {
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        phone: updated.phone,
        address: updated.address || "",
        portalId: `EC-${updated.id}-CUST`,
        tierStatus: "Verified Customer",
        lastActive: "Active Now"
      };

      setProfile(mappedProfile);
      setIsEditing(false);
      setSuccessMsg("Profile details successfully updated and database synchronized!");
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setErrorMsg("Failed to update profile records on the server. Please check validation rules.");
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f3] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-black/10 border-t-black animate-spin" />
        <p className="text-xs uppercase tracking-[0.2em] font-black text-tertiary">Connecting to Enginecore ledger...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f3] text-primary">
      <div className="flex flex-col min-h-screen">
        {/* Sleek Minimalist Top Navigation Header (No Sidebar Navbar!) */}
        <header className="sticky top-0 z-40 border-b border-secondary/20 bg-white/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-6 sm:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center justify-center w-9 h-9 rounded-xl border border-secondary/20 hover:bg-neutral hover:text-black transition-all text-tertiary"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-primary">Account Settings</p>
                <p className="text-[10px] text-tertiary font-medium">Verify credentials & fleet registry</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button className="text-tertiary hover:text-primary transition-all relative">
                <Bell className="h-5 w-5" />
              </button>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-xs font-black text-white shadow-md select-none">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Profile Content Container */}
        <main className="flex-1 py-10 px-6 sm:px-8">
          <div className="mx-auto max-w-6xl">
            {/* Notifications */}
            {successMsg && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold uppercase tracking-wider shadow-sm animate-fade-in">
                <span>✅</span>
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold uppercase tracking-wider shadow-sm animate-fade-in">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid gap-8 xl:grid-cols-12">
              {/* Left Column: Avatar & Metadata */}
              <div className="space-y-8 xl:col-span-4">
                <section className="card rounded-2xl bg-white p-6 shadow-sm border border-secondary/10 flex flex-col items-center text-center">
                  <div className="relative mb-5 group">
                    <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl border-4 border-secondary/20 bg-[#151515] text-3xl font-black text-white shadow-inner transition-transform duration-300 group-hover:scale-105">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Profile preview"
                          className="h-full w-full object-cover animate-fade-in"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                  </div>

                  <h2 className="text-2xl font-heading font-extrabold text-primary tracking-tight">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-tertiary px-3 py-1 bg-[#f5f5f3] rounded-lg">
                    {profile.tierStatus}
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-neutral hover:text-black border border-black shadow-sm"
                  >
                    <Upload className="h-4 w-4" />
                    Update Photo
                  </button>

                  <p className="mt-4 text-[10px] text-tertiary uppercase tracking-wider font-semibold">
                    Client Avatar Photo
                  </p>
                </section>

                <section className="card rounded-2xl bg-[#eaeaeb] p-6 border border-secondary/20 shadow-inner">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary mb-5">
                    Account Metadata
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-black/5 pb-3 text-xs">
                      <span className="text-tertiary font-bold uppercase tracking-wider">Account ID</span>
                      <span className="font-mono font-bold text-primary">{profile.portalId}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-black/5 pb-3 text-xs">
                      <span className="text-tertiary font-bold uppercase tracking-wider">Status Tier</span>
                      <span className="font-bold text-primary">{profile.tierStatus}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-tertiary font-bold uppercase tracking-wider">Last Sync</span>
                      <span className="font-bold text-primary">{profile.lastActive}</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Edit Forms & Security Details */}
              <div className="space-y-8 xl:col-span-8">
                <section className="card rounded-2xl bg-white p-6 sm:p-8 border border-secondary/10 shadow-sm">
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-heading font-extrabold text-primary tracking-tight">
                        Personal Information
                      </h2>
                      <p className="text-xs text-tertiary mt-1">Authorized client profile parameters.</p>
                    </div>

                    {isEditing ? (
                      <div className="flex gap-3">
                        <button
                          type="button"
                          disabled={updating}
                          onClick={cancelEditing}
                          className="px-4 py-2 border border-secondary/30 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-neutral transition-all disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={updating}
                          onClick={saveChanges}
                          className="px-4 py-2 bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-neutral hover:text-black border border-black transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                        >
                          {updating && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                          Save
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={startEditing}
                        className="px-4 py-2 bg-[#f5f5f3] hover:bg-[#eaeaea] rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-secondary/20 shadow-sm"
                      >
                        Edit Details
                      </button>
                    )}
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <InfoField
                      label="First Name"
                      value={isEditing ? draft.firstName : profile.firstName}
                      isEditing={isEditing}
                      onChange={(value) => setDraft((prev) => ({ ...prev, firstName: value }))}
                    />

                    <InfoField
                      label="Last Name"
                      value={isEditing ? draft.lastName : profile.lastName}
                      isEditing={isEditing}
                      onChange={(value) => setDraft((prev) => ({ ...prev, lastName: value }))}
                    />

                    <InfoField
                      label="Email Address"
                      value={profile.email}
                      isEditing={isEditing}
                      onChange={() => {}}
                      disabled
                    />

                    <InfoField
                      label="Phone Number"
                      value={isEditing ? draft.phone : profile.phone}
                      isEditing={isEditing}
                      onChange={(value) => setDraft((prev) => ({ ...prev, phone: value }))}
                    />

                    <div className="md:col-span-2">
                      <InfoField
                        label="Primary Address"
                        value={isEditing ? draft.address : profile.address}
                        isEditing={isEditing}
                        onChange={(value) => setDraft((prev) => ({ ...prev, address: value }))}
                      />
                    </div>
                  </div>
                </section>

                <section className="card rounded-2xl bg-white p-6 sm:p-8 border border-secondary/10 shadow-sm">
                  <div className="mb-6">
                    <h2 className="text-2xl font-heading font-extrabold text-primary tracking-tight">
                      Security & Access Registry
                    </h2>
                    <p className="text-xs text-tertiary mt-1">Multi-factor authentications & credential logs.</p>
                  </div>

                  <div className="space-y-4">
                    {securityItems.map(({ icon: Icon, title, description, action }) => (
                      <div
                        key={title}
                        className="flex flex-col gap-4 rounded-2xl bg-[#fcfcfb] border border-secondary/10 p-5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5f5f3] text-primary border border-secondary/20">
                            <Icon className="h-5 w-5" />
                          </div>

                          <div>
                            <h3 className="text-sm font-black text-primary">{title}</h3>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-tertiary mt-1">
                              {description}
                            </p>
                          </div>
                        </div>

                        <button className="px-4 py-2 text-xs font-black uppercase tracking-wider bg-white border border-secondary/30 rounded-xl hover:bg-neutral hover:text-black transition-all shadow-sm">
                          {action}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Fleet Summary Card in Profile */}
                <section className="card rounded-2xl bg-white p-6 sm:p-8 border border-secondary/10 shadow-sm">
                  <div className="mb-6 flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-heading font-extrabold text-primary tracking-tight">
                        Registered Maintenance Assets ({vehicles.length})
                      </h3>
                      <p className="text-xs text-tertiary mt-1">Directly bound to your service registry.</p>
                    </div>

                    <button
                      onClick={() => navigate("/dashboard", { state: { activeView: "garage" } })}
                      className="px-4 py-2 text-xs font-black uppercase tracking-wider bg-black text-white hover:bg-neutral hover:text-black border border-black rounded-xl transition-all shadow-sm"
                    >
                      Manage Fleet
                    </button>
                  </div>
                  
                  {vehicles.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-secondary/30 p-8 text-center bg-[#fcfcfb]">
                      <p className="text-xs font-bold uppercase tracking-widest text-tertiary">No fleet vehicles currently registered.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {vehicles.map((veh) => (
                        <div key={veh.id} className="rounded-2xl bg-[#fcfcfb] border border-secondary/15 p-5 flex flex-col justify-between hover:border-black/30 transition-all shadow-sm">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="font-black text-sm text-primary uppercase tracking-tight">{veh.make} {veh.model}</h4>
                              <span className="rounded-lg bg-black text-white px-2.5 py-0.5 text-[9px] font-black font-mono tracking-widest">{veh.year}</span>
                            </div>
                            <p className="text-[9px] uppercase font-black text-tertiary tracking-widest mt-3.5">LICENSE PLATE</p>
                            <p className="text-xs font-mono font-bold text-primary bg-[#f5f5f3] px-2.5 py-1 rounded-lg inline-block border border-secondary/20 mt-1">{veh.licensePlate}</p>
                          </div>
                          <div className="mt-4 pt-4 border-t border-secondary/10 flex justify-between items-center text-[9px] font-black text-tertiary tracking-widest">
                            <span>VIN SPECIFICATION</span>
                            <span className="font-mono text-primary font-bold">{veh.vin}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
