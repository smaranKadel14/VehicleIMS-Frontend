import { useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  Bell,
  LayoutDashboard,
  Package,
  Wrench,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  LockKeyhole,
  Smartphone,
  History,
  TriangleAlert,
  Upload,
  CircleHelp,
} from "lucide-react";

type ProfileData = {
  fullName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  portalId: string;
  tierStatus: string;
  lastActive: string;
};

const initialProfile: ProfileData = {
  fullName: "Marcus V. Sterling",
  email: "m.sterling@enginecore.industrial",
  phone: "+1 (555) 012-8844",
  department: "Global Logistics & Distribution",
  role: "Senior Logistics Lead",
  portalId: "EC-99210-MV",
  tierStatus: "Administrator",
  lastActive: "2m ago",
};

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Package, label: "Inventory" },
  { icon: Wrench, label: "Work Orders" },
  { icon: Truck, label: "Logistics" },
  { icon: BarChart3, label: "Analytics" },
];

const securityItems = [
  {
    icon: LockKeyhole,
    title: "Account Password",
    description: "Last changed 4 months ago",
    action: "Change",
  },
  {
    icon: Smartphone,
    title: "Two-Factor Authentication",
    description: "Enabled via authenticator app",
    action: "Configure",
  },
  {
    icon: History,
    title: "Login History",
    description: "Review recent session activity",
    action: "View All",
  },
];

