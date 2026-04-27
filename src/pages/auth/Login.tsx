import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, Activity, HelpCircle } from 'lucide-react';
import loginBg from '../../assets/auth-img/login-bg.png';

const Login: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral relative overflow-hidden font-body">
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.08] pointer-events-none grayscale"
        style={{ 
          backgroundImage: `url(${loginBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Login Card */}
      <div className="w-full max-w-[500px] z-10 animate-in fade-in zoom-in duration-700">
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

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1.5">
                <label className="label text-[11px] uppercase tracking-wider text-tertiary">
                  Institutional Email
                </label>
                <div className="relative group">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  <Link to="/forgot-password" title="Forgot Password" className="text-[10px] font-bold text-primary hover:underline underline-offset-4 mb-1">
                    Forgot Password
                  </Link>
                </div>
                <div className="relative group">
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="input pr-10 bg-secondary/10 border-secondary/40 focus:bg-white transition-all"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary group-focus-within:text-primary transition-colors" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={!isFormValid}
                className="w-full btn-primary h-12 gap-2 text-sm uppercase tracking-widest font-bold bg-black hover:bg-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
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

            <button className="w-full btn-secondary h-12 gap-3 text-sm font-bold bg-secondary/10 hover:bg-secondary/20 border border-secondary/30 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                />
              </svg>
              Sign in with Google
            </button>

            <div className="text-center pt-2">
              <div className="text-[11px] font-bold text-tertiary">
                NEED AN ACCOUNT? <Link to="/register" className="text-primary hover:underline underline-offset-4 ml-1">CREATE ONE HERE</Link>
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
