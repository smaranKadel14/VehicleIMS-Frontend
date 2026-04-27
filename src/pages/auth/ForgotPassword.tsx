import React from 'react';
import { Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const isFormValid = email.trim() !== '';

  return (
    <div className="min-h-screen bg-neutral flex flex-col items-center justify-center p-6 font-body relative overflow-hidden">
      {/* Subtle Background Diagram */}
      <div className="absolute bottom-0 right-0 w-1/3 h-1/2 opacity-[0.03] pointer-events-none grayscale">
        <img src="/login-bg.png" alt="" className="w-full h-full object-contain object-right-bottom" />
      </div>

      <div className="w-full max-w-[450px] z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white rounded-xl shadow-2xl p-10 space-y-8 border border-secondary/30">
          <div className="space-y-3">
            <h1 className="text-3xl font-heading text-primary tracking-tight">Forgot Password</h1>
            <p className="text-tertiary text-sm leading-relaxed">
              Enter the email associated with your account and we'll send a link to reset your password.
            </p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] text-tertiary font-bold">
                Email Address
              </label>
              <div className="relative group">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@precision-engine.com"
                  className="w-full py-3 bg-transparent border-b border-secondary/50 focus:border-primary focus:outline-none transition-colors placeholder:text-secondary"
                />
                <Mail className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary group-focus-within:text-primary transition-colors" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!isFormValid}
              className="w-full btn-primary h-12 uppercase tracking-widest font-bold text-sm bg-black hover:bg-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Send Reset Link
            </button>
          </form>

          <div className="pt-4 flex flex-col items-center gap-6">
            <div className="w-full flex items-center justify-center">
              <div className="w-1/4 border-t border-secondary/20"></div>
              <Link 
                to="/login" 
                className="mx-4 flex items-center gap-2 text-[10px] font-bold text-tertiary hover:text-primary transition-colors group"
              >
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" /> 
                BACK TO LOGIN
              </Link>
              <div className="w-1/4 border-t border-secondary/20"></div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center items-center gap-2 opacity-40">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-primary">
            Secured by Industrial-Grade Encryption
          </span>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
