import React, { useState } from 'react';
import { Mail, Phone, Lock, Eye, CheckCircle2, Globe, Zap, ArrowLeft, Loader2, AlertCircle, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import customerService from '../../services/customerService';
import gradient from '../../assets/auth-img/Gradient.png';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    make: '',
    model: '',
    year: '',
    vin: '',
    licensePlate: '',
    agreed: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const isFormValid = 
    formData.firstName.trim() !== '' && 
    formData.lastName.trim() !== '' && 
    formData.email.trim() !== '' && 
    formData.phone.trim() !== '' && 
    formData.password.trim() !== '' && 
    formData.address.trim() !== '' && 
    formData.make.trim() !== '' && 
    formData.model.trim() !== '' && 
    formData.year.trim() !== '' && 
    formData.vin.trim() !== '' && 
    formData.licensePlate.trim() !== '' && 
    formData.agreed &&
    !loading;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      setLoading(true);
      setError(null);
      await customerService.register({
        username: formData.email.trim().split("@")[0] || `cust${Math.floor(Math.random() * 1000)}`,
        email: formData.email.trim(),
        passwordHash: formData.password, // backend handles secure password hashing
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: Number(formData.year) || 2026,
        vin: formData.vin.trim(),
        licensePlate: formData.licensePlate.trim()
      });
      navigate('/login', { state: { message: "Account created successfully! Please log in." } });
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || "Registration failed. Please check all details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col font-body overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-grow overflow-y-auto flex flex-col lg:flex-row items-center justify-center px-6 py-8 lg:px-24 gap-12 max-w-[1600px] mx-auto w-full">
        
        {/* Left Side: Brand & Hero */}
        <div className="flex-1 space-y-8 max-w-[600px] hidden lg:block">
          <div className="space-y-6">
            <h1 className="text-6xl font-heading font-black tracking-tighter text-primary leading-[0.9]">
              ENGINEERED <br /> FOR SCALE.
            </h1>
            <p className="text-tertiary text-lg max-w-[450px] leading-relaxed">
              Register yourself and secure your primary vehicle under our global maintenance portal. Instantly schedule precision mechanical service.
            </p>
          </div>

          {/* Hero Image */}
          <div className="relative group">
            <div className="aspect-video bg-secondary/20 rounded-2xl overflow-hidden border border-secondary/50 shadow-inner">
              <img 
                src={gradient} 
                alt="Industrial Engineering" 
                className="w-full h-full object-cover transition-opacity duration-500"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl -z-10" />
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-8 pt-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">2.4M</span>
                <CheckCircle2 className="w-4 h-4 text-primary opacity-50" />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-tertiary font-bold">Verified Parts</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">18ms</span>
                <Zap className="w-4 h-4 text-primary opacity-50" />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-tertiary font-bold">API Latency</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">Global</span>
                <Globe className="w-4 h-4 text-primary opacity-50" />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-tertiary font-bold">Compliance</p>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Form (Scrollable wrapper to fit more fields) */}
        <div className="w-full max-w-[650px] h-full lg:max-h-[85vh] overflow-y-auto pr-2 py-4">
          <div className="card shadow-2xl p-10 space-y-8 bg-white border-secondary/30 relative">
            
            {/* Back to Login Link */}
            <Link 
              to="/login" 
              className="absolute top-6 right-8 flex items-center gap-1.5 text-[10px] font-bold text-tertiary hover:text-primary transition-colors group"
            >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" /> 
              BACK TO LOGIN
            </Link>

            <div className="space-y-2">
              <h2 className="text-3xl font-heading text-primary tracking-tight">Create Account</h2>
              <p className="text-tertiary text-sm">Enter your personal credentials and first vehicle details to register.</p>
            </div>

            <form className="space-y-6" onSubmit={handleRegister}>
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-shake">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-red-600 uppercase tracking-tight">{error}</p>
                </div>
              )}

              {/* ── Owner Credentials Section ── */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary border-b border-secondary/20 pb-2">Owner Credentials & Location</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold">First Name *</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="input bg-secondary/10" 
                      placeholder="John" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold">Last Name *</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="input bg-secondary/10" 
                      placeholder="Doe" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold">Email Address *</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input pl-10 bg-secondary/10" 
                        placeholder="john.doe@email.com" 
                      />
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold">Phone Number *</label>
                    <div className="relative">
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input pl-10 bg-secondary/10" 
                        placeholder="+977-9800000000" 
                      />
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold">Home Address *</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="input pl-10 bg-secondary/10" 
                      placeholder="Kathmandu, Nepal" 
                    />
                    <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold">Password *</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="input pl-10 pr-10 bg-secondary/10" 
                      placeholder="••••••••••••" 
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-tertiary hover:text-primary transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Vehicle Info Section ── */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary border-b border-secondary/20 pb-2">Primary Vehicle Registration</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold">Vehicle Make *</label>
                    <input 
                      type="text" 
                      name="make"
                      value={formData.make}
                      onChange={handleChange}
                      className="input bg-secondary/10" 
                      placeholder="e.g. Toyota" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold">Vehicle Model *</label>
                    <input 
                      type="text" 
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      className="input bg-secondary/10" 
                      placeholder="e.g. Corolla" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold">Year *</label>
                    <input 
                      type="number" 
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="input bg-secondary/10" 
                      placeholder="2022" 
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold">License Plate *</label>
                    <input 
                      type="text" 
                      name="licensePlate"
                      value={formData.licensePlate}
                      onChange={handleChange}
                      className="input bg-secondary/10" 
                      placeholder="BA 1 PA 1234" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold">Vehicle Identification Number (VIN) *</label>
                  <input 
                    type="text" 
                    name="vin"
                    value={formData.vin}
                    onChange={handleChange}
                    className="input bg-secondary/10 uppercase" 
                    placeholder="1FA6P8CF5HXXXXXX" 
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 py-2">
                <input 
                  type="checkbox" 
                  name="agreed"
                  id="terms"
                  checked={formData.agreed}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 rounded border-secondary text-primary focus:ring-primary/20 accent-primary" 
                />
                <label htmlFor="terms" className="text-xs text-tertiary leading-relaxed">
                  I agree to the <button type="button" className="text-primary font-bold hover:underline">Terms of Service</button> and <button type="button" className="text-primary font-bold hover:underline">Privacy Policy</button>.
                </label>
              </div>

              <button 
                type="submit" 
                disabled={!isFormValid}
                className="w-full btn-primary h-14 uppercase tracking-[0.2em] font-bold text-sm bg-primary hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Registering...
                  </>
                ) : (
                  "Complete Customer Registration"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-secondary/30 px-12 py-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-widest text-tertiary font-bold">
        <div className="flex gap-6 items-center">
          <span className="text-primary">Enginecore Portal</span>
          <span className="opacity-50">© 2026 Enginecore IMS</span>
        </div>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          <button className="hover:text-primary transition-colors">Terms of Service</button>
          <button className="hover:text-primary transition-colors">Privacy Policy</button>
          <button className="hover:text-primary transition-colors">System Status</button>
          <button className="hover:text-primary transition-colors">Global Compliance</button>
        </div>
      </footer>
    </div>
  );
};

export default Register;