function InfoField({
  label,
  value,
  isEditing,
  onChange,
}: {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-tertiary">
        {label}
      </p>

      {isEditing ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input bg-secondary/10"
        />
      ) : (
        <div className="rounded-xl bg-secondary/20 px-4 py-3 text-sm font-medium text-primary">
          {value}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(initialProfile);
  const [draft, setDraft] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const initials = useMemo(() => {
    return profile.fullName
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("");
  }, [profile.fullName]);

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

  const saveChanges = () => {
    setProfile(draft);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f3] text-primary">
      <div className="flex min-h-screen">
        <aside className="hidden w-[250px] shrink-0 flex-col bg-[#2b2b2b] text-white lg:flex">
          <div className="border-b border-white/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black font-black">
                EC
              </div>
              <div>
                <h2 className="font-heading text-lg font-extrabold leading-none">
                  EngineCore
                </h2>
                <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-white/55">
                  V-Series Portal
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6">
            <div className="space-y-2">
              {navItems.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-white/65 transition hover:bg-white/6 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </nav>

          <div className="border-t border-white/10 p-4">
            <button className="mb-2 flex w-full items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium">
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/65 transition hover:bg-white/6 hover:text-white">
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-secondary/40 bg-white">
            <div className="flex h-16 items-center justify-between px-5 sm:px-8">
              <div>
                <p className="text-sm font-semibold">Account Settings</p>
              </div>

              <div className="flex items-center gap-4">
                <button className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-tertiary sm:inline">
                  Support
                </button>
                <button className="text-tertiary transition hover:text-primary">
                  <Bell className="h-5 w-5" />
                </button>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-neutral">
                  {initials}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-7xl">
              <div className="mb-8">
                <h1 className="font-heading text-4xl font-extrabold tracking-tight text-primary">
                  User Profile
                </h1>
                <p className="mt-2 text-base text-primary/70">
                  Manage your industrial portal credentials and preferences.
                </p>
              </div>

              <div className="grid gap-6 xl:grid-cols-12">
                <div className="space-y-6 xl:col-span-4">
                  <section className="card rounded-2xl bg-white p-6 shadow-sm">
                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-5">
                        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-secondary/30 bg-[#151515] text-3xl font-black text-white shadow-sm">
                          {avatarPreview ? (
                            <img
                              src={avatarPreview}
                              alt="Profile preview"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            initials
                          )}
                        </div>
                      </div>

                      <h2 className="text-2xl font-heading font-extrabold text-primary">
                        {profile.fullName}
                      </h2>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-tertiary">
                        {profile.role}
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
                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-bold text-white transition hover:bg-primary"
                      >
                        <Upload className="h-4 w-4" />
                        Update Photo
                      </button>

                      <p className="mt-3 text-xs text-tertiary">
                        Local preview only for now. Replace this with Cloudinary upload later.
                      </p>
                    </div>
                  </section>

                  <section className="card rounded-2xl bg-[#f0f0ef] p-6 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-tertiary">
                      System Access
                    </p>

                    <div className="mt-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-secondary/50 pb-3 text-sm">
                        <span className="text-primary/65">Portal ID</span>
                        <span className="font-bold">{profile.portalId}</span>
                      </div>

                      <div className="flex items-center justify-between border-b border-secondary/50 pb-3 text-sm">
                        <span className="text-primary/65">Tier Status</span>
                        <span className="font-bold">{profile.tierStatus}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-primary/65">Last Active</span>
                        <span className="font-bold">{profile.lastActive}</span>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="space-y-6 xl:col-span-8">
                  <section className="card rounded-2xl bg-white p-6 sm:p-7 shadow-sm">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <h2 className="text-2xl font-heading font-extrabold text-primary">
                        Personal Information
                      </h2>

                      {isEditing ? (
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="btn-inverted px-4 py-2 text-xs font-bold uppercase tracking-[0.16em]"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={saveChanges}
                            className="btn-primary px-4 py-2 text-xs font-bold uppercase tracking-[0.16em]"
                          >
                            Save Changes
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={startEditing}
                          className="text-xs font-bold uppercase tracking-[0.16em] text-primary transition hover:text-primary/70"
                        >
                          Edit Details
                        </button>
                      )}
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <InfoField
                        label="Full Name"
                        value={isEditing ? draft.fullName : profile.fullName}
                        isEditing={isEditing}
                        onChange={(value) => setDraft((prev) => ({ ...prev, fullName: value }))}
                      />

                      <InfoField
                        label="Email Address"
                        value={isEditing ? draft.email : profile.email}
                        isEditing={isEditing}
                        onChange={(value) => setDraft((prev) => ({ ...prev, email: value }))}
                      />

                      <InfoField
                        label="Phone Number"
                        value={isEditing ? draft.phone : profile.phone}
                        isEditing={isEditing}
                        onChange={(value) => setDraft((prev) => ({ ...prev, phone: value }))}
                      />

                      <InfoField
                        label="Department"
                        value={isEditing ? draft.department : profile.department}
                        isEditing={isEditing}
                        onChange={(value) => setDraft((prev) => ({ ...prev, department: value }))}
                      />
                    </div>
                  </section>

                  <section className="card rounded-2xl bg-white p-6 sm:p-7 shadow-sm">
                    <div className="mb-2">
                      <h2 className="text-2xl font-heading font-extrabold text-primary">
                        Security & Credentials
                      </h2>
                      <p className="mt-2 text-sm text-primary/65">
                        Protect your industrial access with multi-factor authentication.
                      </p>
                    </div>

                    <div className="mt-6 space-y-4">
                      {securityItems.map(({ icon: Icon, title, description, action }) => (
                        <div
                          key={title}
                          className="flex flex-col gap-4 rounded-2xl bg-secondary/15 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                              <Icon className="h-5 w-5" />
                            </div>

                            <div>
                              <h3 className="text-sm font-extrabold text-primary">{title}</h3>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-tertiary">
                                {description}
                              </p>
                            </div>
                          </div>

                          <button className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-primary shadow-sm transition hover:bg-secondary/30">
                            {action}
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 border-t border-secondary/40 pt-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-sm font-bold text-red-600">
                          <TriangleAlert className="h-4 w-4" />
                          Danger Zone
                        </div>

                        <button className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100">
                          Deactivate Portal Access
                        </button>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-dashed border-secondary/70 bg-white/70 p-5">
                    <div className="flex items-start gap-3">
                      <CircleHelp className="mt-0.5 h-5 w-5 text-tertiary" />
                      <p className="text-sm text-primary/70">
                        Customer vehicle deatils
                      </p>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
