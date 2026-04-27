import React from 'react';
import { Mail, Phone, Lock, Eye, CheckCircle2, Globe, Zap, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import gradient from '../../assets/auth-img/Gradient.png';

const Register: React.FC = () => {
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    agreed: false
  });

  const isFormValid = 
    formData.firstName.trim() !== '' && 
    formData.lastName.trim() !== '' && 
    formData.email.trim() !== '' && 
    formData.phone.trim() !== '' && 
    formData.password.trim() !== '' && 
    formData.agreed;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-body">
      {/* Main Content Area */}
      <div className="flex-grow flex flex-col lg:flex-row items-center justify-center px-6 py-12 lg:px-24 gap-16 max-w-[1600px] mx-auto w-full">
        
        {/* Left Side: Brand & Hero */}
        <div className="flex-1 space-y-10 max-w-[600px]">
          <div className="space-y-6">
            <h1 className="text-6xl font-heading font-black tracking-tighter text-primary leading-[0.9]">
              ENGINEERED <br /> FOR SCALE.
            </h1>
            <p className="text-tertiary text-lg max-w-[450px] leading-relaxed">
              Access the global precision engine network. Manage inventory, fleet operations, and mission-critical parts with industrial-grade efficiency.
            </p>
          </div>

          {/* Hero Image Placeholder */}
          <div className="relative group">
            <div className="aspect-[16/9] bg-secondary/20 rounded-2xl overflow-hidden border border-secondary/50 shadow-inner">
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

        {/* Right Side: Registration Form */}
        <div className="w-full max-w-[500px]">
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
              <p className="text-tertiary text-sm">Enter your professional credentials to begin.</p>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold">First Name</label>
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
                  <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold">Last Name</label>
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

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold">Email</label>
                <div className="relative">
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input pl-10 bg-secondary/10" 
                    placeholder="name@precision.industrial" 
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold">Phone Number</label>
                <div className="relative">
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input pl-10 bg-secondary/10" 
                    placeholder="+1 (555) 000-0000" 
                  />
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-tertiary font-bold">Password</label>
                <div className="relative">
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    title="password" 
                    className="input pl-10 pr-10 bg-secondary/10" 
                    placeholder="••••••••••••" 
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
                  <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-tertiary hover:text-primary transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[9px] text-tertiary/70 uppercase tracking-wider leading-relaxed">
                  Minimum 12 characters with industrial-strength complexity.
                </p>
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
                className="w-full btn-primary h-14 uppercase tracking-[0.2em] font-bold text-sm bg-primary hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Initialize Registration
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer (Same as Login) */}
      <footer className="w-full bg-white border-t border-secondary/30 px-12 py-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-widest text-tertiary font-bold">
        <div className="flex gap-6 items-center">
          <span className="text-primary">Precision Industrialism</span>
          <span className="opacity-50">© 2024 Enginecore Global</span>
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
