import React from 'react';
import { Mail, Lock, ArrowRight, Fingerprint, ShieldCheck, Activity, HelpCircle } from 'lucide-react';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral relative overflow-hidden font-body">
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.08] pointer-events-none grayscale"
        style={{ 
          backgroundImage: 'url("/login-bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Login Card */}
      <div className="w-full max-w-[450px] z-10 animate-in fade-in zoom-in duration-700">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-secondary/50">
          
          {/* Dark Header */}
          <div className="bg-primary p-8 text-center space-y-1">
            <h1 className="text-neutral font-heading text-2xl tracking-widest uppercase">
              Precision Engine
            </h1>
            <p className="text-tertiary text-[10px] tracking-[0.3em] uppercase font-medium">
              Industrial Core Access
            </p>
          </div>

          {/* Form Content */}
          <div className="p-10 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-heading text-primary">Welcome Back, Rider</h2>
              <p className="text-tertiary text-sm">
                Enter your credentials to manage fleet inventory.
              </p>
            </div>

            <form className="space-y-5">
              <div className="space-y-1.5">
                <label className="label text-[11px] uppercase tracking-wider text-tertiary">
                  Institutional Email
                </label>
                <div className="relative group">
                  <input 
                    type="email" 
                    placeholder="name@precision.industrial"
                    className="input pr-10 bg-secondary/10 border-secondary/40 focus:bg-white transition-all"
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary group-focus-within:text-primary transition-colors" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-end">
                  <label className="label text-[11px] uppercase tracking-wider text-tertiary">
                    Security Key
                  </label>
                  <button type="button" className="text-[10px] font-bold text-primary hover:underline underline-offset-4 mb-1">
                    Forgot Password
                  </button>
                </div>
                <div className="relative group">
                  <input 
                    type="password" 
                    placeholder="••••••••••••"
                    className="input pr-10 bg-secondary/10 border-secondary/40 focus:bg-white transition-all"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary group-focus-within:text-primary transition-colors" />
                </div>
              </div>

              <button type="submit" className="w-full btn-primary h-12 gap-2 text-sm uppercase tracking-widest font-bold bg-black hover:bg-primary transition-all">
                Authenticate Access <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="relative flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary/30"></div>
              </div>
              <span className="relative px-4 bg-white text-[9px] uppercase tracking-[0.2em] text-tertiary font-bold">
                Compliance Check
              </span>
            </div>

            <button className="w-full btn-secondary h-12 gap-3 text-sm font-bold bg-secondary/20 hover:bg-secondary/40 border-none transition-all">
              <Fingerprint className="w-5 h-5" /> Biometric SSO Login
            </button>

            <div className="text-center pt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 rounded-full border border-secondary/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[9px] uppercase tracking-wider text-tertiary font-bold">
                  System Node: Central-01 // Secure Connection
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Footer */}
      <footer className="absolute bottom-6 w-full px-12 flex justify-between items-center text-[10px] uppercase tracking-widest text-tertiary font-bold z-10">
        <div className="flex gap-6 items-center">
          <span className="text-primary">Precision Industrialism</span>
          <span className="opacity-50">© 2024 Enginecore Global</span>
        </div>
        <div className="flex gap-8">
          <button className="hover:text-primary transition-colors flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3" /> Safety Protocols
          </button>
          <button className="hover:text-primary transition-colors flex items-center gap-1.5">
            <Activity className="w-3 h-3" /> Network Status
          </button>
          <button className="hover:text-primary transition-colors flex items-center gap-1.5">
            <HelpCircle className="w-3 h-3" /> Support
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Login;
